import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import salesReport from '@/routes/reports/sales';
import Swal from 'sweetalert2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    ArrowLeft,
    Ban,
    CalendarDays,
    CreditCard,
    Printer,
    Receipt,
    ShoppingBag,
    TrendingDown,
    TrendingUp,
    User,
    Wallet,
} from 'lucide-react';

import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';

import DataTable from '@/components/data-table';
import TablePagination from '@/components/table-pagination';
import { Pagination, SaleTransaction, SaleTransactionDetail } from '@/lib/model';

const title = 'Detail Laporan Penjualan';

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

const formatRupiah = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const columnHelper = createColumnHelper<SaleTransactionDetail>();

type Props = {
    pagination: Pagination<SaleTransactionDetail>;
    transaction: SaleTransaction;
};

export default function Index({ pagination, transaction }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Laporan Penjualan',
            href: salesReport.index().url,
        },
        {
            title: `Detail Invoice : ${transaction.invoice_number}`,
            href: '#',
        },
    ];

    const handlePrint = () => {
        window.open(`/sellings/${transaction.id}/print`, '_blank');
    };

    const handleCancel = () => {
        Swal.fire({
            title: 'Alasan Pembatalan',
            input: 'textarea',
            inputLabel: 'Masukkan alasan pembatalan',
            inputPlaceholder: 'Contoh: Salah input / customer batal / dll...',
            inputAttributes: {
                'aria-label': 'Alasan pembatalan',
            },
            showCancelButton: true,
            confirmButtonText: 'Batalkan Transaksi',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
            showLoaderOnConfirm: true,

            preConfirm: async (reason) => {
                if (!reason) {
                    Swal.showValidationMessage('Alasan wajib diisi');
                    return;
                }

                return new Promise((resolve, reject) => {
                    router.post(
                        salesReport.cancel(transaction.id).url,
                        { reason },
                        {
                            onSuccess: () => resolve(true),
                            onError: () => {
                                Swal.showValidationMessage(
                                    'Gagal membatalkan transaksi',
                                );
                                reject();
                            },
                        },
                    );
                });
            },

            allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Transaksi berhasil dibatalkan',
                    timer: 2000,
                    showConfirmButton: false,
                });

                router.visit(salesReport.index().url);
            }
        });
    };

    const { data } = pagination;

    const grandTotal = (data ?? []).reduce((acc, item) => {
        const subtotal = item.quantity * item.selling_price;
        const discount = Number(item.adjustment || 0);

        return acc + (subtotal - discount);
    }, 0);

    const totalCost = (data ?? []).reduce((acc, item) => {
        const qty = item.quantity || 0;
        const cost = item.purchase_price || 0;

        return acc + qty * cost;
    }, 0);

    const totalLaba = grandTotal - totalCost;

    const totalDiscount = (data ?? []).reduce((acc, item) => {
        return acc + Number(item.adjustment || 0);
    }, 0);

    const totalQty = (data ?? []).reduce(
        (acc, item) => acc + Number(item.quantity || 0),
        0,
    );

    const tableData = [
        ...(data ?? []),
        {
            id: 'grand-total',
            product: { name: 'Grand Total' },
            quantity: '',
            purchase_price: '',
            selling_price: '',
            isTotal: true,
            total_cost: totalCost,
        } as any,
    ];

    const columns: ColumnDef<SaleTransactionDetail, any>[] = [
        {
            id: 'no',
            header: 'No',
            cell: (info) => {
                const row = info.row.original as any;
                if (row.isTotal) return '';
                return (
                    (pagination.current_page - 1) * pagination.per_page +
                    info.row.index +
                    1
                );
            },
        },

        columnHelper.accessor('purchase.product', {
            header: 'Produk',
            cell: (info) => {
                const row = info.row.original as any;
                if (row.isTotal)
                    return <span className="font-bold">Grand Total</span>;
                return info.getValue()?.name ?? '-';
            },
        }),

        columnHelper.accessor('quantity', {
            header: () => <div className="text-center">Jumlah</div>,
            cell: (info) => {
                const row = info.row.original as any;
                if (row.isTotal) return null;
                return (
                    <span className="block text-center">{info.getValue()}</span>
                );
            },
        }),

        columnHelper.accessor('purchase_price', {
            header: () => <div className="text-right">Harga Beli</div>,
            cell: (info) => {
                const row = info.row.original as any;
                if (row.isTotal) return null;

                return (
                    <span className="block text-right">
                        {formatRupiah(info.getValue())}
                    </span>
                );
            },
        }),
        columnHelper.accessor('selling_price', {
            header: () => <div className="text-right">Harga Jual</div>,
            cell: (info) => {
                const row = info.row.original as any;
                if (row.isTotal) return null;

                return (
                    <span className="block text-right">
                        {formatRupiah(info.getValue())}
                    </span>
                );
            },
        }),
        {
            id: 'adjustment',
            header: () => <div className="text-right">Diskon</div>,
            cell: (info) => {
                const row = info.row.original as any;

                if (row.isTotal) {
                    return (
                        <span className="block text-right font-semibold text-red-600 dark:text-red-400">
                            {formatRupiah(totalDiscount)}
                        </span>
                    );
                }

                return (
                    <span className="block text-right text-red-600 dark:text-red-400">
                        {formatRupiah(row.adjustment || 0)}
                    </span>
                );
            },
        },
        {
            id: 'subtotal',
            header: () => <div className="text-right">Subtotal</div>,
            cell: (info) => {
                const row = info.row.original as any;

                if (row.isTotal) {
                    return (
                        <span className="block text-right font-bold">
                            {formatRupiah(grandTotal)}
                        </span>
                    );
                }

                const subtotal = row.quantity * row.selling_price;
                const discount = row.adjustment || 0;
                const net = subtotal - discount;

                return (
                    <span className="block text-right">
                        {formatRupiah(net)}
                    </span>
                );
            },
        },
        {
            id: 'laba',
            header: () => <div className="text-right">Laba</div>,
            cell: (info) => {
                const row = info.row.original as any;

                if (row.isTotal) {
                    return (
                        <span className="block text-right font-bold text-emerald-700 dark:text-emerald-400">
                            {formatRupiah(totalLaba)}
                        </span>
                    );
                }

                const qty = Number(row.quantity || 0);
                const selling = Number(row.selling_price || 0);
                const cost = Number(row.purchase_price || 0);
                const discount = Number(row.adjustment || 0);

                const revenue = qty * selling - discount;
                const costTotal = qty * cost;
                const profit = revenue - costTotal;

                return (
                    <span className="block text-right text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(profit)}
                    </span>
                );
            },
        },
    ];

    const table = useReactTable<SaleTransactionDetail>({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const cancelReason =
        pagination.data?.[0]?.return_transaction?.[0]?.note ?? null;

    const statusConfig = {
        canceled: {
            label: 'Dibatalkan',
            className:
                'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
        },
        paid: {
            label: 'Lunas',
            className:
                'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
        },
        pending: {
            label: 'Pending',
            className:
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
        },
    } as const;

    const status =
        statusConfig[transaction.payment_status as keyof typeof statusConfig] ??
        statusConfig.pending;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="space-y-4">
                {/* Header Card */}
                <Card className="overflow-hidden border-none shadow-sm">
                    <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <Receipt className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-muted-foreground">
                                        Invoice
                                    </div>
                                    <div className="text-lg font-semibold leading-tight">
                                        {transaction.invoice_number}
                                    </div>
                                </div>
                            </div>

                            <Badge className={`${status.className} px-3 py-1 text-xs font-semibold hover:${status.className}`}>
                                {status.label}
                            </Badge>
                        </div>

                        <Separator className="my-5" />

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-start gap-2.5">
                                <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Tanggal Transaksi
                                    </div>
                                    <div className="text-sm font-medium">
                                        {formatDate(transaction.transaction_date)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Kasir
                                    </div>
                                    <div className="text-sm font-medium">
                                        {transaction.cashier || '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <ShoppingBag className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Customer
                                    </div>
                                    <div className="text-sm font-medium">
                                        {transaction.customer || '-'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <div>
                                    <div className="text-xs text-muted-foreground">
                                        Metode Pembayaran
                                    </div>
                                    <div className="text-sm font-medium">
                                        {transaction.payment_method?.name ?? '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {transaction.payment_status === 'canceled' && cancelReason && (
                            <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                                <span className="font-medium">Alasan Pembatalan: </span>
                                {cancelReason}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Card className="border-none shadow-sm">
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Total Item
                                </div>
                                <div className="text-base font-semibold">
                                    {totalQty}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 dark:bg-red-950">
                                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Total Diskon
                                </div>
                                <div className="text-base font-semibold text-red-600 dark:text-red-400">
                                    {formatRupiah(totalDiscount)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-950">
                                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Total Laba
                                </div>
                                <div className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                                    {formatRupiah(totalLaba)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardContent className="flex items-center gap-3 pt-6">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-foreground/15">
                                <Wallet className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-xs">
                                    Grand Total
                                </div>
                                <div className="text-base font-semibold">
                                    {formatRupiah(grandTotal)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">
                            Rincian Item
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable columns={columns} table={table} />
                        <TablePagination pagination={pagination} />

                        <div className="mt-6 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.visit(salesReport.index().url)
                                }
                            >
                                <ArrowLeft className="mr-1.5 h-4 w-4" />
                                Kembali
                            </Button>
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="mr-1.5 h-4 w-4" />
                                Cetak
                            </Button>
                            {transaction.payment_status === 'pending' && (
                                <Button
                                    className="bg-green-600 text-white hover:bg-green-700"
                                    onClick={() =>
                                        router.visit(
                                            `/sellings/${transaction.id}/payment`,
                                        )
                                    }
                                >
                                    <Wallet className="mr-1.5 h-4 w-4" />
                                    Lunasi
                                </Button>
                            )}

                            <Button
                                variant="destructive"
                                disabled={transaction.payment_status === 'canceled'}
                                onClick={handleCancel}
                            >
                                <Ban className="mr-1.5 h-4 w-4" />
                                Batalkan Transaksi
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}