import { Head, Form, usePage, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import products from '@/routes/products';

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
import { Pagination, Product } from '@/lib/model';

import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxList,
    ComboboxItem,
} from '@/components/ui/combobox';

import { useQuery } from '@/hooks/use-query';

import Modal, { ModalState } from '@/components/product/modal';
import Alert, { AlertState } from '@/components/product/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Option = {
    value: string;
    label: string;
};

const title = 'Produk';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: products.index().url,
    },
];

const formatRupiah = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const columnHelper = createColumnHelper<Product>();

type TableMeta = {
    onDeleteOrRestore: (id: number, action: boolean) => void;
    onEdit: (id: number) => void;
    isDeletedRoute: boolean;
};

type Props = {
    pagination: Pagination<Product>;
    categoryOptions: Option[];
};

export default function Index({ pagination, categoryOptions }: Props) {
    const { data } = pagination;
    console.log(data);
    const query = useQuery();
    const search = query.search || '';
    const category_id = query.category_id || 'all';

    const [searchValue, setSearchValue] = useState(search);
    const [categoryValue, setCategoryValue] = useState(category_id);

    const safeCategoryOptions = Array.isArray(categoryOptions)
        ? categoryOptions
        : [];

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

    const onEdit = (id: number) => setModal({ isOpen: true, dataId: id });

    const onDeleteOrRestore = (id: number, action: boolean) =>
        setAlert({
            isOpen: true,
            dataId: id,
            delete: action,
            proccessing: false,
        });

    const { url } = usePage();
    const isDeletedRoute = url.includes('deleted');

    const columns: ColumnDef<Product, any>[] = [
        {
            id: 'no',
            header: 'No',
            cell: (info) =>
                (pagination.current_page - 1) * pagination.per_page +
                info.row.index +
                1,
        },
        columnHelper.accessor('name', { header: 'Nama Produk' }),
        columnHelper.accessor('brand', { header: 'Merk' }),
        columnHelper.accessor('category_id', {
            header: 'Kategori',
            cell: (info) => info.row.original.category?.name ?? '-',
        }),
        columnHelper.accessor('purchase_price', {
            header: 'Harga Beli',
            cell: (info) => formatRupiah(info.getValue()),
        }),

        columnHelper.accessor('selling_price', {
            header: 'Harga Jual',
            cell: (info) => formatRupiah(info.getValue()),
        }),
        columnHelper.accessor('minimum_stock', {
            header: () => <div className="text-center">Minimum Stok</div>,
            cell: (info) => {
                const value = info.getValue();

                return (
                    <div className="text-center">
                        {value == null || value === '' ? '-' : value}
                    </div>
                );
            },
        }),
        columnHelper.accessor('has_expired', {
            header: 'Expired',
            cell: (info) =>
                info.getValue() ? (
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-600">
                        Ya
                    </span>
                ) : (
                    <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-600">
                        Tidak
                    </span>
                ),
        }),
        {
            id: 'action',
            header: 'Aksi',
            cell: (info) => {
                const product = info.row.original as Product & { id: number };
                const meta = info.table.options.meta as TableMeta;

                return (
                    <div className="flex gap-2">
                        {!meta.isDeletedRoute && (
                            <Button
                                size="icon"
                                variant="outline"
                                onClick={() => meta.onEdit(product.id)}
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
                                    product.id,
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

    const table = useReactTable<Product>({
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
                categoryOptions={categoryOptions}
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
                    <span className="hidden lg:inline"> Produk Baru</span>
                </Button>
            </div>

            <Card className="border-0 lg:border lg:py-6">
                <CardHeader className="lg:px-6">
                    <Form method="GET">
                        <div className="grid gap-2 lg:flex">
                            <input type="hidden" name="page" value={1} />

                            <Combobox
                                items={safeCategoryOptions}
                                value={safeCategoryOptions.find(
                                    (el) => el.value == categoryValue,
                                )}
                                onValueChange={(val: Option | null) => {
                                    const newValue = val?.value ?? 'all';

                                    setCategoryValue(newValue);
                                    router.get(
                                        products.index().url,
                                        {
                                            search: searchValue,
                                            category_id: newValue,
                                            page: 1,
                                        },
                                        {
                                            preserveState: true,
                                            replace: true,
                                        },
                                    );
                                }}
                            >
                                <ComboboxInput
                                    placeholder="Pilih Kategori"
                                    className="w-full"
                                />
                                <ComboboxContent>
                                    <ComboboxEmpty>
                                        Tidak ditemukan
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(el) => (
                                            <ComboboxItem
                                                key={el.value}
                                                value={el}
                                            >
                                                {el.label}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>

                            <Input
                                name="search"
                                defaultValue={search}
                                placeholder="Cari..."
                            />

                            <Button type="submit" variant="secondary">
                                <Search /> Cari
                            </Button>
                        </div>
                    </Form>
                </CardHeader>

                <CardContent className="lg:px-6">
                    <Tabs
                        value={isDeletedRoute ? 'deleted' : 'available'}
                        className="mb-4"
                    >
                        <TabsList>
                            <TabsTrigger value="available" asChild>
                                <Link href={products.index().url}>
                                    Tersedia
                                </Link>
                            </TabsTrigger>
                            <TabsTrigger value="deleted" asChild>
                                <Link href={products.deleted().url}>
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
}
