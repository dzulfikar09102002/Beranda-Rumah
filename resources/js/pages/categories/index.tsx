import { Form, Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import categories from '@/routes/categories';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search, X, ArchiveRestore, Pencil } from 'lucide-react';

import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';

import DataTable from '@/components/data-table';
import TablePagination from '@/components/table-pagination';
import { Pagination, Category } from '@/lib/model';
import { useQuery } from '@/hooks/use-query';
import { useState } from 'react';
import Modal, { ModalState } from '@/components/category-method/modal';
import Alert, { AlertState } from '@/components/category-method/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const title = 'Kategori';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: categories.index().url,
    },
];

const columnHelper = createColumnHelper<Category>();

type TableMeta = {
    onDeleteOrRestore: (id: number, action: boolean) => void;
    onEdit: (id: number) => void;
    isDeletedRoute: boolean;
};

const columns: ColumnDef<Category, any>[] = [
    {
        id: 'no',
        header: 'No',
        cell: (info) => info.row.index + 1,
    },
    columnHelper.accessor('name', {
        header: 'Nama',
    }),
    {
        id: 'action',
        header: 'Aksi',
        cell: (info) => {
            const category = info.row.original as Category & { id: number };
            const meta = info.table.options.meta as TableMeta;

            return (
                <div className="flex gap-2">
                    {!meta.isDeletedRoute && (
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => meta.onEdit(category.id)}
                        >
                            <Pencil size={16} />
                        </Button>
                    )}

                    <Button
                        size="icon"
                        variant={meta.isDeletedRoute ? 'outline' : 'destructive'}
                        onClick={() =>
                            meta.onDeleteOrRestore(category.id, !meta.isDeletedRoute)
                        }
                    >
                        {meta.isDeletedRoute ? <ArchiveRestore size={16} /> : <X size={16} />}
                    </Button>
                </div>
            );
        },
    },
];

type Props = {
    pagination: Pagination<Category>;
    onlyTrashed?: boolean;
};

export default ({ pagination }: Props) => {
    const [modal, setModal] = useState<ModalState>({
        isOpen: false,
        dataId: undefined,
    });

  const [alert, setAlert] = useState<AlertState>({
    delete: true,
    isOpen: false,
    dataId: undefined, // bisa juga null
    processing: false, // ganti dari proccessing
});

const onModalSuccess = () => setModal({ isOpen: false, dataId: undefined });
const onModalClose = () => setModal({ isOpen: false, dataId: undefined });

const onAlertClose = () =>
    setAlert({ isOpen: false, processing: false, dataId: undefined, delete: true });

const onAlertProcessing = () =>
    setAlert((prev) => ({ ...prev, processing: true })); // ganti proccessing

const onEdit = (id: number) => setModal({ isOpen: true, dataId: id });
const onDeleteOrRestore = (id: number, action: boolean) =>
    setAlert({ isOpen: true, dataId: id, delete: action, processing: false }); // ganti juga

    const { url } = usePage();
    const isDeletedRoute = url.includes('deleted');
    const { data } = pagination;
    const search = useQuery().search || '';

    const table = useReactTable<Category>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: {
            onDeleteOrRestore,
            onEdit,
            isDeletedRoute,
        } as TableMeta,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <Modal
                modalState={modal}
                onModalClose={onModalClose}
                onModalSuccess={onModalSuccess}
                tableData={pagination.data}
            />

            <Alert
    alertState={alert}
    onAlertClose={onAlertClose}
    onAlertProcessing={onAlertProcessing} 
/>

            <div className="mb-4">
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setModal({ isOpen: true, dataId: undefined })}
                >
                    <Plus />
                    <span className="hidden lg:inline"> Kategori Baru</span>
                </Button>
            </div>

            <Card className="border-0 bg-background p-0 lg:border lg:bg-card lg:py-6">
                <CardHeader className="p-0 lg:px-6">
                    <Form method="GET">
                        <div className="grid gap-2 lg:flex">
                            <input type="hidden" name="page" value={1} />
                            <Input defaultValue={search} name="search" placeholder="Cari..." />
                            <Button variant="secondary">
                                <Search /> Cari
                            </Button>
                        </div>
                    </Form>
                </CardHeader>

                <CardContent className="border-t p-0 lg:border-0 lg:px-6">
                    <Tabs value={isDeletedRoute ? 'deleted' : 'available'} className="mb-4">
                        <TabsList>
                            <TabsTrigger value="available" asChild>
                                <Link href={categories.index().url}>Tersedia</Link>
                            </TabsTrigger>
                            <TabsTrigger value="deleted" asChild>
                                <Link href={categories.deleted().url}>Terhapus</Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <DataTable columns={columns} table={table} />

                    <TablePagination pagination={pagination} />
                </CardContent>
            </Card>
        </AppLayout>
    );
};