import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

import {
    PaymentMethod,
    PurchaseMethod,
    SaleTransaction,
    SaleTransactionDetail,
} from '@/lib/model';
import { ShoppingBasket } from 'lucide-react';
import NumberBoardModal from '@/components/number-board-modal';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';

type Props = {
    details: SaleTransactionDetail[];
    paymentMethods: PaymentMethod[];
    transaction: SaleTransaction;
    purchasingMethods: PurchaseMethod[];
};

type Option = {
    value: string;
    label: string;
};

export default function Payment({
    details,
    paymentMethods,
    transaction,
    purchasingMethods,
}: Props) {
    const [selectedPayment, setSelectedPayment] =
        useState<PaymentMethod | null>(null);

    const purchasingOptions: Option[] = purchasingMethods.map((m) => ({
        value: String(m.id),
        label: m.name,
    }));

    // HAPUS DEFAULT
    const [selectedPurchasing, setSelectedPurchasing] = useState<Option | null>(
        null,
    );

    const [cashModalOpen, setCashModalOpen] = useState(false);
    const [cashAmount, setCashAmount] = useState(0);

    const grandTotal = Number(transaction.grand_total ?? 0);
    const paidSoFar = Number(transaction.total_amount ?? 0);
    const remaining = Math.max(grandTotal - paidSoFar, 0);

    const groupedPayments = paymentMethods.reduce<
        Record<string, PaymentMethod[]>
    >((acc, method) => {
        if (!acc[method.kind]) acc[method.kind] = [];
        acc[method.kind].push(method);
        return acc;
    }, {});

    const formatIDR = (value: number) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);

    const isCash = selectedPayment?.kind === 'cash';

    const change = cashAmount - remaining;

    const [reason, setReason] = useState('');

    const showReason = selectedPurchasing
        ? Number(selectedPurchasing.value) > 2
        : false;

    useEffect(() => {
        if (!isCash) {
            setCashModalOpen(false);
        }
    }, [selectedPayment]);

    const showPaymentDetail =
        showReason || (selectedPayment && (isCash ? cashAmount > 0 : true));

    const [processing, setProcessing] = useState(false);

    return (
        <AppLayout>
            <Head title="Pembayaran" />

            <NumberBoardModal
                open={cashModalOpen}
                onClose={() => setCashModalOpen(false)}
                grandTotal={remaining}
                onConfirm={(remaining) => {
                    setCashAmount(remaining);
                    setCashModalOpen(false);
                }}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[65%_35%]">
                {/* ================= LEFT : ORDER ================= */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold">
                            Order {transaction.invoice_number}
                        </h2>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {details.map((item) => {
                            const subtotal = Number(item.subtotal ?? 0);
                            const adjustment = Number(item.adjustment ?? 0);
                            const finalSubtotal = subtotal - adjustment;

                            return (
                                <div
                                    key={item.id}
                                    className="rounded-md bg-muted p-3"
                                >
                                    <div className="flex justify-between">
                                        <div>
                                            {item.quantity} x{' '}
                                            {item.purchase?.product?.name ??
                                                'Produk'}
                                        </div>

                                        <div>{formatIDR(subtotal)}</div>
                                    </div>

                                    {adjustment > 0 && (
                                        <div className="mt-1 flex justify-between text-sm text-red-500">
                                            <span>Diskon</span>

                                            <span>
                                                -{formatIDR(adjustment)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                                        <span>Total</span>

                                        <span>{formatIDR(finalSubtotal)}</span>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="mt-6 space-y-2 border-t pt-4">
                            <div className="flex justify-between text-base font-semibold">
                                <span>Grand Total</span>

                                <span>{formatIDR(grandTotal)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ================= RIGHT : PAYMENT ================= */}
                <Card>
                    <CardHeader>
                        <h3 className="font-semibold">Detail Pembayaran</h3>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="space-y-2 rounded-md bg-muted p-4">
                            <div className="flex justify-between text-sm">
                                <span>Total Pesanan</span>

                                <span className="font-semibold">
                                    {formatIDR(grandTotal)}
                                </span>
                            </div>

                            {paidSoFar > 0 && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span>Sudah Dibayar</span>

                                        <span className="font-semibold text-green-600">
                                            {formatIDR(paidSoFar)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span>Sisa Pembayaran</span>

                                        <span className="font-semibold text-red-500">
                                            {formatIDR(remaining)}
                                        </span>
                                    </div>
                                </>
                            )}

                            {(showReason || showPaymentDetail) && (
                                <>
                                    {showReason ? (
                                        <div className="flex justify-between text-sm">
                                            <span>Kerugian</span>

                                            <span className="font-semibold text-red-500">
                                                {formatIDR(remaining)}
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span>Pembayaran</span>

                                                <span className="font-semibold">
                                                    {formatIDR(
                                                        isCash
                                                            ? cashAmount
                                                            : remaining,
                                                    )}
                                                </span>
                                            </div>

                                            {isCash && (
                                                <div className="flex justify-between text-sm">
                                                    <span>
                                                        {change >= 0
                                                            ? 'Kembalian'
                                                            : 'Kurang Bayar'}
                                                    </span>

                                                    <span
                                                        className={`font-semibold ${
                                                            change >= 0
                                                                ? 'text-primary'
                                                                : 'text-red-500'
                                                        }`}
                                                    >
                                                        {formatIDR(
                                                            Math.abs(change),
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {/* ================= PAYMENT METHOD ================= */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Metode Pembayaran</h4>

                            <div className="space-y-2">
                                <div className="text-sm font-medium capitalize">
                                    Cash
                                </div>

                                <Button
                                    type="button"
                                    variant={
                                        selectedPayment?.kind === 'cash'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() => {
                                        setSelectedPayment({
                                            id: 0,
                                            name: 'Tunai',
                                            kind: 'cash',
                                        });

                                        setCashAmount(0);
                                        setCashModalOpen(true);
                                    }}
                                >
                                    Tunai
                                </Button>
                            </div>

                            {Object.entries(groupedPayments)
                                .filter(([kind]) => kind !== 'cash')
                                .map(([kind, methods]) => (
                                    <div key={kind} className="space-y-2">
                                        <div className="text-sm font-medium capitalize">
                                            {kind}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {methods.map((method) => (
                                                <Button
                                                    key={method.id}
                                                    type="button"
                                                    variant={
                                                        selectedPayment?.id ===
                                                        method.id
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    onClick={() => {
                                                        setSelectedPayment(
                                                            method,
                                                        );

                                                        setCashModalOpen(false);

                                                        setCashAmount(
                                                            grandTotal,
                                                        );
                                                    }}
                                                >
                                                    {method.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-medium">
                                Metode Pembelian{' '}
                                <span className="text-red-500">*</span>
                            </h4>
                            <Combobox
                                items={purchasingOptions}
                                value={selectedPurchasing}
                                onValueChange={(val: Option | null) => {
                                    setSelectedPurchasing(val);
                                }}
                            >
                                <ComboboxInput
                                    placeholder="Pilih Metode Pembelian"
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
                            {!selectedPurchasing && (
                                <p className="text-xs text-red-500">
                                    Metode pembelian wajib dipilih
                                </p>
                            )}
                        </div>
                        {showReason && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium">
                                    Alasan
                                </label>

                                <textarea
                                    className="w-full rounded-md border p-2 text-sm"
                                    placeholder="Masukkan alasan..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                />

                                {reason === '' && (
                                    <p className="text-xs text-red-500">
                                        Alasan wajib diisi
                                    </p>
                                )}
                            </div>
                        )}
                        <Button
                            className="w-full cursor-pointer"
                            disabled={
                                processing ||
                                (showReason ? !reason : !selectedPayment)
                            }
                            onClick={() => {
                                setProcessing(true);

                                router.post(
                                    `/sellings/${transaction.id}/payment`,
                                    {
                                        payment_method_id:
                                            selectedPayment?.id === 0
                                                ? 1
                                                : selectedPayment?.id,

                                        paid_amount: showReason
                                            ? remaining
                                            : isCash
                                              ? cashAmount
                                              : remaining,

                                        change_amount: showReason
                                            ? 0
                                            : isCash
                                              ? change > 0
                                                  ? change
                                                  : 0
                                              : 0,

                                        purchase_method_id: selectedPurchasing
                                            ? Number(selectedPurchasing.value)
                                            : null,

                                        reason: showReason ? reason : null,
                                    },
                                    {
                                        onStart: () => {
                                            toast.loading('Memproses...', {
                                                id: 'pay',
                                            });
                                        },

                                        onSuccess: () => {
                                            toast.success('Berhasil!', {
                                                id: 'pay',
                                            });
                                        },

                                        onError: (err) => {
                                            console.log(err);

                                            toast.error('Gagal!', {
                                                id: 'pay',
                                            });
                                        },

                                        onFinish: () => {
                                            setProcessing(false);
                                        },
                                    },
                                );
                            }}
                        >
                            {processing ? (
                                <>
                                    <Spinner className="mr-2 h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <ShoppingBasket className="mr-2 h-4 w-4" />
                                    Konfirmasi Pembayaran
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
