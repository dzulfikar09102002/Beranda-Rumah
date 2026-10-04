import { useEffect, useRef, useState } from 'react';
import { products as productsRoute } from '@/routes/store';
import type { Paginated, StoreProduct } from './types';

export type Sort = 'popular' | 'name' | 'cheap' | 'expensive';

export type FeedFilters = {
    search: string;
    category: number | null;
    sort: Sort;
};

type Feed = {
    items: StoreProduct[];
    page: number;
    lastPage: number;
    total: number;
};

type Inflight = {
    promise: Promise<Paginated<StoreProduct>>;
    controller: AbortController;
};

const DEFAULT_FILTERS: FeedFilters = {
    search: '',
    category: null,
    sort: 'popular',
};

function filterKey({ search, category, sort }: FeedFilters): string {
    return `${search.trim().toLowerCase()}|${category ?? ''}|${sort}`;
}

function toFeed(page: Paginated<StoreProduct>): Feed {
    return {
        items: page.data,
        page: page.current_page,
        lastPage: page.last_page,
        total: page.total,
    };
}

function isAbort(error: unknown): boolean {
    return error instanceof DOMException && error.name === 'AbortError';
}

export function useDebouncedValue<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay);

        return () => window.clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

/**
 * Server-paginated product feed.
 *
 * - every page response is cached per filter combination, so going back to a
 *   previous search/category is instant;
 * - concurrent requests for the same page are de-duplicated;
 * - switching filters aborts requests that belong to the old filters;
 * - each loaded page chains a background prefetch of the next one, so
 *   "load more" usually resolves from cache.
 */
export function useProductFeed(
    initial: Paginated<StoreProduct>,
    filters: FeedFilters,
) {
    const key = filterKey(filters);
    const initialKey = filterKey(DEFAULT_FILTERS);

    const cache = useRef(
        new Map<string, Paginated<StoreProduct>>([
            [`${initialKey}#1`, initial],
        ]),
    );
    const inflight = useRef(new Map<string, Inflight>());

    const [feeds, setFeeds] = useState<Record<string, Feed>>({
        [initialKey]: toFeed(initial),
    });
    const [shownKey, setShownKey] = useState(initialKey);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const request = (
        target: FeedFilters,
        page: number,
    ): Promise<Paginated<StoreProduct>> => {
        const pageKey = `${filterKey(target)}#${page}`;
        const cached = cache.current.get(pageKey);

        if (cached) {
            return Promise.resolve(cached);
        }

        const running = inflight.current.get(pageKey);

        if (running) {
            return running.promise;
        }

        const query: Record<string, string | number> = {
            sort: target.sort,
            page,
        };

        if (target.search.trim()) {
            query.search = target.search.trim();
        }

        if (target.category !== null) {
            query.category = target.category;
        }

        const controller = new AbortController();
        const promise = fetch(productsRoute.url({ query }), {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return response.json() as Promise<Paginated<StoreProduct>>;
            })
            .then((data) => {
                cache.current.set(pageKey, data);

                return data;
            })
            .finally(() => inflight.current.delete(pageKey));

        inflight.current.set(pageKey, { promise, controller });

        return promise;
    };

    const prefetch = (target: FeedFilters, page = 1) => {
        request(target, page).catch(() => undefined);
    };

    // Chain: once a page is known, warm up the next one in the background.
    const prefetchNext = (
        target: FeedFilters,
        data: Paginated<StoreProduct>,
    ) => {
        if (data.current_page < data.last_page) {
            prefetch(target, data.current_page + 1);
        }
    };

    useEffect(() => {
        for (const [pageKey, { controller }] of inflight.current) {
            if (!pageKey.startsWith(`${key}#`)) {
                controller.abort();
            }
        }

        const existing = feeds[key];

        if (existing) {
            if (existing.page < existing.lastPage) {
                prefetch(filters, existing.page + 1);
            }

            return;
        }

        request(filters, 1)
            .then((data) => {
                setError(null);
                setFeeds((current) => ({ ...current, [key]: toFeed(data) }));
                prefetchNext(filters, data);
            })
            .catch((reason: unknown) => {
                if (!isAbort(reason)) {
                    setError(
                        'Gagal memuat produk. Periksa koneksi lalu coba lagi.',
                    );
                }
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const current = feeds[key];

    if (current && shownKey !== key) {
        setShownKey(key);
    }

    const shown = current ?? feeds[shownKey];

    const loadMore = () => {
        if (!current || loadingMore || current.page >= current.lastPage) {
            return;
        }

        setLoadingMore(true);
        request(filters, current.page + 1)
            .then((data) => {
                setError(null);
                setFeeds((all) => {
                    const feed = all[key];

                    if (!feed || data.current_page !== feed.page + 1) {
                        return all;
                    }

                    const ids = new Set(feed.items.map((item) => item.id));

                    return {
                        ...all,
                        [key]: {
                            items: [
                                ...feed.items,
                                ...data.data.filter(
                                    (item) => !ids.has(item.id),
                                ),
                            ],
                            page: data.current_page,
                            lastPage: data.last_page,
                            total: data.total,
                        },
                    };
                });
                prefetchNext(filters, data);
            })
            .catch((reason: unknown) => {
                if (!isAbort(reason)) {
                    setError('Gagal memuat halaman berikutnya.');
                }
            })
            .finally(() => setLoadingMore(false));
    };

    const retry = () => {
        setError(null);
        cache.current.delete(`${key}#1`);
        request(filters, 1)
            .then((data) => {
                setFeeds((all) => ({ ...all, [key]: toFeed(data) }));
                prefetchNext(filters, data);
            })
            .catch((reason: unknown) => {
                if (!isAbort(reason)) {
                    setError('Masih gagal memuat produk.');
                }
            });
    };

    return {
        items: shown?.items ?? [],
        total: shown?.total ?? 0,
        page: shown?.page ?? 1,
        lastPage: shown?.lastPage ?? 1,
        hasMore: current ? current.page < current.lastPage : false,
        /** true while results for the current filters haven't arrived yet */
        pending: !current,
        loadingMore,
        error,
        loadMore,
        retry,
        prefetch,
    };
}
