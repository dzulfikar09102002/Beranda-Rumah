import { Form, Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import purchaseMethods from '@/routes/purchase-methods';

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
import { Pagination, PurchaseMethod } from '@/lib/model';
import { useQuery } from '@/hooks/use-query';
import { useState } from 'react';
import Modal, { ModalState } from '@/components/purchase-method/modal';
import Alert, { AlertState } from '@/components/purchase-method/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const title = 'Metode Pembelian';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: purchaseMethods.index().url,
    },
];

const columnHelper = createColumnHelper<PurchaseMethod>();

type TableMeta = {
    onDeleteOrRestore: (id: number, action: boolean) => void;
    onEdit: (id: number) => void;
    isDeletedRoute: boolean;
};

const columns: ColumnDef<PurchaseMethod, any>[] = [
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
            const pmethod = info.row.original as PurchaseMethod & {
                id: number;
            };
            const meta = info.table.options.meta as TableMeta;

            return (
                <div className="flex gap-2">
                    {!meta.isDeletedRoute && (
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => meta.onEdit(pmethod.id)}
                        >
                            <Pencil size={16} />
                        </Button>
                    )}

                    <Button
                        size="icon"
                        variant={
                            meta.isDeletedRoute ? 'outline' : 'destructive'
                        }
                        onClick={() =>
                            meta.onDeleteOrRestore(
                                pmethod.id,
                                !meta.isDeletedRoute,
                            )
                        }
                    >
                        {meta.isDeletedRoute ? (
                            <ArchiveRestore size={16} />
                        ) : (
                            <X size={16} />
                        )}
                    </Button>
                </div>
            );
        },
    },
];

type Props = {
    pagination: Pagination<PurchaseMethod>;
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
        dataId: undefined,
        proccessing: false,
    });

    const onModalSuccess = () => setModal({ isOpen: false, dataId: undefined });

    const onModalClose = () => setModal({ isOpen: false, dataId: undefined });

    const onAlertClose = () =>
        setAlert({
            isOpen: false,
            proccessing: false,
            dataId: undefined,
            delete: true,
        });

    const onAlertProccessing = () =>
        setAlert((prev) => ({ ...prev, proccessing: true }));

    const onEdit = (id: number) =>
        setModal({
            isOpen: true,
            dataId: id,
        });

    const onDeleteOrRestore = (id: number, action: boolean) =>
        setAlert({
            isOpen: true,
            dataId: id,
            delete: action,
            proccessing: false,
        });

    const { url } = usePage();
    const isDeletedRoute = url.includes('deleted');

    const { data } = pagination;
    const search = useQuery().search || '';

    const table = useReactTable<PurchaseMethod>({
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
                onAlertProccessing={onAlertProccessing}
            />

            <div className="mb-4">
                <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() =>
                        setModal({ isOpen: true, dataId: undefined })
                    }
                >
                    <Plus />
                    <span className="hidden lg:inline"> Metode Baru</span>
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
                                placeholder="Cari..."
                            />
                            <Button variant="secondary">
                                <Search /> Cari
                            </Button>
                        </div>
                    </Form>
                </CardHeader>

                <CardContent className="border-t p-0 lg:border-0 lg:px-6">
                    <Tabs
                        value={isDeletedRoute ? 'deleted' : 'available'}
                        className="mb-4"
                    >
                        <TabsList>
                            <TabsTrigger value="available" asChild>
                                <Link href={purchaseMethods.index().url}>
                                    Tersedia
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="deleted" asChild>
                                <Link href={purchaseMethods.deleted().url}>
                                    Terhapus
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
};
