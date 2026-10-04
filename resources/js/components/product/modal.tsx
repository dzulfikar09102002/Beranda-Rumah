import {
    Dialog,
    DialogCancel,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Field, FieldError, FieldLabel, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { SubmitEventHandler, useEffect, useRef, useState } from 'react';
import { ImageIcon, ImageOff, X } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import products from '@/routes/products';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '../ui/combobox';

function ImagePreview({ url }: { url: string }) {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
        'loading',
    );
    const [lastUrl, setLastUrl] = useState(url);

    if (url !== lastUrl) {
        setLastUrl(url);
        setStatus('loading');
    }

    if (!url) {
        return (
            <div className="flex aspect-square w-20 shrink-0 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                <ImageIcon className="h-6 w-6" />
            </div>
        );
    }

    return (
        <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
            {status === 'error' ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center text-[10px] text-destructive">
                    <ImageOff className="h-5 w-5" />
                    Gagal dimuat
                </div>
            ) : (
                <img
                    key={url}
                    src={url}
                    alt="Preview"
                    onLoad={() => setStatus('loaded')}
                    onError={() => setStatus('error')}
                    className={`h-full w-full object-cover transition-opacity ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                />
            )}
            {status === 'loading' && (
                <div className="absolute inset-0 animate-pulse bg-muted" />
            )}
        </div>
    );
}

export type ModalState = {
    isOpen: boolean;
    dataId: any;
};

type Option = {
    value: string;
    label: string;
};

type Props = {
    modalState: ModalState;
    tableData: any[];
    categoryOptions: Option[];
    onModalSuccess: () => void;
    onModalClose: () => void;
};

export default function Modal({
    modalState,
    tableData,
    categoryOptions,
    onModalSuccess,
    onModalClose,
}: Props) {
    // Sesuai dengan elemen <form>
    const dialogRef = useRef<HTMLFormElement | null>(null);

    const {
        processing,
        patch,
        post,
        reset,
        errors,
        data,
        setData,
        clearErrors,
    } = useForm({
        name: '',
        brand: '',
        category_id: '',
        purchase_price: '',
        selling_price: '',
        url_image: '',
    });

    const submit: SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        const action = modalState.dataId ? patch : post;
        const url = modalState.dataId
            ? products.update(modalState.dataId).url
            : products.store().url;

        action(url, {
            preserveState: true,
            onSuccess: () => {
                toast.success(
                    `Data berhasil ${modalState.dataId ? 'diperbarui' : 'ditambahkan'}`,
                );
                onModalSuccess();
                reset();
            },
            onError: () => {
                toast.error('Gagal menyimpan data');
            },
        });
    };

    useEffect(() => {
        const existing = tableData.find((el) => el.id === modalState.dataId);
    
        if (existing) {
            setData({
                name: existing.name ?? '',
                brand: existing.brand ?? '',
                category_id: existing.category_id?.toString() ?? '',
                purchase_price:
                    existing.purchase_price !== null && existing.purchase_price !== undefined && existing.purchase_price !== ''
                        ? String(Math.round(Number(existing.purchase_price)))
                        : '',
                selling_price:
                    existing.selling_price !== null && existing.selling_price !== undefined && existing.selling_price !== ''
                        ? String(Math.round(Number(existing.selling_price)))
                        : '',
                url_image: existing.url_image ?? '',
            });
        } else {
            reset();
        }
    }, [modalState.dataId]);

    return (
        <Dialog
            open={modalState.isOpen}
            onOpenChange={(open) => {
                if (!open && !processing) {
                    clearErrors();
                    onModalClose();
                }
            }}
        >
            <DialogContent className="top-[10%] translate-y-0 p-6" asChild>
                <form ref={dialogRef} onSubmit={submit}>
                    <DialogCancel />
                    <DialogHeader className="mb-4">
                        <DialogTitle>
                            {modalState.dataId
                                ? 'Edit Produk'
                                : 'Tambah Produk'}
                        </DialogTitle>
                    </DialogHeader>

                    <FieldSet>
                        <Field>
                            <FieldLabel>Nama</FieldLabel>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                            <FieldError>{errors.name}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel>Kategori</FieldLabel>

                            <Combobox
                                items={categoryOptions.filter(
                                    (opt) => opt.value !== 'all',
                                )}
                                value={categoryOptions
                                    .filter((opt) => opt.value !== 'all')
                                    .find(
                                        (opt) =>
                                            String(opt.value) ===
                                            String(data.category_id),
                                    )}
                                onValueChange={(val: Option | null) =>
                                    setData('category_id', val?.value ?? '')
                                }
                            >
                                <ComboboxInput
                                    placeholder="Pilih kategori"
                                    className={`cursor-pointer ${
                                        errors.category_id
                                            ? 'border-red-500'
                                            : ''
                                    }`}
                                />

                                <ComboboxContent container={dialogRef}>
                                    <ComboboxEmpty>
                                        Tidak ditemukan
                                    </ComboboxEmpty>

                                    <ComboboxList>
                                        {(el) => (
                                            <ComboboxItem
                                                className="cursor-pointer"
                                                key={el.value}
                                                value={el}
                                            >
                                                {el.label}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>

                            <FieldError>{errors.category_id}</FieldError>
                        </Field>

                        <Field>
                            <FieldLabel>Harga Pokok Penjualan (HPP)</FieldLabel>
                            <Input
                                type="number"
                                value={data.purchase_price}
                                onChange={(e) =>
                                    setData('purchase_price', e.target.value)
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Harga Jual</FieldLabel>
                            <Input
                                type="number"
                                value={data.selling_price}
                                onChange={(e) =>
                                    setData('selling_price', e.target.value)
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel>URL Gambar</FieldLabel>
                            <div className="flex items-start gap-3">
                                <ImagePreview url={data.url_image.trim()} />
                                <div className="flex-1 space-y-1">
                                    <div className="relative">
                                        <Input
                                            type="url"
                                            inputMode="url"
                                            placeholder="https://contoh.com/gambar.jpg"
                                            value={data.url_image}
                                            onChange={(e) =>
                                                setData(
                                                    'url_image',
                                                    e.target.value,
                                                )
                                            }
                                            className={`pr-9 ${errors.url_image ? 'border-red-500' : ''}`}
                                        />
                                        {data.url_image && (
                                            <button
                                                type="button"
                                                aria-label="Hapus URL gambar"
                                                onClick={() =>
                                                    setData('url_image', '')
                                                }
                                                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Opsional. Ditampilkan di halaman toko.
                                    </p>
                                </div>
                            </div>
                            <FieldError>{errors.url_image}</FieldError>
                        </Field>
                    </FieldSet>

                    <DialogFooter className="mt-3">
                        <DialogClose asChild>
                            <Button variant="outline">Batal</Button>
                        </DialogClose>

                        <Button type="submit" disabled={processing}>
                            <Spinner className={processing ? '' : 'hidden'} />
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}