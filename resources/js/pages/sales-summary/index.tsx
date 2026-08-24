import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Fragment, useState } from 'react';
import {
    ChevronDown,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    DollarSign,
    ShoppingCart,
    Package,
    WalletCards,
    FileText,
    Printer,
    Coins,
} from 'lucide-react';

import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
    createColumnHelper,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';

import TablePagination from '@/components/table-pagination';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import salesSummary from '@/routes/sales-summary';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

const title = 'Rekap Penjualan';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: '/sales-summary',
    },
];

type Props = {
    summary: any;
    lastSummary?: any;
};

export default function Index({ summary, lastSummary }: Props) {
    const pagination = summary.pagination;
    const data = pagination.data;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
    const [confirmOpen, setConfirmOpen] = useState(false);

    // State form input fisik cash
    const { data: formData, setData, post, processing } = useForm({
        actual_cash: '',
        starting_cash: 0,
    });

    const formatRupiah = (value: number | string | null | undefined) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(value || 0));

    const grouped = Object.values(
        summary.by_payment_method.reduce((acc: any, item: any) => {
            if (!acc[item.payment_method_kind]) {
                acc[item.payment_method_kind] = {
                    kind: item.payment_method_kind,
                    items: [],
                    total: 0,
                };
            }
            acc[item.payment_method_kind].items.push(item);
            acc[item.payment_method_kind].total += item.total_nominal;
            return acc;
        }, {}),
    );

    const handleConfirmSubmit = () => {
        post(salesSummary.store().url, {
            onSuccess: () => {
                toast.success('Rekap kasir berhasil ditutup dan disimpan!');
                setConfirmOpen(false);
            },
            onError: () => {
                toast.error('Gagal memproses rekapan');
            },
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const reconciliation = lastSummary?.cash_reconciliation;

    const columnHelper = createColumnHelper<any>();
    const columns: ColumnDef<any, any>[] = [
        {
            id: 'expand',
            enableSorting: false,
            header: () => {
                const allExpanded =
                    data.length > 0 &&
                    data.every((sale: any) => expandedRows[sale.id]);

                return (
                    <button
                        type="button"
                        onClick={() => {
                            if (allExpanded) {
                                setExpandedRows({});
                            } else {
                                const expandedState: Record<number, boolean> = {};
                                data.forEach((sale: any) => {
                                    expandedState[sale.id] = true;
                                });
                                setExpandedRows(expandedState);
                            }
                        }}
                    >
                        {allExpanded ? (
                            <ChevronDown className="cursor-pointer" size={16} />
                        ) : (
                            <ChevronRight className="cursor-pointer" size={16} />
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
                        onClick={() =>
                            setExpandedRows((prev) => ({
                                ...prev,
                                [sale.id]: !prev[sale.id],
                            }))
                        }
                    >
                        {expanded ? (
                            <ChevronDown className="cursor-pointer" size={16} />
                        ) : (
                            <ChevronRight className="cursor-pointer" size={16} />
                        )}
                    </button>
                );
            },
        },
        {
            id: 'no',
            header: 'No',
            cell: (info) =>
                (pagination.current_page - 1) * pagination.per_page +
                info.row.index +
                1,
        },
        columnHelper.accessor('invoice_number', {
            header: 'Invoice',
        }),
        columnHelper.accessor('transaction_date', {
            header: 'Tanggal',
            cell: (info) =>
                new Date(info.getValue()).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
        }),
        columnHelper.accessor('payment_method.name', {
            header: 'Pembayaran',
            cell: (info) => info.getValue() ?? '-',
        }),
        columnHelper.accessor('grand_total', {
            header: 'Grand Total',
            cell: (info) => formatRupiah(info.getValue()),
        }),
        {
            id: 'profit',
            header: 'Laba',
            cell: ({ row }) => {
                const sale = row.original;
                const totalProfit =
                    sale.details?.reduce((total: number, detail: any) => {
                        const subtotal =
                            Number(detail.subtotal || 0) -
                            Number(detail.adjustment || 0);
                        const modal =
                            Number(detail.purchase_price || 0) *
                            Number(detail.quantity || 0);
                        return total + (subtotal - modal);
                    }, 0) || 0;

                return (
                    <span
                        className={
                            totalProfit >= 0
                                ? 'font-semibold text-green-600'
                                : 'font-semibold text-red-600'
                        }
                    >
                        {formatRupiah(totalProfit)}
                    </span>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            {/* Modal Input Cash / Rekon Form */}
            <Card className="mb-4 border-primary/20 bg-muted/10 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Coins size={24} />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold">
                                Tutup Shift & Rekonsiliasi Kas
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Masukkan total fisik uang tunai di laci untuk menghitung selisih rekapan.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="w-48">
                            <Input
                                type="number"
                                placeholder="Nominal Uang Fisik (Rp)"
                                value={formData.actual_cash}
                                onChange={(e) => setData('actual_cash', e.target.value)}
                            />
                        </div>

                        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                            <AlertDialogTrigger asChild>
                                <Button
                                    disabled={!formData.actual_cash || processing}
                                    className="bg-green-600 text-white hover:bg-green-700"
                                >
                                    Tutup Rekap
                                </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Konfirmasi Nominal Uang Kas</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Apakah kamu yakin fisik uang tunai di laci sebesar{' '}
                                        <strong className="text-foreground">
                                            {formatRupiah(formData.actual_cash)}
                                        </strong>
                                        ? Proses ini akan langsung menutup shift transaksi berjalan.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleConfirmSubmit}
                                        disabled={processing}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {processing && <Spinner className="mr-2 h-4 w-4" />}
                                        {processing ? 'Menyimpan...' : 'Ya, Tutup & Rekap'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <Button variant="outline" onClick={handlePrint} className="gap-2">
                            <Printer size={16} />
                            Cetak Rekapan
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Hasil Rekonsiliasi Terakhir */}
            {reconciliation && (
                <Card className="mb-4 border p-4">
                    <CardHeader className="p-0 pb-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                            Status Rekonsiliasi Kas Terakhir ({new Date(lastSummary.date).toLocaleTimeString('id-ID')})
                        </h3>
                    </CardHeader>
                    <CardContent className="grid gap-4 p-0 md:grid-cols-4">
                        <div className="rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">Fisik Kas (Aktual)</p>
                            <p className="text-lg font-bold">{formatRupiah(reconciliation.actual_cash)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">Sistem Kas (Expected)</p>
                            <p className="text-lg font-bold">{formatRupiah(reconciliation.expected_cash)}</p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">Selisih Kas</p>
                            <p
                                className={`text-lg font-bold ${
                                    reconciliation.status === 'matched'
                                        ? 'text-green-600'
                                        : reconciliation.status === 'overage'
                                        ? 'text-blue-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {reconciliation.difference > 0 ? '+' : ''}
                                {formatRupiah(reconciliation.difference)}
                            </p>
                        </div>
                        <div className="rounded-lg bg-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">Keterangan</p>
                            <span
                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                                    reconciliation.status === 'matched'
                                        ? 'bg-green-100 text-green-700'
                                        : reconciliation.status === 'overage'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {reconciliation.status === 'matched'
                                    ? 'Pas (Matched)'
                                    : reconciliation.status === 'overage'
                                    ? 'Kelebihan (Plus)'
                                    : 'Kurang (Minus)'}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Statistik Summary */}
            <Card className="p-4">
                <div className="mb-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-muted p-2">
                                <FileText size={20} className="text-muted-foreground" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold">{title}</h1>
                                <p className="text-sm text-muted-foreground">
                                    Ringkasan penjualan berdasarkan metode pembayaran
                                </p>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="today" className="mt-6 w-fit">
                        <TabsList>
                            <TabsTrigger value="today" asChild>
                                <Link href={salesSummary.index().url}>Rekap Hari Ini</Link>
                            </TabsTrigger>
                            <TabsTrigger value="history" asChild>
                                <Link href={salesSummary.history().url}>Histori Rekap</Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="rounded-xl bg-blue-50 p-3">
                                    <ShoppingCart size={20} className="text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Transaksi</p>
                                    <p className="text-2xl font-bold">{summary.total_transaksi}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="rounded-xl bg-violet-50 p-3">
                                    <Package size={20} className="text-violet-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Item Terjual</p>
                                    <p className="text-2xl font-bold">{summary.total_item}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="rounded-xl bg-emerald-50 p-3">
                                    <DollarSign size={20} className="text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Penjualan</p>
                                    <p className="text-2xl font-bold">{formatRupiah(summary.total_pendapatan)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Grouped Payment Methods */}
                <div className="mt-4 space-y-4">
                    {grouped.map((group: any) => (
                        <Card key={group.kind}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <WalletCards size={16} />
                                    <h3 className="font-semibold uppercase">{group.kind}</h3>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {formatRupiah(group.total)}
                                </span>
                            </CardHeader>

                            <CardContent className="space-y-2">
                                {group.items.map((item: any) => (
                                    <div key={item.payment_method_id} className="flex justify-between text-sm">
                                        <div>
                                            {item.payment_method_name}
                                            <span className="ml-2 text-muted-foreground">
                                                ({item.total_transaksi} Transaksi)
                                            </span>
                                        </div>
                                        <div className="font-medium">{formatRupiah(item.total_nominal)}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Card>

            {/* Detail Transaksi Table */}
            <Card className="mt-4">
                <CardHeader>
                    <h2 className="text-lg font-semibold">Detail Transaksi Hari Ini</h2>
                </CardHeader>

                <CardContent>
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
                                                <div className="flex items-center gap-2">
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                                    {header.column.getCanSort() && (
                                                        <>
                                                            {{
                                                                asc: <ArrowUp size={14} />,
                                                                desc: <ArrowDown size={14} />,
                                                            }[header.column.getIsSorted() as string] ?? (
                                                                <ArrowUpDown size={14} />
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
                                            <TableRow
                                                className={expanded ? 'bg-blue-50 hover:bg-blue-100' : ''}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>

                                            {expanded && (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={row.getVisibleCells().length}
                                                        className="bg-muted/20"
                                                    >
                                                        <div className="rounded-lg border p-4">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead>Produk</TableHead>
                                                                        <TableHead>Brand</TableHead>
                                                                        <TableHead>Qty</TableHead>
                                                                        <TableHead>Harga Beli</TableHead>
                                                                        <TableHead>Harga Jual</TableHead>
                                                                        <TableHead>Diskon</TableHead>
                                                                        <TableHead>Subtotal</TableHead>
                                                                        <TableHead>Laba</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>

                                                                <TableBody>
                                                                    {sale.grouped_details?.map((detail: any) => {
                                                                        const subtotal =
                                                                            Number(detail.subtotal || 0) -
                                                                            Number(detail.adjustment || 0);
                                                                        const modal =
                                                                            Number(detail.purchase_price || 0) *
                                                                            Number(detail.quantity || 0);
                                                                        const profit = subtotal - modal;

                                                                        return (
                                                                            <TableRow key={detail.id}>
                                                                                <TableCell>{detail.product_name}</TableCell>
                                                                                <TableCell>{detail.product_brand}</TableCell>
                                                                                <TableCell>{detail.quantity}</TableCell>
                                                                                <TableCell>{formatRupiah(detail.purchase_price)}</TableCell>
                                                                                <TableCell>{formatRupiah(detail.selling_price)}</TableCell>
                                                                                <TableCell>{formatRupiah(detail.adjustment)}</TableCell>
                                                                                <TableCell>{formatRupiah(subtotal)}</TableCell>
                                                                                <TableCell className="font-semibold text-green-600">
                                                                                    {formatRupiah(profit)}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
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
                    </Table>

                    <div className="mt-4 rounded-lg border bg-muted/30 px-4 py-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">TOTAL LABA</span>
                            <span
                                className={`text-md font-bold ${
                                    Number(summary.total_profit) >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {formatRupiah(summary.total_profit)}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <TablePagination pagination={pagination} />
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}