import { Fragment, useEffect, useState } from 'react';

import { Head, router } from '@inertiajs/react';

import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { Input } from '@/components/ui/input';

import { Button } from '@/components/ui/button';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { ChevronDown, ChevronRight, Search } from 'lucide-react';

import { DateRangePicker } from '@/components/ui/date-range-picker';

import { DateRange } from 'react-day-picker';

import { Pagination, Product } from '@/lib/model';

import TablePagination from '@/components/table-pagination';

const title = 'Kartu Stok';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: '/stock-card',
    },
];

type Props = {
    pagination: Pagination<Product>;
};

export default function Index({ pagination }: Props) {
    const { data } = pagination;

    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const [expanded, setExpanded] = useState<number[]>([]);

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const start = params.get('start_date');
        const end = params.get('end_date');

        if (start && end) {
            setDateRange({
                from: new Date(start),
                to: new Date(end),
            });
        }
    }, []);
    const allExpanded =
        data.length > 0 &&
        data.every((product) => expanded.includes(product.id));

    const toggleAllExpand = () => {
        if (allExpanded) {
            setExpanded([]);
        } else {
            setExpanded(data.map((product) => product.id));
        }
    };
    const toggleExpand = (productId: number) => {
        setExpanded((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId],
        );
    };

    const formatRupiah = (value: number | string | null | undefined) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(value || 0));
    const sourceLabels: Record<string, string> = {
        purchase: 'Pembelian',
        sale: 'Penjualan',
        adjustment: 'Penyesuaian',
        return: 'Retur',
        transfer: 'Transfer',
        other: 'Lainnya',
        damage: 'Barang Rusak',
        expired: 'Kedaluwarsa',
        consignment: 'Titipan',
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <Card>
                <CardHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();

                            const formData = new FormData(e.currentTarget);

                            router.get(
                                '/stock-card',
                                {
                                    search: formData.get('search'),

                                    start_date: dateRange?.from
                                        ? formatDate(dateRange.from)
                                        : '',

                                    end_date: dateRange?.to
                                        ? formatDate(dateRange.to)
                                        : '',

                                    page: 1,
                                },
                                {
                                    preserveState: true,
                                    replace: true,
                                },
                            );
                        }}
                        className="flex flex-wrap gap-3"
                    >
                        <Input
                            name="search"
                            defaultValue={
                                new URLSearchParams(window.location.search).get(
                                    'search',
                                ) || ''
                            }
                            placeholder="Cari..."
                            className="flex-1"
                        />

                        <DateRangePicker
                            value={dateRange}
                            onChange={setDateRange}
                        />

                        <Button
                            type="submit"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Search size={16} />
                            Tampilkan
                        </Button>
                    </form>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead style={{ width: 50 }}>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleAllExpand}
                                    >
                                        {allExpanded ? (
                                            <ChevronDown size={18} />
                                        ) : (
                                            <ChevronRight size={18} />
                                        )}
                                    </Button>
                                </TableHead>

                                <TableHead>Produk</TableHead>

                                <TableHead>Total Transaksi</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.length > 0 ? (
                                data.map((product) => {
                                    const isExpanded = expanded.includes(
                                        product.id,
                                    );

                                    return (
                                        <Fragment key={product.id}>
                                            {/* PARENT ROW */}
                                            <TableRow
                                                className={
                                                    isExpanded
                                                        ? 'cursor-pointer bg-blue-50 hover:bg-blue-100'
                                                        : 'cursor-pointer hover:bg-muted/40'
                                                }
                                                onClick={() =>
                                                    toggleExpand(product.id)
                                                }
                                            >
                                                <TableCell>
                                                    {isExpanded ? (
                                                        <ChevronDown
                                                            size={18}
                                                        />
                                                    ) : (
                                                        <ChevronRight
                                                            size={18}
                                                        />
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">
                                                            {product.name}
                                                        </span>

                                                        <span className="text-xs text-muted-foreground">
                                                            {product.brand}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        product
                                                            .inventory_transactions
                                                            ?.length
                                                    }{' '}
                                                    Transaksi
                                                </TableCell>
                                            </TableRow>
                                            {isExpanded && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={4}
                                                        className="bg-muted/10 p-0"
                                                    >
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead
                                                                        style={{
                                                                            width: 60,
                                                                        }}
                                                                    >
                                                                        No
                                                                    </TableHead>

                                                                    <TableHead>
                                                                        Tanggal
                                                                    </TableHead>

                                                                    <TableHead>
                                                                        Tipe
                                                                    </TableHead>

                                                                    <TableHead>
                                                                        Sumber
                                                                    </TableHead>

                                                                    <TableHead>
                                                                        Qty
                                                                    </TableHead>

                                                                    <TableHead>
                                                                        Saldo
                                                                    </TableHead>

                                                                    <TableHead>
                                                                        Harga
                                                                        Beli
                                                                    </TableHead>

                                                                    <TableHead>
                                                                        Harga
                                                                        Jual
                                                                    </TableHead>

                                                                    <TableHead>
                                                                        Referensi
                                                                    </TableHead>
                                                                </TableRow>
                                                            </TableHeader>

                                                            <TableBody>
                                                                {product.inventory_transactions?.map(
                                                                    (
                                                                        item,
                                                                        index,
                                                                    ) => {
                                                                        const purchase =
                                                                            item.purchase_reference;

                                                                        const sale =
                                                                            item.sale_reference;

                                                                        return (
                                                                            <TableRow
                                                                                key={
                                                                                    item.id
                                                                                }
                                                                            >
                                                                                <TableCell>
                                                                                    {index +
                                                                                        1}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {new Date(
                                                                                        item.created_at ||
                                                                                            '',
                                                                                    ).toLocaleDateString(
                                                                                        'id-ID',
                                                                                        {
                                                                                            day: '2-digit',
                                                                                            month: 'long',
                                                                                            year: 'numeric',
                                                                                            hour: '2-digit',
                                                                                            minute: '2-digit',
                                                                                        },
                                                                                    )}
                                                                                </TableCell>

                                                                                <TableCell>
                                                                                    <span
                                                                                        className={
                                                                                            item.type ===
                                                                                            'in'
                                                                                                ? 'font-semibold text-green-600'
                                                                                                : 'font-semibold text-red-600'
                                                                                        }
                                                                                    >
                                                                                        {item.type.toUpperCase()}
                                                                                    </span>
                                                                                </TableCell>

                                                                                <TableCell>
                                                                                    {sourceLabels[
                                                                                        item
                                                                                            .source
                                                                                    ] ??
                                                                                        '-'}
                                                                                </TableCell>

                                                                                <TableCell>
                                                                                    {
                                                                                        item.quantity
                                                                                    }
                                                                                </TableCell>

                                                                                <TableCell className="font-semibold">
                                                                                    {
                                                                                        item.stock_balance
                                                                                    }
                                                                                </TableCell>

                                                                                <TableCell>
                                                                                    {formatRupiah(
                                                                                        item.purchase_price,
                                                                                    )}
                                                                                </TableCell>

                                                                                <TableCell>
                                                                                    {formatRupiah(
                                                                                        item.selling_price,
                                                                                    )}
                                                                                </TableCell>

                                                                                <TableCell>
                                                                                    {purchase && (
                                                                                        <div className="flex flex-col text-sm">
                                                                                            <span>
                                                                                                Purchase
                                                                                            </span>

                                                                                            <span className="text-muted-foreground">
                                                                                                {
                                                                                                    purchase.code
                                                                                                }
                                                                                            </span>

                                                                                            <span className="text-xs text-muted-foreground">
                                                                                                {
                                                                                                    purchase
                                                                                                        .supplier
                                                                                                        ?.name
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    )}

                                                                                    {sale && (
                                                                                        <div className="flex flex-col text-sm">
                                                                                            <span>
                                                                                                Sale
                                                                                            </span>

                                                                                            <span className="text-xs text-muted-foreground">
                                                                                                {
                                                                                                    sale
                                                                                                        .sale_transaction
                                                                                                        ?.invoice_number
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    },
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        Tidak ada data kartu stok
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <div className="mt-4">
                        <TablePagination pagination={pagination} />
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
