import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import salesReport from '@/routes/reports/sales';
import Swal from 'sweetalert2';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';

import DataTable from '@/components/data-table';
import TablePagination from '@/components/table-pagination';
import { Pagination, SaleTransactionDetail } from '@/lib/model';
import { Spinner } from '@/components/ui/spinner';
import { AlertTriangle } from 'lucide-react';

const title = 'Detail Laporan Penjualan';

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

// ✅ GLOBAL FORMAT RUPIAH
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
    transaction: any;
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

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

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
                        { reason }, // ✅ kirim ke BE
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
        const cost = item.purchase_price || 0; // sesuaikan kalau beda field

        return acc + qty * cost;
    }, 0);

    const totalLaba = grandTotal - totalCost;

    const totalDiscount = (data ?? []).reduce((acc, item) => {
        return acc + Number(item.adjustment || 0);
    }, 0);
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
                        <span className="block text-right font-bold text-red-600">
                            {formatRupiah(totalDiscount)}
                        </span>
                    );
                }

                return (
                    <span className="block text-right text-red-600">
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
                        <span className="block text-right font-bold text-green-700">
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
                    <span className="block text-right text-green-600">
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
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <Card>
                <CardContent>
                    <div className="mb-4 space-y-1">
                        <div className="text-sm text-gray-500">Invoice</div>
                        <div className="text-lg font-semibold">
                            {transaction.invoice_number}
                        </div>

                        <div className="mt-2 text-sm text-gray-500">
                            Tanggal Transaksi
                        </div>
                        <div>{formatDate(transaction.transaction_date)}</div>

                        <div className="mt-2 text-sm text-gray-500">
                            Metode Pembayaran
                        </div>
                        <div>{transaction.payment_method?.name ?? '-'}</div>
                        <div className="mt-2 text-sm text-gray-500">Status</div>
                        <div>
                            {transaction.payment_status === 'canceled' ? (
                                <span className="inline-block rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                                    Dibatalkan
                                </span>
                            ) : transaction.payment_status === 'paid' ? (
                                <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                                    Lunas
                                </span>
                            ) : (
                                <span className="inline-block rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
                                    Pending
                                </span>
                            )}
                        </div>

                        {transaction.payment_status === 'canceled' &&
                            cancelReason && (
                                <>
                                    <div className="mt-2 text-sm text-gray-500">
                                        Alasan Pembatalan :
                                    </div>
                                    <div className="rounded bg-red-50 p-2 text-sm text-red-700">
                                        {cancelReason}
                                    </div>
                                </>
                            )}
                    </div>

                    <DataTable columns={columns} table={table} />
                    <TablePagination pagination={pagination} />

                    <div className="mt-6 flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit(salesReport.index().url)
                            }
                        >
                            Kembali
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
                                Lunasi
                            </Button>
                        )}

                        <Button
                            variant="destructive"
                            disabled={transaction.payment_status === 'canceled'}
                            onClick={handleCancel}
                        >
                            Batalkan Transaksi
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
