import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pagination } from '@/lib/model';
import { Button } from './ui/button';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from './ui/combobox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';

type Props<T> = {
    pagination: Pagination<T>;
};

export default function TablePagination<T>({ pagination }: Props<T>) {
    const {
        per_page,
        total,
        prev_page_url,
        next_page_url,
        current_page,
        last_page,
        first_page_url,
    } = pagination;

    // ✅ hanya refresh pagination props
    const inertiaOptions = {
        preserveScroll: true,
        preserveState: true,
        only: ['pagination'],
    };

    const handlePageChange = (page: string | null) => {
        if (!page) return;

        router.get(first_page_url, { page }, inertiaOptions);
    };

    return (
        <div className="mt-4 justify-between lg:flex">
            {/* LEFT */}
            <div className="mb-2 flex items-center gap-2 text-sm">
                <span>Menampilkan</span>

                <Select
                    value={String(per_page)}
                    onValueChange={(val) =>
                        router.get(
                            first_page_url,
                            { per_page: val },
                            inertiaOptions,
                        )
                    }
                >
                    <SelectTrigger className="h-9 w-20">
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>

                <span>
                    dari <b>{total}</b> baris data
                </span>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-2 text-sm">
                <div>Halaman</div>

                <Button
                    size="icon"
                    variant="outline"
                    disabled={!prev_page_url}
                    onClick={() =>
                        prev_page_url &&
                        router.get(prev_page_url, {}, inertiaOptions)
                    }
                >
                    <ChevronLeft />
                </Button>

                <Combobox
                    items={Array.from({ length: last_page }, (_, i) =>
                        (i + 1).toString(),
                    )}
                    value={String(current_page)}
                    onValueChange={handlePageChange}
                >
                    <ComboboxInput placeholder="Pilih Halaman" />

                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(page) => (
                                <ComboboxItem key={page} value={page}>
                                    {page}
                                </ComboboxItem>
                            )}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>

                <Button
                    size="icon"
                    variant="outline"
                    disabled={!next_page_url}
                    onClick={() =>
                        next_page_url &&
                        router.get(next_page_url, {}, inertiaOptions)
                    }
                >
                    <ChevronRight />
                </Button>
            </div>
        </div>
    );
}
