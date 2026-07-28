import { Head, Form, Link, usePage, router } from '@inertiajs/react';
import { Fragment, useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import salesReport from '@/routes/reports/sales';
import {
    Eye,
    Search,
    X,
    ArchiveRestore,
    FilterX,
    Printer,
    SquareArrowOutUpRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import {
    flexRender,
    getSortedRowModel,
    SortingState,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Field, FieldLabel } from '@/components/ui/field';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';

import DataTable from '@/components/data-table';
import TablePagination from '@/components/table-pagination';
import { Pagination, SaleTransaction } from '@/lib/model';
import { useQuery } from '@/hooks/use-query';
import Alert, { AlertState } from '@/components/sales-report/alert';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const title = 'Laporan Penjualan';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: salesReport.index().url,
    },
];

const formatRupiah = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const columnHelper = createColumnHelper<SaleTransaction>();

type TableMeta = {
    onDeleteOrRestore: (id: number, isDelete: boolean) => void;
    onDetail: (id: number) => void;
    isCanceledRoute: boolean;
    isDeletedRoute: boolean;
};

type Props = {
    pagination: Pagination<SaleTransaction>;
    total_profit: number;
    total_selling: number;
};

export default function Index({
    pagination,
    total_profit,
    total_selling,
}: Props) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        undefined,
    );
    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const { url } = usePage();
    const isDeletedRoute = url.includes('deleted');
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const start = params.get('start_date');
        const end = params.get('end_date');
        if (start && end) {
            setDateRange({
                from: new Date(start),
                to: new Date(end),
            });
            setStartDate(start);
            setEndDate(end);
            return;
        }
        setDateRange(undefined);
        setStartDate(null);
        setEndDate(null);
    }, [url]);
    const { data } = pagination;

    const isCanceledRoute = url.includes('canceled');
    const isActiveRoute = !isCanceledRoute && !isDeletedRoute;

    const query = useQuery();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [printType, setPrintType] = useState<string>('');

    const isRangeSelected = !!(dateRange?.from && dateRange?.to);
    const getBulanTahun = () => {
        if (!dateRange?.from) return null;

        return {
            bulan: dateRange.from.getMonth() + 1,
            tahun: dateRange.from.getFullYear(),
        };
    };
    const isSameMonth =
        dateRange?.from &&
        dateRange?.to &&
        dateRange.from.getMonth() === dateRange.to.getMonth() &&
        dateRange.from.getFullYear() === dateRange.to.getFullYear();

    const search = query.search || '';

    const initialAlertState: AlertState = {
        type: 'delete',
        isOpen: false,
        dataId: undefined,
        processing: false,
    };
    console.log(data);
    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();

        router.get(
            salesReport.index().url,
            {
                search,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const [alert, setAlert] = useState<AlertState>(initialAlertState);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(
        {},
    );
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const searchValue = params.get('search');

        const hasSearch = searchValue !== null && searchValue.trim() !== '';

        if (hasSearch && data.length > 0) {
            const expandedState: Record<number, boolean> = {};

            data.forEach((sale) => {
                expandedState[sale.id] = true;
            });

            setExpandedRows(expandedState);
        } else {
            setExpandedRows({});
        }
    }, [data, url]);
    const toggleExpand = (id: number) => {
        setExpandedRows((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handlePrint = (type: 'month' | 'year' | 'week' | 'range') => {
        const params = new URLSearchParams({ type });

        if (type === 'year') {
            if (!dateRange?.from) {
                toast.error('Pilih tanggal dulu');
                return;
            }

            params.append('tahun', String(dateRange.from.getFullYear()));
        }

        const periode = getBulanTahun();

        if (type === 'month' || type === 'week') {
            if (!periode) {
                toast.error('Pilih tanggal dulu');
                return;
            }

            params.append('bulan', String(periode.bulan));
            params.append('tahun', String(periode.tahun));
        }

        if (type === 'range') {
            if (!dateRange?.from || !dateRange?.to) {
                toast.error('Pilih tanggal dulu');
                return;
            }

            params.append('start_date', formatDate(dateRange.from));
            params.append('end_date', formatDate(dateRange.to));
        }
        if (isCanceledRoute) params.append('canceled', '1');
        if (isDeletedRoute) params.append('deleted', '1');

        window.open(
            `/reports/print-sales-report?${params.toString()}`,
            '_blank',
        );
    };

    const onAlertClose = () => setAlert(initialAlertState);

    const onAlertProcessing = () =>
        setAlert((prev) => ({ ...prev, processing: true }));

    const onDeleteOrRestore = (id: number, isDelete: boolean) =>
        setAlert({
            isOpen: true,
            dataId: id,
            type: isDelete ? 'delete' : 'restore',
            processing: false,
        });

    const onDetail = (id: number) => {
        router.visit(`/reports/sales/${id}`);
    };

    const deletedColumns: ColumnDef<SaleTransaction, any>[] =
        isDeletedRoute || isCanceledRoute
            ? [
                  columnHelper.accessor('reason', {
                      header: 'Keterangan',
                      cell: (info) => {
                          const value = info.getValue();
                          return value || '-';
                      },
                  }),
              ]
            : [];
    const baseColumns: ColumnDef<SaleTransaction, any>[] = [
        {
            id: 'expand',
            enableSorting: false,
            header: () => {
                const allExpanded =
                    data.length > 0 &&
                    data.every((sale) => expandedRows[sale.id]);

                return (
                    <button
                        type="button"
                        className="cursor-pointer rounded p-1 hover:bg-muted"
                        onClick={() => {
                            if (allExpanded) {
                                setExpandedRows({});
                            } else {
                                const expandedState: Record<number, boolean> =
                                    {};

                                data.forEach((sale) => {
                                    expandedState[sale.id] = true;
                                });

                                setExpandedRows(expandedState);
                            }
                        }}
                    >
                        {allExpanded ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                    </button>
                );
            },

            cell: ({ row }) => {
                const sale = row.original;
                const expanded = expandedRows[sale.id];

                return (
                    <button
                        type="button"
                        className="cursor-pointer rounded p-1 hover:bg-muted"
                        onClick={() =>
                            setExpandedRows((prev) => ({
                                ...prev,
                                [sale.id]: !prev[sale.id],
                            }))
                        }
                    >
                        {expanded ? (
                            <ChevronDown size={16} />
                        ) : (
                            <ChevronRight size={16} />
                        )}
                    </button>
                );
            },
        },

        {
            id: 'no',
            header: 'No',
            enableSorting: false,
            cell: (info) =>
                (pagination.current_page - 1) * pagination.per_page +
                info.row.index +
                1,
        },

        columnHelper.accessor('invoice_number', {
            id: 'invoice_number',
            header: 'Invoice Number',
            enableSorting: true,
        }),

        columnHelper.accessor('transaction_date', {
            id: 'transaction_date',
            header: 'Tanggal Transaksi',

            enableSorting: true,

            cell: (info) =>
                new Date(info.getValue()).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),

            footer: () => (
                <div className="flex flex-col font-bold">
                    <span>TOTAL PENJUALAN</span>
                </div>
            ),
        }),

        columnHelper.accessor((row) => row.purchasing_method?.name ?? '', {
            id: 'purchasing_method',
            header: 'Metode Pembelian',
            enableSorting: true,

            cell: (info) => info.getValue() || '-',
        }),

        columnHelper.accessor((row) => row.payment_method?.name ?? '', {
            id: 'payment_method',

            header: () => <div className="text-center">Metode Pembayaran</div>,

            enableSorting: true,

            cell: (info) => (
                <div className="text-center">{info.getValue() || '-'}</div>
            ),
        }),

        columnHelper.accessor('payment_status', {
            id: 'payment_status',

            header: () => <div className="text-center">Status Pembayaran</div>,

            enableSorting: true,

            cell: (info) => {
                if (isDeletedRoute) {
                    return <div className="text-center">-</div>;
                }

                const status = info.getValue() as
                    | 'paid'
                    | 'pending'
                    | 'canceled'
                    | undefined;

                const map: Record<string, string> = {
                    paid: 'bg-green-100 text-green-600',
                    pending: 'bg-yellow-100 text-yellow-600',
                    canceled: 'bg-red-100 text-red-600',
                };

                const label: Record<string, string> = {
                    paid: 'Lunas',
                    pending: 'Belum Lunas',
                    canceled: 'Dibatalkan',
                };

                if (!status) {
                    return <div className="text-center">-</div>;
                }

                return (
                    <div className="text-center">
                        <span
                            className={`rounded px-2 py-1 text-xs ${map[status]}`}
                        >
                            {label[status]}
                        </span>
                    </div>
                );
            },
        }),

        columnHelper.accessor('grand_total', {
            id: 'grand_total',
            header: 'Jumlah',
            enableSorting: true,

            cell: (info) => formatRupiah(info.getValue()),
        }),

        columnHelper.accessor('total_amount', {
            id: 'total_amount',
            header: 'Total Pembayaran',
            enableSorting: true,

            cell: (info) => formatRupiah(info.getValue()),

            footer: () => (
                <span className="font-bold">{formatRupiah(total_selling)}</span>
            ),
        }),

        columnHelper.accessor('change', {
            id: 'change',
            header: 'Kembalian',
            enableSorting: true,

            cell: (info) => formatRupiah(info.getValue()),

            footer: () => (
                <div className="flex flex-col font-bold">
                    <span>TOTAL LABA</span>
                </div>
            ),
        }),

        columnHelper.accessor(
            (row) => {
                const kurangBayar =
                    (row.grand_total || 0) - (row.total_amount || 0);

                const kerugian = row.total_amount || 0;

                const refund = (row.total_amount || 0) - (row.change || 0);

                return isDeletedRoute
                    ? Math.max(kerugian, 0)
                    : isCanceledRoute
                      ? Math.max(refund, 0)
                      : Math.max(kurangBayar, 0);
            },
            {
                id: 'financial_status',

                header: isDeletedRoute
                    ? 'Kerugian'
                    : isCanceledRoute
                      ? 'Pengembalian'
                      : 'Kurang Bayar',

                enableSorting: true,

                cell: (info) => {
                    const value = Number(info.getValue() || 0);

                    if (value > 0) {
                        return (
                            <span className="font-semibold text-red-600">
                                {formatRupiah(value)}
                            </span>
                        );
                    }

                    return (
                        <span className="font-semibold text-green-600">
                            Rp 0
                        </span>
                    );
                },
            },
        ),

        columnHelper.accessor('profit', {
            id: 'profit',
            header: 'Laba',
            enableSorting: true,

            cell: (info) => {
                const value = Number(info.getValue() || 0);

                if (value === 0) {
                    return <span className="text-gray-400">-</span>;
                }

                return (
                    <span
                        className={`font-semibold ${
                            value >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {formatRupiah(value)}
                    </span>
                );
            },

            footer: () => (
                <span className="font-bold text-green-700">
                    {formatRupiah(total_profit)}
                </span>
            ),
        }),

        {
            id: 'action',
            header: 'Aksi',
            enableSorting: false,

            cell: (info) => {
                const row = info.row.original as SaleTransaction & {
                    id: number;
                };

                const meta = info.table.options.meta as TableMeta;

                return (
                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => meta.onDetail(row.id)}
                        >
                            <SquareArrowOutUpRight size={16} />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const columns: ColumnDef<SaleTransaction, any>[] = isDeletedRoute
        ? (() => {
              const filtered = baseColumns.filter(
                  (col: any) => col.id !== 'total_amount',
              );

              const actionIndex = filtered.findIndex(
                  (col: any) => col.id === 'action',
              );

              return [
                  ...filtered.slice(0, actionIndex),
                  ...deletedColumns,
                  ...filtered.slice(actionIndex),
              ];
          })()
        : baseColumns;

    const table = useReactTable<SaleTransaction>({
        data,
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),

        meta: {
            onDeleteOrRestore,
            onDetail,
            isDeletedRoute,
            isCanceledRoute,
        } as TableMeta,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <Alert
                alertState={alert}
                onAlertClose={onAlertClose}
                onAlertProcessing={onAlertProcessing}
            />

            <Card>
                <CardHeader>
                    <Form
                        method="GET"
                        action={
                            isDeletedRoute
                                ? salesReport.deleted().url
                                : isCanceledRoute
                                  ? salesReport.canceled().url
                                  : salesReport.index().url
                        }
                        className="flex flex-wrap items-end gap-3"
                    >
                        <input
                            type="hidden"
                            name="start_date"
                            value={
                                dateRange?.from
                                    ? formatDate(dateRange.from)
                                    : ''
                            }
                        />

                        <input
                            type="hidden"
                            name="end_date"
                            value={
                                dateRange?.to ? formatDate(dateRange.to) : ''
                            }
                        />
                        <input type="hidden" name="page" value={1} />

                        <div className="flex min-w-[1050px] flex-col">
                            <Input
                                name="search"
                                defaultValue={search}
                                placeholder="Cari..."
                            />
                        </div>

                        <div className="flex flex-1 flex-col">
                            <Field>
                                <FieldLabel>Periode Tanggal</FieldLabel>
                                <DateRangePicker
                                    value={dateRange}
                                    onChange={(range) => {
                                        setDateRange(range);
                                        setStartDate(
                                            range?.from
                                                ? formatDate(range.from)
                                                : null,
                                        );
                                        setEndDate(
                                            range?.to
                                                ? formatDate(range.to)
                                                : null,
                                        );
                                    }}
                                />
                            </Field>
                        </div>

                        <div className="flex gap-2">
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

                <CardContent>
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <Tabs
                            value={
                                isDeletedRoute
                                    ? 'deleted'
                                    : isCanceledRoute
                                      ? 'canceled'
                                      : 'active'
                            }
                        >
                            <TabsList>
                                <TabsTrigger value="active" asChild>
                                    <Link
                                        href={salesReport.index().url}
                                        data={{ search }}
                                        preserveState
                                        preserveScroll
                                    >
                                        Penjualan
                                    </Link>
                                </TabsTrigger>

                                <TabsTrigger value="canceled" asChild>
                                    <Link
                                        href={salesReport.canceled().url}
                                        data={{ search }}
                                        preserveState
                                        preserveScroll
                                    >
                                        Pembatalan
                                    </Link>
                                </TabsTrigger>

                                <TabsTrigger value="deleted" asChild>
                                    <Link
                                        href={salesReport.deleted().url}
                                        data={{ search }}
                                        preserveState
                                        preserveScroll
                                    >
                                        Kerugian
                                    </Link>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-2">
                            <Select
                                value={printType}
                                onValueChange={(val: any) => {
                                    setPrintType(val);
                                    handlePrint(val);
                                    setTimeout(() => setPrintType(''), 0);
                                }}
                            >
                                <SelectTrigger className="cursor-pointer border border-cyan-600 bg-cyan-600 font-semibold text-white hover:bg-cyan-700 [&_*]:text-white">
                                    <div className="flex items-center gap-2">
                                        <Printer className="h-4 w-4" />
                                        <SelectValue placeholder="Cetak Laporan" />
                                    </div>
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem
                                        className="cursor-pointer"
                                        value="range"
                                        disabled={!isRangeSelected}
                                    >
                                        Filter Saat Ini
                                    </SelectItem>

                                    <SelectItem
                                        className="cursor-pointer"
                                        value="week"
                                        disabled={!isSameMonth}
                                    >
                                        Mingguan
                                    </SelectItem>

                                    <SelectItem
                                        className="cursor-pointer"
                                        value="month"
                                        disabled={!isSameMonth}
                                    >
                                        Bulanan
                                    </SelectItem>

                                    <SelectItem
                                        className="cursor-pointer"
                                        value="year"
                                    >
                                        Tahunan
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            className={
                                                header.column.getCanSort()
                                                    ? 'cursor-pointer select-none'
                                                    : ''
                                            }
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder ? null : (
                                                <div className="flex items-center gap-1">
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
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>

                        <TableBody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => {
                                    const sale = row.original;
                                    const expanded = expandedRows[sale.id];

                                    return (
                                        <Fragment key={row.id}>
                                            {/* ROW UTAMA */}
                                            <TableRow
                                                className={
                                                    expanded
                                                        ? 'bg-blue-50 hover:bg-blue-100'
                                                        : ''
                                                }
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell, index) => (
                                                        <TableCell
                                                            key={cell.id}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {flexRender(
                                                                    cell.column
                                                                        .columnDef
                                                                        .cell,
                                                                    cell.getContext(),
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    ))}
                                            </TableRow>

                                            {expanded && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={
                                                            row.getVisibleCells()
                                                                .length
                                                        }
                                                        className="bg-muted/20"
                                                    >
                                                        <div className="rounded-lg border p-4">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>
                                                                            Produk
                                                                        </TableHead>
                                                                        <TableHead>
                                                                            Brand
                                                                        </TableHead>
                                                                        <TableHead>
                                                                            Qty
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
                                                                            Diskon
                                                                        </TableHead>
                                                                        <TableHead>
                                                                            Subtotal
                                                                        </TableHead>
                                                                        <TableHead>
                                                                            Laba
                                                                        </TableHead>
                                                                    </TableRow>
                                                                </TableHeader>

                                                                <TableBody>
                                                                    {sale.grouped_details?.map(
                                                                        (
                                                                            detail: any,
                                                                            index: number,
                                                                        ) => {
                                                                            const subtotal =
                                                                                Number(
                                                                                    detail.subtotal ||
                                                                                        0,
                                                                                ) -
                                                                                Number(
                                                                                    detail.adjustment ||
                                                                                        0,
                                                                                );

                                                                            const modal =
                                                                                Number(
                                                                                    detail.purchase_price ||
                                                                                        0,
                                                                                ) *
                                                                                Number(
                                                                                    detail.quantity ||
                                                                                        0,
                                                                                );

                                                                            const profit =
                                                                                subtotal -
                                                                                modal;

                                                                            return (
                                                                                <TableRow
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                    className="border-b"
                                                                                >
                                                                                    <TableCell>
                                                                                        <div className="flex flex-col">
                                                                                            <span>
                                                                                                {
                                                                                                    detail.product_name
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </TableCell>

                                                                                    <TableCell>
                                                                                        {
                                                                                            detail.product_brand
                                                                                        }
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {
                                                                                            detail.quantity
                                                                                        }
                                                                                    </TableCell>

                                                                                    <TableCell>
                                                                                        {formatRupiah(
                                                                                            detail.purchase_price,
                                                                                        )}
                                                                                    </TableCell>

                                                                                    <TableCell>
                                                                                        {formatRupiah(
                                                                                            detail.selling_price,
                                                                                        )}
                                                                                    </TableCell>

                                                                                    <TableCell>
                                                                                        {formatRupiah(
                                                                                            detail.adjustment,
                                                                                        )}
                                                                                    </TableCell>

                                                                                    <TableCell>
                                                                                        {formatRupiah(
                                                                                            subtotal,
                                                                                        )}
                                                                                    </TableCell>

                                                                                    <TableCell className="font-semibold text-green-600">
                                                                                        {formatRupiah(
                                                                                            profit,
                                                                                        )}
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        },
                                                                    )}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        Tidak ada data transaksi
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            {table.getFooterGroups().map((footerGroup) => (
                                <TableRow key={footerGroup.id}>
                                    {footerGroup.headers.map((header) => (
                                        <TableCell key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .footer,
                                                      header.getContext(),
                                                  )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableFooter>
                    </Table>
                    <TablePagination pagination={pagination} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
