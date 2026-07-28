import { Head, useForm } from '@inertiajs/react';
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
    Search,
    ShoppingCart,
} from 'lucide-react';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxList,
    ComboboxItem,
} from '@/components/ui/combobox';
import { Pagination, Purchase } from '@/lib/model';
import { useQuery } from '@/hooks/use-query';
import { useEffect, useRef, useState } from 'react';
import sellings from '@/routes/sellings';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { FieldLabel } from '@/components/ui/field';
import { DatePicker } from '@/components/ui/date-picker';
import NumberBoardDiscount from '@/components/number-board-discount';

const title = 'Barang Keluar';

type Option = {
    value: string;
    label: string;
};

type Item = {
    purchase_id: number;
    product_id: number;
    name: string;
    quantity: number;
    purchase_price: number;
    selling_price: number;

    code: string;
    year: number;

    purchase_date: string;
    expired_date: string | null;
    source: string;
    stock: number;
    discount?: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: sellings.index().url,
    },
];

type Props = {
    pagination: Pagination<Purchase>;
    categoryOptions: Option[];
    supplierOptions: Option[];
};

export default function Index({ pagination, categoryOptions }: Props) {
    const { data: products } = pagination;

    const { data, setData, post, processing, errors } = useForm<{
        items: Item[];
        transaction_date: string | null;
    }>({
        items: [],
        transaction_date: null,
    });
    const err = (key: string) => ((errors as any)[key] ? 'border-red-500' : '');
    const query = useQuery();
    const search = query.search || '';
    const product_category_id = query.product_category_id || 'all';

    const [categoryValue, setCategoryValue] = useState(product_category_id);

    const safeCategoryOptions = Array.isArray(categoryOptions)
        ? categoryOptions
        : [];

    const addItem = (purchase: any) => {
        const product = purchase.product;

        const exist = data.items.find((x) => x.purchase_id === purchase.id);
        if (exist && exist.quantity >= exist.stock) {
            return;
        }

        if (exist) {
            setData(
                'items',
                data.items.map((x) =>
                    x.purchase_id === purchase.id
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
                purchase_id: purchase.id,
                product_id: product.id,

                name: product.name,
                quantity: 1,

                purchase_price: Math.round(purchase.purchase_price),
                selling_price: Math.round(purchase.selling_price),

                purchase_date: purchase.purchase_date,
                expired_date: purchase.expired_date,

                year,
                code: purchase.code,
                source: 'purchase',
                stock: purchase.total_quantity,
                discount: 0,
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
    const totalBarang = data.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );
    const getItemSubtotal = (item: Item) => {
        const gross = item.quantity * item.selling_price;
        return gross - (item.discount || 0);
    };

    const totalDiscount = data.items.reduce(
        (sum, item) => sum + (item.discount || 0),
        0,
    );
    const subtotal = data.items.reduce(
        (sum, item) => sum + getItemSubtotal(item),
        0,
    );

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        router.get(
            sellings.index().url,
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

    const inertiaOptions = {
        preserveScroll: true,
        preserveState: true,
        only: ['pagination'],
    };
    const [searchValue, setSearchValue] = useState(search);
    const handlePageChange = (page: string | null) => {
        if (!page) return;

        router.get(first_page_url, { page }, inertiaOptions);
    };
    const [submitting, setSubmitting] = useState(false);
    const [discountModalOpen, setDiscountModalOpen] = useState(false);
    const [selectedDiscountIndex, setSelectedDiscountIndex] = useState<
        number | null
    >(null);
    const openDiscountModal = (index: number) => {
        setSelectedDiscountIndex(index);
        setDiscountModalOpen(true);
    };

    const applyDiscount = (amount: number) => {
        if (selectedDiscountIndex === null) return;

        updateItem(selectedDiscountIndex, 'discount', amount);

        setDiscountModalOpen(false);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[60%_40%]">
                <Card className="flex flex-col">
                    <CardHeader>
                        <div className="grid gap-2 lg:grid-cols-[30%_70%]">
                            <Combobox
                                items={safeCategoryOptions}
                                value={safeCategoryOptions.find(
                                    (el) => el.value == categoryValue,
                                )}
                                onValueChange={(val: Option | null) => {
                                    const newValue = val?.value ?? 'all';

                                    setCategoryValue(newValue);

                                    router.get(
                                        sellings.index().url,
                                        {
                                            search,
                                            product_category_id:
                                                newValue === 'all'
                                                    ? ''
                                                    : newValue,
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
                            <form onSubmit={handleSearch} className="w-full">
                                <Input
                                    name="search"
                                    defaultValue={search}
                                    placeholder="Cari produk..."
                                />
                            </form>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                            {products.length === 0 ? (
                                <div className="col-span-full flex items-center justify-center py-10 text-sm text-muted-foreground">
                                    Tidak ada data produk
                                </div>
                            ) : (
                                products.map((purchase) => {
                                    const product = purchase.product;
                                    const exist = data.items.find(
                                        (x) => x.purchase_id === purchase.id,
                                    );

                                    const isMax =
                                        exist &&
                                        exist.quantity >=
                                            purchase.total_quantity;

                                    return (
                                        <Card
                                            key={purchase.id}
                                            className={`relative transition hover:shadow-md ${
                                                purchase.total_quantity <= 0 ||
                                                isMax
                                                    ? 'cursor-not-allowed opacity-50'
                                                    : 'cursor-pointer'
                                            }`}
                                            onClick={() => {
                                                if (
                                                    purchase.total_quantity >
                                                        0 &&
                                                    !isMax
                                                ) {
                                                    addItem(purchase);
                                                }
                                            }}
                                        >
                                            <CardContent className="pl-4">
                                                <div className="absolute top-1 right-2">
                                                    <span
                                                        className={`rounded px-2 py-0.5 text-[11px] font-medium text-white ${
                                                            purchase.total_quantity >
                                                            0
                                                                ? 'bg-green-500'
                                                                : 'bg-red-500'
                                                        }`}
                                                    >
                                                        Stok :{' '}
                                                        {
                                                            purchase.total_quantity
                                                        }
                                                    </span>
                                                </div>

                                                <div className="mt-2 text-sm font-semibold">
                                                    {product?.name}
                                                </div>

                                                <div className="text-xs text-muted-foreground">
                                                    {product?.brand}
                                                </div>

                                                <div className="text-md mt-4 font-semibold">
                                                    {new Intl.NumberFormat(
                                                        'id-ID',
                                                        {
                                                            style: 'currency',
                                                            currency: 'IDR',
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 0,
                                                        },
                                                    ).format(
                                                        Number(
                                                            purchase?.selling_price ??
                                                                0,
                                                        ),
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
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
                            Daftar Pesanan ({data.items.length})
                        </h3>
                    </CardHeader>

                    <CardContent className="max-h-[45vh] flex-1 overflow-y-auto">
                        <div className="space-y-3">
                            {data.items.length === 0 && (
                                <p className="text-sm text-muted-foreground">
                                    Belum ada produk dipilih
                                </p>
                            )}

                            {data.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="space-y-2 border-b pb-3"
                                >
                                    <div className="flex justify-between">
                                        <div className="font-medium">
                                            {item.name}
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            {item.selling_price.toLocaleString(
                                                'id-ID',
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-9 w-9 cursor-pointer"
                                                onClick={() => {
                                                    if (item.quantity <= 1) {
                                                        removeItem(index);
                                                    } else {
                                                        updateItem(
                                                            index,
                                                            'quantity',
                                                            item.quantity - 1,
                                                        );
                                                    }
                                                }}
                                            >
                                                <Minus size={14} />
                                            </Button>

                                            <Input
                                                type="number"
                                                min={0}
                                                className="h-9 w-16 px-1 text-center"
                                                value={item.quantity}
                                                onChange={(e) => {
                                                    const val = e.target.value;

                                                    if (val === '') {
                                                        updateItem(
                                                            index,
                                                            'quantity',
                                                            0,
                                                        );
                                                        return;
                                                    }

                                                    const num = Number(val);

                                                    if (num <= 0) {
                                                        removeItem(index);
                                                    } else if (
                                                        num > item.stock
                                                    ) {
                                                        updateItem(
                                                            index,
                                                            'quantity',
                                                            item.stock,
                                                        );
                                                    } else {
                                                        updateItem(
                                                            index,
                                                            'quantity',
                                                            num,
                                                        );
                                                    }
                                                }}
                                            />

                                            <Button
                                                size="icon"
                                                variant="secondary"
                                                className="h-9 w-9 cursor-pointer"
                                                disabled={
                                                    item.quantity >= item.stock
                                                }
                                                onClick={() =>
                                                    updateItem(
                                                        index,
                                                        'quantity',
                                                        item.quantity + 1,
                                                    )
                                                }
                                            >
                                                <Plus size={14} />
                                            </Button>
                                        </div>
                                        <div className="text-base font-semibold">
                                            {(
                                                item.quantity *
                                                item.selling_price
                                            ).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center justify-between text-xs">
                                        <div className="space-x-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openDiscountModal(index)
                                                }
                                                className="cursor-pointer font-medium text-blue-600 hover:underline"
                                            >
                                                Tambah diskon
                                            </button>

                                            {!!item.discount && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        updateItem(
                                                            index,
                                                            'discount',
                                                            0,
                                                        )
                                                    }
                                                    className="cursor-pointer text-blue-600 hover:underline"
                                                >
                                                    Hapus diskon
                                                </button>
                                            )}
                                        </div>

                                        {!!item.discount && (
                                            <span className="text-muted-foreground">
                                                Diskon :{' '}
                                                {item.discount.toLocaleString(
                                                    'id-ID',
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <div className="mx-auto mt-4 w-[95%] space-y-1 border-t pt-3 text-sm">
                        <div className="mb-3 grid grid-cols-[150px_1fr] items-center gap-3">
                            <FieldLabel>
                                Tanggal Penjualan{' '}
                                <span className="text-red-500">*</span>
                            </FieldLabel>

                            <DatePicker
                                value={data.transaction_date}
                                onChange={(val) =>
                                    setData('transaction_date', val)
                                }
                            />
                        </div>
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{subtotal.toLocaleString('id-ID')}</span>
                        </div>

                        <div className="flex justify-between">
                            <span>Total Barang</span>
                            <span>{totalBarang}</span>
                        </div>

                        <div className="flex justify-between text-base font-semibold">
                            <span>Total</span>
                            <span>{subtotal.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                    <Button
                        className="mx-auto mt-4 w-[95%] cursor-pointer"
                        disabled={submitting || data.items.length === 0}
                        onClick={() => {
                            if (submitting) return;

                            if (!data.transaction_date) {
                                toast.error('Tanggal wajib diisi');
                                return;
                            }

                            const selectedDate = data.transaction_date;
                            const today = new Date()
                                .toISOString()
                                .split('T')[0];

                            let finalDate = selectedDate;

                            if (selectedDate === today) {
                                finalDate = new Date().toISOString();
                            }

                            const payload = {
                                transaction_date: finalDate,
                                items: data.items,
                            };

                            setSubmitting(true);

                            router.post(sellings.store().url, payload, {
                                onSuccess: () => {
                                    setData({
                                        items: [],
                                        transaction_date: null,
                                    });

                                    toast.success('Data berhasil disimpan');
                                },

                                onError: () => {
                                    toast.error('Gagal menyimpan data');
                                },

                                onFinish: () => {
                                    setSubmitting(false);
                                },
                            });
                        }}
                    >
                        {submitting ? (
                            <>
                                <Spinner /> Memproses
                            </>
                        ) : (
                            <>
                                <ShoppingCart /> Checkout
                            </>
                        )}
                    </Button>
                </Card>
            </div>
            <NumberBoardDiscount
                open={discountModalOpen}
                onClose={() => setDiscountModalOpen(false)}
                productName={
                    selectedDiscountIndex !== null
                        ? data.items[selectedDiscountIndex]?.name
                        : ''
                }
                grandTotal={
                    selectedDiscountIndex !== null
                        ? data.items[selectedDiscountIndex].quantity *
                          data.items[selectedDiscountIndex].selling_price
                        : 0
                }
                onConfirm={(amount) => {
                    if (selectedDiscountIndex === null) return;

                    const item = data.items[selectedDiscountIndex];
                    const max = item.quantity * item.selling_price;

                    updateItem(
                        selectedDiscountIndex,
                        'discount',
                        Math.min(amount, max),
                    );

                    setDiscountModalOpen(false);
                }}
            />
        </AppLayout>
    );
}
