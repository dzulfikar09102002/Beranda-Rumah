import { Head, Form, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';

import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';

import DataTable from '@/components/data-table';
import TablePagination from '@/components/table-pagination';
import { Pagination, Product } from '@/lib/model';
import { useQuery } from '@/hooks/use-query';
import { dashboard } from '@/routes';

const title = 'Expired Detail';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title,
        href: '',
    },
];
type Props = {
    pagination: Pagination<Product>;
};

const columnHelper = createColumnHelper<Product>();

const formatDate = (date: string | null) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};

const columns: ColumnDef<Product, any>[] = [
    {
        id: 'no',
        header: 'No',
        cell: (info) => info.row.index + 1,
    },

    columnHelper.accessor('name', {
        header: 'Produk',
    }),

    columnHelper.accessor('brand', {
        header: 'Brand',
        cell: (info) => info.getValue() ?? '-',
    }),

    columnHelper.display({
        id: 'category',
        header: 'Kategori',
        cell: (info) => info.row.original.category?.name ?? '-',
    }),

    columnHelper.accessor('expired_date', {
        header: 'Expired Date',
        cell: (info) => formatDate(info.getValue()),
    }),
];

export default function ExpiredDetail({ pagination }: Props) {
    const { data } = pagination;

    const search = useQuery().search || '';

    const table = useReactTable<Product>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="mb-4">
                <Button asChild>
                    <Link
                        href={dashboard().url}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden lg:inline">Kembali</span>
                    </Link>
                </Button>
            </div>
            <Card className="border-0 bg-background p-0 lg:border lg:bg-card lg:py-6">
                {/* 🔥 SEARCH HEADER */}
                <CardHeader className="p-0 lg:px-6">
                    <Form method="GET">
                        <div className="grid gap-2 lg:flex">
                            <input type="hidden" name="page" value={1} />

                            <Input
                                name="search"
                                defaultValue={search}
                                placeholder="Cari produk / brand..."
                            />

                            <Button variant="secondary">
                                <Search /> Cari
                            </Button>
                        </div>
                    </Form>
                </CardHeader>

                <CardContent className="border-t p-0 lg:border-0 lg:px-6">
                    <DataTable columns={columns} table={table} />

                    <TablePagination pagination={pagination} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
