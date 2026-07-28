import { Form, Head, Link, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Printer, CircleCheckBig, Pencil } from 'lucide-react';

import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';

import NumberBoardModal from '@/components/number-board-modal';
import { toast } from 'sonner';
import DataTable from '@/components/data-table';
import TablePagination from '@/components/table-pagination';
import { Option, Pagination, Purchase } from '@/lib/model';
import { useQuery } from '@/hooks/use-query';
import { useEffect, useState } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import purchases from '@/routes/reports/purchases';
import Alert, { AlertState } from '@/components/purchase-report/alert';
import { Field, FieldLabel } from '@/components/ui/field';
import Modal from '@/components/purchase-report/modal';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const title = 'Laporan Pembelian';

const breadcrumbs: BreadcrumbItem[] = [{ title, href: purchases.index().url }];

const columnHelper = createColumnHelper<Purchase>();

type Props = {
    pagination: Pagination<Purchase>;
    month: number;
    year: number;
    supplierOptions: Option[];
    total_purchase: number;
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(value || 0);

export default function Index({
    pagination,
    month,
    year,
    supplierOptions,
    total_purchase,
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
    const [alert, setAlert] = useState<AlertState>({
        delete: true,
        isOpen: false,
        dataId: undefined,
        proccessing: false,
    });

    const [editModal, setEditModal] = useState<{
        open: boolean;
        data?: Purchase;
    }>({
        open: false,
    });

    const query = useQuery();
    const search = query.search || '';

    const [payModal, setPayModal] = useState<{
        open: boolean;
        data?: Purchase;
        resetKey: number;
    }>({
        open: false,
        resetKey: 0,
    });

    const onDeleteOrRestore = (id: number, action: boolean) =>
        setAlert({
            isOpen: true,
            dataId: id,
            delete: action,
            proccessing: false,
        });

    const handlePrint = (type: 'month' | 'year' | 'week' | 'range') => {
        const params = new URLSearchParams({ type });

        if (type === 'year') {
            params.append('year', String(year));
        }

        if (type === 'month' || type === 'week') {
            params.append('month', String(month));
            params.append('year', String(year));
        }

        if (type === 'range') {
            if (!dateRange?.from || !dateRange?.to) {
                toast.error('Pilih tanggal dulu');
                return;
            }

            params.append('start_date', formatDate(dateRange.from));
            params.append('end_date', formatDate(dateRange.to));
        }

        if (isDeletedRoute) {
            params.append('deleted', '1');
        }

        window.open(
            `/reports/print-purchases-report?${params.toString()}`,
            '_blank',
        );
    };

    const getTotal = (row?: Purchase) =>
        Number(row?.quantity || 0) * Number(row?.purchase_price || 0);

    const columns: ColumnDef<Purchase, any>[] = [
        {
            id: 'no',
            header: 'No',
            cell: (info) =>
                (pagination.current_page - 1) * pagination.per_page +
                info.row.index +
                1,
        },
        columnHelper.accessor('code', {
            header: 'Kode',
            footer: () => <span className="font-bold">TOTAL PEMBELIAN</span>,
        }),
        columnHelper.accessor('product_id', {
            header: 'Produk',
            cell: (info) => (
                <div className="max-w-[200px] break-words whitespace-normal">
                    {info.row.original.product?.name ?? '-'}
                </div>
            ),
        }),
        columnHelper.accessor('purchase_date', {
            header: 'Tanggal',
            cell: (info) =>
                new Date(info.getValue()).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                }),
        }),
        columnHelper.display({
            id: 'source',
            header: 'Sumber',
            cell: (info) => {
                const source =
                    info.row.original.inventory_transactions?.[0]?.source;

                const labels: Record<string, string> = {
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

                return labels[source ?? ''] ?? '-';
            },
        }),
        columnHelper.accessor('supplier_id', {
            header: 'Supplier',
            cell: (info) => info.row.original.supplier?.name ?? '-',
        }),
        columnHelper.accessor('quantity', {
            header: 'Qty',
        }),
        columnHelper.accessor('purchase_price', {
            header: 'Harga',
            cell: (info) => formatRupiah(Number(info.getValue() || 0)),
        }),
        columnHelper.display({
            id: 'total',
            header: 'Total',
            cell: (info) => {
                const total = getTotal(info.row.original);
                return <span>{formatRupiah(total)}</span>;
            },
        }),
        columnHelper.display({
            id: 'total_bayar',
            header: 'Total Bayar',
            cell: (info) => {
                const totalBayar = Number(info.row.original.total_payment || 0);
                return <span>{formatRupiah(totalBayar)}</span>;
            },
            footer: () => (
                <span className="font-bold">
                    {formatRupiah(total_purchase)}
                </span>
            ),
        }),
        columnHelper.display({
            id: 'kurang_bayar',
            header: 'Kurang Bayar',
            cell: (info) => {
                const row = info.row.original;
                const total = getTotal(row);
                const totalPayment = Number(row.total_payment || 0);
                const status = String(row.status_payment || '')
                    .toLowerCase()
                    .trim();

                const isFree = status === 'paid' && totalPayment === 0;
                const kurangBayar = isFree ? 0 : total - totalPayment;

                return kurangBayar > 0 ? (
                    <span className="font-semibold text-red-600">
                        {formatRupiah(kurangBayar)}
                    </span>
                ) : (
                    <span>0</span>
                );
            },
        }),
        {
            accessorKey: 'status_payment',
            header: 'Status',
            cell: (info) => {
                const row = info.row.original;
                const rawStatus = info.getValue();
                if (!rawStatus) return '-';

                const status = String(rawStatus).toLowerCase().trim();
                const totalPayment = Number(row.total_payment || 0);

                const isFree = status === 'paid' && totalPayment === 0;

                let label = 'Belum Lunas';
                let color = 'bg-yellow-100 text-yellow-700';

                if (status === 'canceled') {
                    label = 'Dibatalkan';
                    color = 'bg-red-100 text-red-700';
                } else if (status === 'paid') {
                    label = isFree ? 'Gratis' : 'Lunas';
                    color = 'bg-green-100 text-green-700';
                }

                return (
                    <span className={`rounded px-2 py-1 text-xs ${color}`}>
                        {label}
                    </span>
                );
            },
        },
    ];

    if (!isDeletedRoute) {
        columns.push({
            id: 'action',
            header: 'Aksi',
            cell: (info) => {
                const row = info.row.original;
                const status = String(row.status_payment || '')
                    .toLowerCase()
                    .trim();

                return (
                    <div className="flex gap-2">
                        {status === 'pending' && (
                            <Button
                                size="icon"
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={() =>
                                    setPayModal({
                                        open: true,
                                        data: row,
                                        resetKey: Date.now(),
                                    })
                                }
                            >
                                <CircleCheckBig />
                            </Button>
                        )}

                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() =>
                                setEditModal({
                                    open: true,
                                    data: row,
                                })
                            }
                        >
                            <Pencil size={16} />
                        </Button>

                        <Button
                            size="icon"
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={() => onDeleteOrRestore(row.id, true)}
                        >
                            <X size={16} />
                        </Button>
                    </div>
                );
            },
        });
    }

    const table = useReactTable({
        data: pagination.data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const isSameMonth =
        dateRange?.from &&
        dateRange?.to &&
        dateRange.from.getMonth() === dateRange.to.getMonth() &&
        dateRange.from.getFullYear() === dateRange.to.getFullYear();

    const isRangeSelected = dateRange?.from && dateRange?.to;
    const [printType, setPrintType] = useState<string>('');
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <Modal
                open={editModal.open}
                item={editModal.data}
                supplierOptions={supplierOptions}
                onClose={() =>
                    setEditModal({
                        open: false,
                    })
                }
            />

            <Alert
                alertState={alert}
                onAlertClose={() =>
                    setAlert({
                        isOpen: false,
                        proccessing: false,
                        dataId: undefined,
                        delete: true,
                    })
                }
                onAlertProccessing={() =>
                    setAlert((prev) => ({ ...prev, proccessing: true }))
                }
            />

            <NumberBoardModal
                open={payModal.open}
                onClose={() =>
                    setPayModal({
                        open: false,
                        data: undefined,
                        resetKey: 0,
                    })
                }
                grandTotal={
                    getTotal(payModal.data) -
                    (payModal.data?.total_payment ?? 0)
                }
                onConfirm={(amount: number) => {
                    const total = getTotal(payModal.data);
                    const alreadyPaid = payModal.data?.total_payment ?? 0;
                    const remaining = total - alreadyPaid;

                    if (amount > remaining) {
                        toast.error(
                            `Pembayaran melebihi sisa bayar! Sisa: ${remaining.toLocaleString('id-ID')}`,
                        );
                        return;
                    }

                    router.post(
                        purchases.pay(payModal.data!.id).url,
                        { total_payment: amount },
                        {
                            onSuccess: () =>
                                toast.success('Pembayaran berhasil'),
                            onError: () => toast.error('Pembayaran gagal'),
                        },
                    );

                    setPayModal({
                        open: false,
                        data: undefined,
                        resetKey: 0,
                    });
                }}
            />

            <Card>
                <CardHeader>
                    <Form
                        method="GET"
                        action={
                            isDeletedRoute
                                ? purchases.deleted().url
                                : purchases.index().url
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
                        <Tabs value={isDeletedRoute ? 'canceled' : 'active'}>
                            <TabsList>
                                <TabsTrigger value="active" asChild>
                                    <Link
                                        href={purchases.index().url}
                                        preserveState
                                        preserveScroll
                                    >
                                        Pembelian
                                    </Link>
                                </TabsTrigger>

                                <TabsTrigger value="canceled" asChild>
                                    <Link
                                        href={purchases.deleted().url}
                                        preserveState
                                        preserveScroll
                                    >
                                        Pembatalan
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

                    <DataTable columns={columns} table={table} />
                    <TablePagination pagination={pagination} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
