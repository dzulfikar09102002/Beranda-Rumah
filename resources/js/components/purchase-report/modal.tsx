// components/purchase-report/modal.tsx

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldLabel } from '@/components/ui/field';
import { FormEventHandler, useEffect, useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import purchases from '@/routes/reports/purchases';
import { Option, Purchase } from '@/lib/model';
import { DatePicker } from '../ui/date-picker';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '../ui/combobox';

type Props = {
    open: boolean;
    item?: Purchase;
    onClose: () => void;
    supplierOptions?: Option[];
};

export default function Modal({ open, item, onClose, supplierOptions }: Props) {
    const dialogRef = useRef<HTMLFormElement | null>(null);

    const form = useForm({
        code: '',
        quantity: 1,
        year: new Date().getFullYear(),
        purchase_price: 0,
        selling_price: 0,
        purchase_date: '',
        expired_date: '',
        supplier_id: '' as number | '',
        source: 'purchase',
        total_payment: 0,
    });

    const cleanNumber = (value: any) => {
        const num = Number(value ?? 0);
        return Math.round(num);
    };

    const sourceOptions: Option[] = [
        { value: 'purchase', label: 'Produksi' },
        { value: 'consignment', label: 'Titipan' },
        { value: 'other', label: 'Lainnya' },
    ];

    const safeSupplierOptions = Array.isArray(supplierOptions)
        ? supplierOptions
        : [];

    useEffect(() => {
        if (item) {
            form.setData({
                code: item.code ?? '',
                quantity: item.quantity ?? 1,
                year: item.year ?? new Date().getFullYear(),
                purchase_price: cleanNumber(item.purchase_price),
                selling_price: cleanNumber(item.selling_price),
                purchase_date: item.purchase_date ?? '',
                expired_date: item.expired_date ?? '',
                supplier_id: item.supplier_id ?? '',
                source: item.inventory_transactions?.[0]?.source ?? 'purchase',
                total_payment: item.total_payment ?? 0,
            });
        }
    }, [item]);

    const submit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        if (!item) return;

        form.patch(purchases.update(item.id).url, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Data berhasil diperbarui');
                onClose();
            },
            onError: () => {
                toast.error('Gagal memperbarui data');
            },
        });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen && !form.processing) {
                    onClose();
                }
            }}
        >
            <DialogContent className="top-[10%] w-full max-w-3xl translate-y-0 p-6" asChild>
                <form ref={dialogRef} onSubmit={submit}>
                    <DialogHeader className="mb-4">
                        <DialogTitle>Edit Data Produksi</DialogTitle>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel>Kode</FieldLabel>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Jumlah</FieldLabel>
                            <Input
                                type="number"
                                value={form.data.quantity}
                                onChange={(e) =>
                                    form.setData(
                                        'quantity',
                                        Number(e.target.value),
                                    )
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Tahun</FieldLabel>
                            <Input
                                type="number"
                                value={form.data.year}
                                onChange={(e) =>
                                    form.setData(
                                        'year',
                                        Number(e.target.value),
                                    )
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Harga Beli</FieldLabel>
                            <Input
                                type="number"
                                value={form.data.purchase_price}
                                onChange={(e) =>
                                    form.setData(
                                        'purchase_price',
                                        Number(e.target.value),
                                    )
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Harga Jual</FieldLabel>
                            <Input
                                type="number"
                                value={form.data.selling_price}
                                onChange={(e) =>
                                    form.setData(
                                        'selling_price',
                                        Number(e.target.value),
                                    )
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Tanggal</FieldLabel>
                            <DatePicker
                                value={form.data.purchase_date}
                                onChange={(val) =>
                                    form.setData('purchase_date', val ?? '')
                                }
                            />
                        </Field>

                        <Field>
                            <FieldLabel>Sumber</FieldLabel>

                            <Combobox
                                items={sourceOptions}
                                value={
                                    sourceOptions.find(
                                        (opt) =>
                                            opt.value === form.data.source,
                                    ) ?? null
                                }
                                onValueChange={(val: Option | null) =>
                                    form.setData(
                                        'source',
                                        val?.value ?? 'purchase',
                                    )
                                }
                            >
                                <ComboboxInput
                                    placeholder="Pilih sumber"
                                    className="w-full cursor-pointer"
                                />

                                <ComboboxContent container={dialogRef}>
                                    <ComboboxEmpty>
                                        Tidak ditemukan
                                    </ComboboxEmpty>

                                    <ComboboxList>
                                        {(el) => (
                                            <ComboboxItem
                                                key={el.value}
                                                value={el}
                                                className="cursor-pointer"
                                            >
                                                {el.label}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </Field>

                        <Field>
                            <FieldLabel>Supplier</FieldLabel>

                            <Combobox
                                items={safeSupplierOptions}
                                value={
                                    safeSupplierOptions.find(
                                        (el) =>
                                            Number(el.value) ===
                                            Number(form.data.supplier_id),
                                    ) ?? null
                                }
                                onValueChange={(val: Option | null) =>
                                    form.setData(
                                        'supplier_id',
                                        val?.value ? Number(val.value) : '',
                                    )
                                }
                            >
                                <ComboboxInput
                                    placeholder="Pilih Supplier"
                                    className={`w-full cursor-pointer ${
                                        form.data.source === 'consignment' &&
                                        !form.data.supplier_id
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
                                                key={el.value}
                                                value={el}
                                                className="cursor-pointer"
                                            >
                                                {el.label}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>

                            {form.data.source === 'consignment' &&
                                !form.data.supplier_id && (
                                    <p className="text-xs text-red-500">
                                        Supplier wajib untuk barang titipan
                                    </p>
                                )}
                        </Field>
                    </div>

                    <DialogFooter className="mt-6">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={form.processing}
                            >
                                Batal
                            </Button>
                        </DialogClose>

                        <Button type="submit" disabled={form.processing}>
                            {form.processing && <Spinner />}
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}