import { useEffect, useRef, useState } from 'react';
import { products as productsRoute } from '@/routes/store';
import type { Paginated, StoreProduct } from './types';

export type Sort = 'popular' | 'name' | 'cheap' | 'expensive';

export type FeedFilters = {
    search: string;
    category: number | null;
    sort: Sort;
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

export function filterKey({ search, category, sort }: FeedFilters): string {
    return `${search.trim().toLowerCase()}|${category ?? ''}|${sort}`;
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
 * Server-paginated product list, one page at a time.
 *
 * - every page response is cached per filter + page, so revisiting a page or
 *   a previous search is instant;
 * - concurrent requests for the same page are de-duplicated;
 * - switching filters aborts requests that belong to the old filters;
 * - each loaded page chains a background prefetch of its neighbours, so
 *   clicking "next"/"previous" usually resolves from cache.
 */
export function useProductFeed(
    initial: Paginated<StoreProduct>,
    filters: FeedFilters,
    page: number,
) {
    const fKey = filterKey(filters);
    const key = `${fKey}#${page}`;
    const initialKey = `${filterKey(DEFAULT_FILTERS)}#1`;

    const cache = useRef(
        new Map<string, Paginated<StoreProduct>>([[initialKey, initial]]),
    );
    const inflight = useRef(new Map<string, Inflight>());

    const [pages, setPages] = useState<Record<string, Paginated<StoreProduct>>>(
        { [initialKey]: initial },
    );
    const [shownKey, setShownKey] = useState(initialKey);
    const [error, setError] = useState<string | null>(null);

    const request = (
        target: FeedFilters,
        targetPage: number,
    ): Promise<Paginated<StoreProduct>> => {
        const pageKey = `${filterKey(target)}#${targetPage}`;
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
            page: targetPage,
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

    const prefetch = (target: FeedFilters, targetPage = 1) => {
        if (targetPage >= 1) {
            request(target, targetPage).catch(() => undefined);
        }
    };

    // Chain: once a page is known, warm up its neighbours in the background.
    const prefetchNeighbours = (
        target: FeedFilters,
        data: Paginated<StoreProduct>,
    ) => {
        if (data.current_page < data.last_page) {
            prefetch(target, data.current_page + 1);
        }

        if (data.current_page > 1) {
            prefetch(target, data.current_page - 1);
        }
    };

    useEffect(() => {
        for (const [pageKey, { controller }] of inflight.current) {
            if (!pageKey.startsWith(`${fKey}#`)) {
                controller.abort();
            }
        }

        const existing = cache.current.get(key);

        if (existing) {
            setPages((all) => (all[key] ? all : { ...all, [key]: existing }));
            prefetchNeighbours(filters, existing);

            return;
        }

        request(filters, page)
            .then((data) => {
                setError(null);
                setPages((all) => ({ ...all, [key]: data }));
                prefetchNeighbours(filters, data);
            })
            .catch((reason: unknown) => {
                if (!isAbort(reason)) {
                    setError(
                        'Gagal memuat menu. Periksa koneksi lalu coba lagi.',
                    );
                }
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const current = pages[key];

    if (current && shownKey !== key) {
        setShownKey(key);
    }

    const shown = current ?? pages[shownKey];

    const retry = () => {
        setError(null);
        request(filters, page)
            .then((data) => {
                setPages((all) => ({ ...all, [key]: data }));
                prefetchNeighbours(filters, data);
            })
            .catch((reason: unknown) => {
                if (!isAbort(reason)) {
                    setError('Masih gagal memuat menu.');
                }
            });
    };

    return {
        key: current ? key : shownKey,
        items: shown?.data ?? [],
        total: shown?.total ?? 0,
        perPage: shown?.per_page ?? initial.per_page,
        page: shown?.current_page ?? 1,
        lastPage: shown?.last_page ?? 1,
        /** true while the requested page hasn't arrived yet */
        pending: !current,
        error,
        retry,
        prefetch,
    };
}
