import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** e.g. [1, '…', 4, 5, 6, '…', 18] */
function pageItems(page: number, last: number, siblings: number) {
    const items: (number | '…')[] = [];
    const start = Math.max(2, page - siblings);
    const end = Math.min(last - 1, page + siblings);

    items.push(1);

    if (start > 2) {
        items.push('…');
    }

    for (let i = start; i <= end; i++) {
        items.push(i);
    }

    if (end < last - 1) {
        items.push('…');
    }

    if (last > 1) {
        items.push(last);
    }

    return items;
}

export function Pagination({
    page,
    lastPage,
    loading,
    onChange,
    onPrefetch,
}: {
    page: number;
    lastPage: number;
    loading: boolean;
    onChange: (page: number) => void;
    onPrefetch: (page: number) => void;
}) {
    if (lastPage <= 1) {
        return null;
    }

    const arrow =
        'flex h-11 items-center gap-1 rounded-full px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-30';

    const numbers = (siblings: number) =>
        pageItems(page, lastPage, siblings).map((item, index) =>
            item === '…' ? (
                <span
                    key={`gap-${index}`}
                    className="flex h-11 w-8 items-end justify-center pb-3 text-(--s-ink)/40"
                >
                    …
                </span>
            ) : (
                <button
                    key={item}
                    type="button"
                    aria-label={`Halaman ${item}`}
                    aria-current={item === page ? 'page' : undefined}
                    onClick={() => onChange(item)}
                    onMouseEnter={() => onPrefetch(item)}
                    className={cn(
                        'cursor-pointer relative flex h-11 min-w-11 items-center justify-center rounded-full px-2 text-sm font-semibold tabular-nums transition-all duration-300',
                        item === page
                            ? 'scale-110 bg-(--s-ink) text-(--s-cream) shadow-(--s-ink)/25 shadow-lg'
                            : 'text-(--s-ink)/70 hover:-translate-y-0.5 hover:bg-white hover:text-(--s-ink) hover:shadow-md',
                    )}
                >
                    {item === page && loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-(--s-cream)/30 border-t-(--s-cream)" />
                    ) : (
                        item
                    )}
                </button>
            ),
        );

    return (
        <nav
            aria-label="Paginasi menu"
            className="mt-12 flex flex-col items-center gap-3"
        >
            <div className="flex items-center gap-1 rounded-full bg-(--s-sand)/70 p-1.5 ring-1 ring-(--s-ink)/5">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                    onMouseEnter={() => onPrefetch(page - 1)}
                    className={cn(arrow, 'text-(--s-ink) hover:bg-white cursor-pointer')}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                <div className="hidden items-center gap-1 sm:flex cursor-pointer">
                    {numbers(1)}
                </div>
                <div className="flex items-center gap-1 sm:hidden cursor-pointer">
                    {numbers(0)}
                </div>

                <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => onChange(page + 1)}
                    onMouseEnter={() => onPrefetch(page + 1)}
                    className={cn(
                        arrow,
                        'bg-(--s-terra) text-white shadow-(--s-terra)/30 shadow-md hover:brightness-110 cursor-pointer',
                    )}
                >
                    <span className="hidden sm:inline">Berikutnya</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <p className="text-xs text-(--s-ink)/50">
                Halaman {page} dari {lastPage}
            </p>
        </nav>
    );
}
