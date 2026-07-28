import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import salesSummary from '@/routes/sales-summary';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, SquareArrowOutUpRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';

import DataTable from '@/components/data-table';
import TablePagination from '@/components/table-pagination';
import { Pagination, SalesSummary } from '@/lib/model';

import dayjs from 'dayjs';
import { DateRange } from 'react-day-picker';
import React from 'react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const title = 'History Rekap Penjualan';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: salesSummary.history().url,
    },
];

const columnHelper = createColumnHelper<SalesSummary>();

const columns: ColumnDef<SalesSummary, any>[] = [
    {
        id: 'no',
        header: 'No',
        cell: (info) => info.row.index + 1,
    },
    columnHelper.accessor('date', {
        header: () => <div>Tanggal Rekap</div>,
        cell: (info) => (
            <div>{dayjs(info.getValue()).format('DD MMM YYYY HH:mm')}</div>
        ),
    }),
    columnHelper.accessor('total_sales', {
        header: () => <div className="text-right">Total Penjualan</div>,
        cell: (info) => (
            <div className="text-right">
                {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                }).format(Number(info.getValue()))}
            </div>
        ),
    }),
    columnHelper.accessor('total_transactions', {
        header: () => <div className="text-center">Total Transaksi</div>,
        cell: (info) => <div className="text-center">{info.getValue()}</div>,
    }),
    {
        id: 'action',
        header: () => <div className="text-center">Aksi</div>,
        cell: (info) => {
            const row = info.row.original;
            const meta = info.table.options.meta as {
                onDetail: (id: number) => void;
            };

            return (
                <div className="flex justify-center">
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

type Props = {
    pagination: Pagination<SalesSummary>;
};

export default function History({ pagination }: Props) {
    const { data } = pagination;

    const { url } = usePage();

    // ✅ ambil query param dari URL
    const params = new URLSearchParams(url.split('?')[1]);
    const start = params.get('start_date');
    const end = params.get('end_date');

    // ✅ state tanggal (sync dengan URL)
    const [range, setRange] = React.useState<DateRange | undefined>({
        from: start
            ? dayjs(start, 'YYYY-MM-DD').toDate()
            : dayjs().subtract(7, 'day').toDate(),
        to: end ? dayjs(end, 'YYYY-MM-DD').toDate() : new Date(),
    });

    // ✅ tab aktif
    const activeTab = url.includes('history') ? 'history' : 'today';

    const onDetail = (id: number) => {
        router.get(`/sales-summary/${id}/detail`);
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: {
            onDetail,
        },
    });

    // ✅ kirim filter ke BE
    const handleFilter = () => {
        router.get(
            salesSummary.history().url,
            {
                start_date: range?.from
                    ? dayjs(range.from).format('YYYY-MM-DD')
                    : undefined,
                end_date: range?.to
                    ? dayjs(range.to).format('YYYY-MM-DD')
                    : undefined,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <Card className="border-0 bg-background p-0 lg:border lg:bg-card lg:py-6">
                <CardHeader className="p-0 lg:px-6">
                    <div className="flex justify-end gap-2">
                        <DateRangePicker value={range} onChange={setRange} />

                        <Button onClick={handleFilter} variant="secondary">
                            <Search /> Filter
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="border-t p-0 lg:border-0 lg:px-6">
                    <Tabs value={activeTab} className="mb-4 w-fit">
                        <TabsList>
                            <TabsTrigger value="today" asChild>
                                <Link href={salesSummary.index().url}>
                                    Rekap Hari Ini
                                </Link>
                            </TabsTrigger>

                            <TabsTrigger value="history" asChild>
                                <Link href={salesSummary.history().url}>
                                    Histori Rekap
                                </Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <DataTable columns={columns} table={table} />
                    <TablePagination pagination={pagination} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
