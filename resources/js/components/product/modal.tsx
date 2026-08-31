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
import { SubmitEventHandler, useEffect, useRef } from 'react';
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