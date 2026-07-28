import { Form, Head, Link } from '@inertiajs/react';
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
import { Pagination } from '@/lib/model';
import { useQuery } from '@/hooks/use-query';
import { dashboard } from '@/routes';

const title = 'Produk Terlaris';

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

type ProductRow = {
    purchase_id: number;
    total_sold: number;
    purchase?: {
        product?: {
            name: string;
            brand: string;
            category?: {
                name: string;
            };
        };
    };
};

type Props = {
    pagination: Pagination<ProductRow>;
};

const columnHelper = createColumnHelper<ProductRow>();

const columns: ColumnDef<ProductRow, any>[] = [
    {
        id: 'no',
        header: 'No',
        cell: (info) => info.row.index + 1,
    },

    columnHelper.display({
        id: 'name',
        header: 'Produk',
        cell: (info) => info.row.original.purchase?.product?.name ?? '-',
    }),

    columnHelper.display({
        id: 'brand',
        header: 'Brand',
        cell: (info) => info.row.original.purchase?.product?.brand ?? '-',
    }),

    columnHelper.display({
        id: 'category',
        header: 'Kategori',
        cell: (info) =>
            info.row.original.purchase?.product?.category?.name ?? '-',
    }),

    columnHelper.accessor('total_sold', {
        header: 'Total Terjual',
        cell: (info) => info.getValue() ?? 0,
    }),
];

export default function BestSellingDetail({ pagination }: Props) {
    const { data } = pagination;
    const search = useQuery().search || '';

    const table = useReactTable<ProductRow>({
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
                <CardHeader className="p-0 lg:px-6">
                    <Form method="GET">
                        <div className="grid gap-2 lg:flex">
                            <input type="hidden" name="page" value={1} />
                            <Input
                                defaultValue={search}
                                name="search"
                                placeholder="Cari produk..."
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
