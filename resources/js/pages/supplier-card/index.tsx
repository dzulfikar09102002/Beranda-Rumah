import { Form, Head } from '@inertiajs/react';
import { Fragment, useEffect, useMemo, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    ChevronDown,
    ChevronRight,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';

import TablePagination from '@/components/table-pagination';

import { Pagination, SupplierCard } from '@/lib/model';
import { useQuery } from '@/hooks/use-query';

import supplierCards from '@/routes/supplier-cards';

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from '@tanstack/react-table';

const title = 'Kartu Supplier';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: supplierCards.index(),
    },
];

type Props = {
    pagination: Pagination<SupplierCard>;
    totalMasuk: number;
    totalKeluar: number;
    totalLakuPaid: number;
    totalHutang: number;
};

const formatRupiah = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const columnHelper = createColumnHelper<SupplierCard>();

export default function Index({
    pagination,
    totalMasuk,
    totalKeluar,
    totalLakuPaid,
    totalHutang,
}: Props) {
    const { data } = pagination;

    const search = useQuery().search || '';

    const [expanded, setExpanded] = useState<Record<number, boolean>>({});

    const [sorting, setSorting] = useState<SortingState>([]);

    useEffect(() => {
        if (search.trim() && data.length > 0) {
            const expandedState: Record<number, boolean> = {};

            data.forEach((supplier) => {
                expandedState[supplier.supplier_id] = true;
            });

            setExpanded(expandedState);
        } else {
            setExpanded({});
        }
    }, [search, data]);

    const toggleExpand = (id: number) => {
        setExpanded((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const allExpanded =
        data.length > 0 &&
        data.every((supplier) => expanded[supplier.supplier_id]);

    const columns = useMemo(
        () => [
            {
                id: 'expand',
                enableSorting: false,

                header: () => (
                    <button
                        type="button"
                        className="cursor-pointer rounded p-1 hover:bg-muted"
                        onClick={() => {
                            if (allExpanded) {
                                setExpanded({});
                            } else {
                                const expandedState: Record<number, boolean> =
                                    {};

                                data.forEach((supplier) => {
                                    expandedState[supplier.supplier_id] = true;
                                });

                                setExpanded(expandedState);
                            }
                        }}
                    >
                        {allExpanded ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                    </button>
                ),

                cell: ({ row }: any) => {
                    const supplier = row.original;

                    const isExpanded = expanded[supplier.supplier_id];

                    return (
                        <button
                            type="button"
                            className="cursor-pointer rounded p-1 hover:bg-muted"
                            onClick={() => toggleExpand(supplier.supplier_id)}
                        >
                            {isExpanded ? (
                                <ChevronDown size={16} />
                            ) : (
                                <ChevronRight size={16} />
                            )}
                        </button>
                    );
                },
            },

            columnHelper.accessor('supplier_name', {
                id: 'supplier_name',

                header: 'Supplier',

                enableSorting: true,

                cell: (info) => (
                    <span className="font-medium">
                        {info.getValue()?.toUpperCase()}
                    </span>
                ),
            }),

            columnHelper.accessor('total_masuk', {
                id: 'total_masuk',

                header: () => <div className="text-center">Total Masuk</div>,

                enableSorting: true,

                cell: (info) => (
                    <div className="text-center font-medium">
                        {info.getValue()}
                    </div>
                ),
            }),

            columnHelper.accessor('total_keluar', {
                id: 'total_keluar',

                header: () => <div className="text-center">Total Keluar</div>,

                enableSorting: true,

                cell: (info) => (
                    <div className="text-center font-medium">
                        {info.getValue()}
                    </div>
                ),
            }),

            columnHelper.accessor('total_laku_paid', {
                id: 'total_laku_paid',

                header: () => <div className="text-center">Total Terbayar</div>,

                enableSorting: true,

                cell: (info) => (
                    <div className="text-center font-medium text-green-700">
                        {info.getValue()}
                    </div>
                ),
            }),

            columnHelper.accessor('total_hutang', {
                id: 'total_hutang',

                header: () => <div className="text-right">Total Utang</div>,

                enableSorting: true,

                cell: (info) => (
                    <div className="text-right font-bold text-red-600">
                        {formatRupiah(info.getValue())}
                    </div>
                ),

                footer: () => (
                    <div className="text-right font-bold text-red-600">
                        {formatRupiah(totalHutang)}
                    </div>
                ),
            }),
        ],
        [expanded, allExpanded, data, totalHutang],
    );

    const table = useReactTable({
        data,
        columns,

        state: {
            sorting,
        },

        onSortingChange: setSorting,

        getCoreRowModel: getCoreRowModel(),

        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <Card>
                <CardHeader>
                    <Form method="GET">
                        <div className="flex flex-col gap-2 md:flex-row">
                            <input type="hidden" name="page" value={1} />

                            <Input
                                name="search"
                                defaultValue={search}
                                placeholder="Cari..."
                            />

                            <input
                                type="hidden"
                                name="source"
                                value={useQuery().source || ''}
                            />

                            <Select
                                defaultValue={useQuery().source || 'all'}
                                onValueChange={(value) => {
                                    const input = document.querySelector(
                                        'input[name="source"]',
                                    ) as HTMLInputElement;

                                    input.value = value === 'all' ? '' : value;
                                }}
                            >
                                <SelectTrigger className="w-full cursor-pointer md:w-[200px]">
                                    <SelectValue placeholder="Semua Sumber" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem
                                        value="all"
                                        className="cursor-pointer"
                                    >
                                        Semua Sumber
                                    </SelectItem>

                                    <SelectItem
                                        value="purchase"
                                        className="cursor-pointer"
                                    >
                                        Pembelian
                                    </SelectItem>

                                    <SelectItem
                                        value="consignment"
                                        className="cursor-pointer"
                                    >
                                        Titipan
                                    </SelectItem>

                                    <SelectItem
                                        value="other"
                                        className="cursor-pointer"
                                    >
                                        Lainnya
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <input
                                type="hidden"
                                name="payment_status"
                                value={useQuery().payment_status || ''}
                            />

                            <Select
                                defaultValue={
                                    useQuery().payment_status || 'all'
                                }
                                onValueChange={(value) => {
                                    const input = document.querySelector(
                                        'input[name="payment_status"]',
                                    ) as HTMLInputElement;

                                    input.value = value === 'all' ? '' : value;
                                }}
                            >
                                <SelectTrigger className="w-full cursor-pointer md:w-[200px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem
                                        className="cursor-pointer"
                                        value="all"
                                    >
                                        Semua Status
                                    </SelectItem>

                                    <SelectItem
                                        className="cursor-pointer"
                                        value="paid"
                                    >
                                        Lunas
                                    </SelectItem>

                                    <SelectItem
                                        className="cursor-pointer"
                                        value="pending"
                                    >
                                        Belum Lunas
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                type="submit"
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <Search size={16} />
                                Tampilkan
                            </Button>
                        </div>
                    </Form>
                </CardHeader>

                <CardContent className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr
                                    key={headerGroup.id}
                                    className="border-b bg-muted/50"
                                >
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className={`p-3 ${
                                                header.column.getCanSort()
                                                    ? 'cursor-pointer select-none'
                                                    : ''
                                            }`}
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={`flex items-center gap-1 ${
                                                        [
                                                            'total_masuk',
                                                            'total_keluar',
                                                            'total_laku_paid',
                                                        ].includes(
                                                            header.column.id,
                                                        )
                                                            ? 'justify-center'
                                                            : header.column
                                                                    .id ===
                                                                'total_hutang'
                                                              ? 'justify-end'
                                                              : ''
                                                    }`}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )}

                                                    {header.column.getCanSort() && (
                                                        <>
                                                            {{
                                                                asc: (
                                                                    <ArrowUp
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                ),

                                                                desc: (
                                                                    <ArrowDown
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                ),
                                                            }[
                                                                header.column.getIsSorted() as string
                                                            ] ?? (
                                                                <ArrowUpDown
                                                                    size={14}
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        <tbody>
                            {table.getRowModel().rows.map((row) => {
                                const supplier = row.original;

                                const isExpanded =
                                    expanded[supplier.supplier_id];

                                return (
                                    <Fragment key={supplier.supplier_id}>
                                        <tr
                                            className={`border-b hover:bg-muted/30 ${
                                                isExpanded
                                                    ? 'bg-blue-50 hover:bg-blue-100'
                                                    : ''
                                            }`}
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className="p-3"
                                                    >
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </td>
                                                ))}
                                        </tr>

                                        {isExpanded && (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        row.getVisibleCells()
                                                            .length
                                                    }
                                                    className="bg-muted/20 p-0"
                                                >
                                                    <div className="p-3">
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr className="border-b bg-muted/40">
                                                                    <th className="w-[60px] p-2 text-center">
                                                                        No.
                                                                    </th>

                                                                    <th className="p-2 text-left">
                                                                        Produk
                                                                    </th>

                                                                    <th className="p-2 text-left">
                                                                        Source
                                                                    </th>

                                                                    <th className="p-2 text-center">
                                                                        Masuk
                                                                    </th>

                                                                    <th className="p-2 text-center">
                                                                        Keluar
                                                                    </th>

                                                                    <th className="p-2 text-center">
                                                                        Laku
                                                                        Terbayar
                                                                    </th>

                                                                    <th className="p-2 text-right">
                                                                        Harga
                                                                        Beli
                                                                    </th>

                                                                    <th className="p-2 text-right">
                                                                        Utang
                                                                    </th>
                                                                </tr>
                                                            </thead>

                                                            <tbody>
                                                                {supplier.products?.map(
                                                                    (
                                                                        product: any,
                                                                        index: number,
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="border-b"
                                                                        >
                                                                            <td className="p-2 text-center font-medium">
                                                                                {index +
                                                                                    1}
                                                                            </td>

                                                                            <td className="p-2">
                                                                                {
                                                                                    product.product_name
                                                                                }
                                                                            </td>

                                                                            <td className="p-2">
                                                                                {product.source ===
                                                                                'purchase'
                                                                                    ? 'Pembelian'
                                                                                    : product.source ===
                                                                                        'consignment'
                                                                                      ? 'Titipan'
                                                                                      : product.source}
                                                                            </td>

                                                                            <td className="p-2 text-center">
                                                                                {
                                                                                    product.barang_masuk
                                                                                }
                                                                            </td>

                                                                            <td className="p-2 text-center">
                                                                                {
                                                                                    product.barang_keluar
                                                                                }
                                                                            </td>

                                                                            <td className="p-2 text-center font-medium text-green-700">
                                                                                {
                                                                                    product.laku_paid
                                                                                }
                                                                            </td>

                                                                            <td className="p-2 text-right">
                                                                                {formatRupiah(
                                                                                    product.harga_beli,
                                                                                )}
                                                                            </td>

                                                                            <td className="p-2 text-right font-semibold text-red-600">
                                                                                {formatRupiah(
                                                                                    product.hutang,
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ),
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </tbody>

                        <tfoot>
                            <tr className="border-t bg-muted/40 font-bold">
                                <td colSpan={5} className="p-3">
                                    TOTAL UTANG
                                </td>

                                <td className="p-3 text-right text-red-600">
                                    {formatRupiah(totalHutang)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    <TablePagination pagination={pagination} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
