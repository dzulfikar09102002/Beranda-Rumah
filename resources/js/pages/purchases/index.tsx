import { Form, Head, useForm } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    Save,
    Search,
    Trash,
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxList,
    ComboboxItem,
} from '@/components/ui/combobox';
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';

import DataTable from '@/components/data-table';
import { Pagination, Product, Purchase } from '@/lib/model';
import { useQuery } from '@/hooks/use-query';
import { useEffect, useState } from 'react';
import purchases from '@/routes/purchases';
import TablePagination from '@/components/table-pagination';
import { FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import axios from 'axios';

const title = 'Barang Masuk';

type Option = {
    value: string;
    label: string;
};

type Item = {
    product_id: number;
    name: string;
    quantity: number;
    purchase_price: number;
    selling_price: number;

    code: string;
    year: number;

    purchase_date: string;
    expired_date: string | null;
    supplier_id: number | null;
    source: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: purchases.index().url,
    },
];

type Props = {
    pagination: Pagination<Product>;
    categoryOptions: Option[];
    supplierOptions: Option[];
};

export default function Index({
    pagination,
    categoryOptions,
    supplierOptions,
}: Props) {
    const { data: products } = pagination;

    const { data, setData, post, processing, errors } = useForm<{
        items: Item[];
        supplier_id: string | null;
    }>({
        items: [],
        supplier_id: null,
    });
    const today = () => {
        const d = new Date();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${d.getFullYear()}-${month}-${day}`;
    };
    const err = (key: string) => ((errors as any)[key] ? 'border-red-500' : '');
    const safeSupplierOptions = Array.isArray(supplierOptions)
        ? supplierOptions
        : [];
    const [supplierValue, setSupplierValue] = useState<string | null>(null);
    const query = useQuery();
    const search = query.search || '';
    const product_category_id = query.product_category_id || 'all';
    const generateCode = async (index: number, item: Item) => {
        try {
            const res = await axios.post('/purchases/generate-code', {
                product_id: item.product_id,
                year: item.year,
                expired_date: item.expired_date,
            });

            updateItem(index, 'code', res.data.code);
        } catch (err) {
            toast.error('Gagal generate kode');
        }
    };
    const [categoryValue, setCategoryValue] = useState(product_category_id);

    const safeCategoryOptions = Array.isArray(categoryOptions)
        ? categoryOptions
        : [];

    const addItem = (product: Product) => {
        const exist = data.items.find((x) => x.product_id === product.id);

        if (exist) {
            setData(
                'items',
                data.items.map((x) =>
                    x.product_id === product.id
                        ? { ...x, quantity: x.quantity + 1 }
                        : x,
                ),
            );
            return;
        }

        const year = new Date().getFullYear();

        setData('items', [
            ...data.items,
            {
                product_id: product.id,
                name: product.name,
                quantity: 1,
                purchase_price: Math.round(product.purchase_price),
                selling_price: Math.round(product.selling_price),
                purchase_date: '',
                expired_date: product.expired_date
                    ? new Date(product.expired_date).toISOString().split('T')[0]
                    : null,
                year,
                code: '',
                supplier_id: null,
                source: '',
            },
        ]);
    };

    const updateItem = (index: number, field: keyof Item, value: any) => {
        const updated = data.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item,
        );

        setData('items', updated);
    };

    const removeItem = (index: number) => {
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const yearOptions: Option[] = Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - i;

        return {
            value: String(year),
            label: String(year),
        };
    });

    const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        router.get(
            purchases.index().url,
            {
                search: formData.get('search'),
                product_category_id:
                    categoryValue === 'all' ? '' : categoryValue,
                page: 1,
            },
            {
                preserveState: true,
                replace: true,
                only: ['pagination'],
            },
        );
    };
    const {
        prev_page_url,
        next_page_url,
        current_page,
        last_page,
        first_page_url,
    } = pagination;
    const sourceOptions: Option[] = [
        { value: 'purchase', label: 'Pembelian' },
        { value: 'consignment', label: 'Titipan' },
        { value: 'return', label: 'Pengembalian' },
        { value: 'adjustment', label: 'Penyesuaian' },
        { value: 'transfer', label: 'Transfer Masuk' },
        { value: 'other', label: 'Lainnya' },
    ];
    const inertiaOptions = {
        preserveScroll: true,
        preserveState: true,
        only: ['pagination'],
    };

    const handlePageChange = (page: string | null) => {
        if (!page) return;

        router.get(first_page_url, { page }, inertiaOptions);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[60%_40%]">
                <Card className="flex flex-col">
                    <CardHeader>
                        <form onSubmit={handleSearch}>
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
                                            purchases.index().url,
                                            {
                                                search,
                                                product_category_id: newValue,
                                                page: 1,
                                            },
                                            {
                                                preserveState: true,
                                                replace: true,
                                                only: ['pagination'],
                                            },
                                        );
                                    }}
                                >
                                    <ComboboxInput
                                        placeholder="Pilih Kategori"
                                        className="w-full"
                                    />
                                    <input
                                        type="hidden"
                                        name="product_category_id"
                                        value={
                                            categoryValue === 'all'
                                                ? ''
                                                : categoryValue
                                        }
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
                                    placeholder="Cari produk..."
                                />

                                <Button type="submit" variant="secondary">
                                    <Search /> Cari
                                </Button>
                            </div>
                        </form>
                    </CardHeader>

                    <CardContent className="flex-1">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                            {products.length === 0 ? (
                                <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                                    Tidak ada data produk
                                </div>
                            ) : (
                                products.map((product) => (
                                    <Card
                                        key={product.id}
                                        className="cursor-pointer transition hover:shadow-md"
                                        onClick={() => addItem(product)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="text-sm font-semibold">
                                                {product.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {product.brand}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center gap-2 text-sm">
                                <div>Halaman</div>

                                <Button
                                    size="icon"
                                    variant="outline"
                                    disabled={!prev_page_url}
                                    onClick={() =>
                                        prev_page_url &&
                                        router.get(
                                            prev_page_url,
                                            {},
                                            inertiaOptions,
                                        )
                                    }
                                >
                                    <ChevronLeft />
                                </Button>

                                <Combobox
                                    items={Array.from(
                                        { length: last_page },
                                        (_, i) => (i + 1).toString(),
                                    )}
                                    value={String(current_page)}
                                    onValueChange={handlePageChange}
                                >
                                    <ComboboxInput placeholder="Pilih Halaman" />

                                    <ComboboxContent>
                                        <ComboboxEmpty>
                                            No items found.
                                        </ComboboxEmpty>
                                        <ComboboxList>
                                            {(page) => (
                                                <ComboboxItem
                                                    key={page}
                                                    value={page}
                                                >
                                                    {page}
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>

                                <Button
                                    size="icon"
                                    variant="outline"
                                    disabled={!next_page_url}
                                    onClick={() =>
                                        next_page_url &&
                                        router.get(
                                            next_page_url,
                                            {},
                                            inertiaOptions,
                                        )
                                    }
                                >
                                    <ChevronRight />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex h-full flex-col">
                    <CardHeader>
                        <h3 className="text-lg font-semibold">
                            Form Pembelian & Barang Masuk
                        </h3>
                    </CardHeader>

                    <CardContent className="max-h-[60vh] flex-1 overflow-y-auto">
                        <div className="space-y-3">
                            {data.items.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada produk dipilih
                                </p>
                            )}

                            {data.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="space-y-2 rounded-lg border p-3"
                                >
                                    <div className="font-medium">
                                        {item.name}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <FieldLabel>
                                            Kode{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                value={item.code}
                                                className={err(
                                                    `items.${index}.code`,
                                                )}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        'code',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={async () => {
                                                    try {
                                                        const res =
                                                            await axios.post(
                                                                '/purchases/generate-code',
                                                                {
                                                                    product_id:
                                                                        item.product_id,
                                                                    year: item.year,
                                                                    expired_date:
                                                                        item.expired_date,
                                                                },
                                                            );

                                                        const code =
                                                            res.data.code;

                                                        updateItem(
                                                            index,
                                                            'code',
                                                            code,
                                                        );
                                                    } catch (err) {
                                                        toast.error(
                                                            'Gagal generate kode',
                                                        );
                                                    }
                                                }}
                                            >
                                                Generate
                                            </Button>
                                        </div>
                                        <FieldLabel>
                                            Jumlah{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <div className="flex gap-1">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="secondary"
                                                onClick={() =>
                                                    updateItem(
                                                        index,
                                                        'quantity',
                                                        Math.max(
                                                            1,
                                                            item.quantity - 1,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Minus />
                                            </Button>

                                            <Input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        'quantity',
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />

                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="secondary"
                                                onClick={() =>
                                                    updateItem(
                                                        index,
                                                        'quantity',
                                                        item.quantity + 1,
                                                    )
                                                }
                                            >
                                                <Plus />
                                            </Button>
                                        </div>
                                        <FieldLabel>
                                            Tahun{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Combobox
                                            items={yearOptions}
                                            value={yearOptions.find(
                                                (opt) =>
                                                    Number(opt.value) ===
                                                    item.year,
                                            )}
                                            onValueChange={(
                                                val: Option | null,
                                            ) => {
                                                const newYear = Number(
                                                    val?.value,
                                                );

                                                const shortYear =
                                                    String(newYear).slice(-2);
                                                const updated = data.items.map(
                                                    (x, i) =>
                                                        i === index
                                                            ? {
                                                                  ...x,
                                                                  year: newYear,
                                                                  code: '',
                                                              }
                                                            : x,
                                                );

                                                setData('items', updated);

                                                setData('items', updated);
                                            }}
                                        >
                                            <ComboboxInput
                                                placeholder="Pilih Tahun"
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
                                        <FieldLabel>
                                            Harga Beli{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            type="number"
                                            value={item.purchase_price}
                                            className={err(
                                                `items.${index}.purchase_price`,
                                            )}
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    'purchase_price',
                                                    Number(e.target.value),
                                                )
                                            }
                                        />
                                        <FieldLabel>
                                            Harga Jual{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <Input
                                            type="number"
                                            value={item.selling_price}
                                            className={err(
                                                `items.${index}.selling_price`,
                                            )}
                                            onChange={(e) =>
                                                updateItem(
                                                    index,
                                                    'selling_price',
                                                    Number(e.target.value),
                                                )
                                            }
                                        />
                                        <FieldLabel>
                                            Sumber{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>

                                        <Combobox
                                            items={sourceOptions}
                                            value={sourceOptions.find(
                                                (opt) =>
                                                    opt.value === item.source,
                                            )}
                                            onValueChange={(
                                                val: Option | null,
                                            ) => {
                                                updateItem(
                                                    index,
                                                    'source',
                                                    val?.value ?? 'purchase',
                                                );
                                            }}
                                        >
                                            <ComboboxInput
                                                placeholder="Pilih Sumber"
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
                                        <FieldLabel>
                                            Tanggal Masuk{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </FieldLabel>
                                        <DatePicker
                                            value={item.purchase_date}
                                            onChange={(val) =>
                                                updateItem(
                                                    index,
                                                    'purchase_date',
                                                    val,
                                                )
                                            }
                                        />
                                        <FieldLabel>Tanggal Expired</FieldLabel>
                                        <DatePicker
                                            value={item.expired_date}
                                            onChange={(val) => {
                                                const updated = data.items.map(
                                                    (x, i) =>
                                                        i === index
                                                            ? {
                                                                  ...x,
                                                                  expired_date:
                                                                      val,
                                                                  code: '',
                                                              }
                                                            : x,
                                                );

                                                setData('items', updated);
                                            }}
                                        />
                                        <FieldLabel>
                                            Supplier{' '}
                                            {item.source === 'consignment' && (
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            )}
                                        </FieldLabel>

                                        <Combobox
                                            items={safeSupplierOptions}
                                            value={safeSupplierOptions.find(
                                                (el) =>
                                                    Number(el.value) ===
                                                    item.supplier_id,
                                            )}
                                            onValueChange={(
                                                val: Option | null,
                                            ) => {
                                                updateItem(
                                                    index,
                                                    'supplier_id',
                                                    val?.value
                                                        ? Number(val.value)
                                                        : null,
                                                );
                                            }}
                                        >
                                            <ComboboxInput
                                                placeholder="Pilih Supplier"
                                                className={`w-full ${
                                                    item.source ===
                                                        'consignment' &&
                                                    !item.supplier_id
                                                        ? 'border-red-500 focus:ring-red-500'
                                                        : ''
                                                }`}
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

                                        {item.source === 'consignment' &&
                                            !item.supplier_id && (
                                                <p className="text-xs text-red-500">
                                                    Supplier wajib untuk barang
                                                    titipan
                                                </p>
                                            )}
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => removeItem(index)}
                                        >
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <Button
                        className="mx-auto mt-4 w-[95%] cursor-pointer"
                        disabled={processing}
                        onClick={() =>
                            post(purchases.store().url, {
                                onSuccess: () => {
                                    setData('items', []);
                                    toast.success('Data berhasil disimpan');
                                },
                            })
                        }
                    >
                        {processing ? (
                            <>
                                <Spinner /> Menyimpan
                            </>
                        ) : (
                            <>
                                <Save /> Simpan Semua
                            </>
                        )}
                    </Button>
                </Card>
            </div>
        </AppLayout>
    );
}
