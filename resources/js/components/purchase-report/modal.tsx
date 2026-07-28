// components/purchase-report/modal.tsx

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Field, FieldLabel } from '@/components/ui/field';
import { useEffect } from 'react';
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
    const form = useForm({
        code: '',
        quantity: 1,
        year: new Date().getFullYear(),
        purchase_price: 0,
        selling_price: 0,
        purchase_date: '',
        expired_date: '',
        supplier_id: '' as number | '',
        source: '',
        total_payment: 0,
    });

    const cleanNumber = (value: any) => {
        const num = Number(value ?? 0);

        return Number.isInteger(num) ? num : parseFloat(num.toString());
    };

    const sourceOptions: Option[] = [
        { value: 'purchase', label: 'Pembelian' },
        { value: 'consignment', label: 'Titipan' },
        { value: 'return', label: 'Pengembalian' },
        { value: 'adjustment', label: 'Penyesuaian' },
        { value: 'transfer', label: 'Transfer Masuk' },
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

    const submit = () => {
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
        <Dialog open={open} onOpenChange={onClose} modal={false}>
            <DialogContent className="top-[10%] max-w-3xl translate-y-0">
                <DialogHeader>
                    <DialogTitle>Edit Pembelian</DialogTitle>
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
                                form.setData('quantity', Number(e.target.value))
                            }
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Tahun</FieldLabel>
                        <Input
                            type="number"
                            value={form.data.year}
                            onChange={(e) =>
                                form.setData('year', Number(e.target.value))
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
                        <FieldLabel>Tanggal Masuk</FieldLabel>
                        <DatePicker
                            value={form.data.purchase_date}
                            onChange={(val) =>
                                form.setData('purchase_date', val ?? '')
                            }
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Tanggal Expired</FieldLabel>
                        <DatePicker
                            value={form.data.expired_date}
                            onChange={(val) =>
                                form.setData('expired_date', val ?? '')
                            }
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Sumber</FieldLabel>

                        <Combobox
                            items={sourceOptions}
                            value={
                                sourceOptions.find(
                                    (opt) => opt.value === form.data.source,
                                ) ?? null
                            }
                            onValueChange={(val: Option | null) =>
                                form.setData('source', val?.value ?? 'purchase')
                            }
                        >
                            <ComboboxInput
                                placeholder="Pilih sumber"
                                className="w-full"
                            />

                            <ComboboxContent>
                                <ComboboxEmpty>Tidak ditemukan</ComboboxEmpty>

                                <ComboboxList>
                                    {(el) => (
                                        <ComboboxItem key={el.value} value={el}>
                                            {el.label}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </Field>

                    <Field className="col-span-2">
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
                                className={`w-full ${
                                    form.data.source === 'consignment' &&
                                    !form.data.supplier_id
                                        ? 'border-red-500'
                                        : ''
                                }`}
                            />

                            <ComboboxContent>
                                <ComboboxEmpty>Tidak ditemukan</ComboboxEmpty>

                                <ComboboxList>
                                    {(el) => (
                                        <ComboboxItem key={el.value} value={el}>
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

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={form.processing}
                    >
                        Batal
                    </Button>

                    <Button onClick={submit} disabled={form.processing}>
                        {form.processing && <Spinner />}
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
