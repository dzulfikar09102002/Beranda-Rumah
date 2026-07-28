import { useState } from 'react';
import { Delete } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (discountAmount: number) => void;
    grandTotal: number;
    productName: string;
};

export default function NumberBoardDiscount({
    open,
    onClose,
    onConfirm,
    grandTotal,
    productName,
}: Props) {
    const [value, setValue] = useState('0');

    // percent | nominal
    const [mode, setMode] = useState<'percent' | 'nominal'>('nominal');

    const append = (v: string) => {
        setValue((prev) => (prev === '0' ? v : prev + v));
    };

    const reset = () => {
        setValue('0');
        setMode('nominal');
    };

    const backspace = () => {
        setValue((prev) => {
            if (prev.length <= 1) return '0';
            return prev.slice(0, -1);
        });
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');

        if (!raw) {
            setValue('0');
            return;
        }

        setValue(raw);
    };

    const confirm = () => {
        let discount = 0;

        if (mode === 'percent') {
            const pct = Math.min(Number(value), 100);
            discount = (grandTotal * pct) / 100;
        } else {
            discount = Number(value);
        }

        onConfirm(discount);
    };

    const previewDiscount =
        mode === 'percent'
            ? (grandTotal * Number(value || 0)) / 100
            : Number(value || 0);

    const displayValue =
        mode === 'percent'
            ? `${value}%`
            : Number(value) === 0
              ? '0'
              : `-${Number(value).toLocaleString('id-ID')}`;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="top-[45%] max-w-md">
                <DialogTitle className="sr-only">Input Diskon</DialogTitle>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-semibold">
                            {productName}
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Masukkan diskon yang tersedia
                        </p>
                    </div>

                    <Input
                        value={displayValue}
                        onChange={handleInput}
                        className="text-right text-xl"
                        inputMode="numeric"
                    />

                    <div className="text-sm text-muted-foreground">
                        Diskon:
                        <span className="ml-2 font-medium">
                            Rp {previewDiscount.toLocaleString('id-ID')}
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3].map((n) => (
                            <Button
                                key={n}
                                variant="outline"
                                onClick={() => append(String(n))}
                            >
                                {n}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            onClick={() => setMode('percent')}
                        >
                            %
                        </Button>

                        {[4, 5, 6].map((n) => (
                            <Button
                                key={n}
                                variant="outline"
                                onClick={() => append(String(n))}
                            >
                                {n}
                            </Button>
                        ))}

                        <Button
                            variant="outline"
                            onClick={() => setMode('nominal')}
                        >
                            −
                        </Button>

                        {[7, 8, 9].map((n) => (
                            <Button
                                key={n}
                                variant="outline"
                                onClick={() => append(String(n))}
                            >
                                {n}
                            </Button>
                        ))}

                        <Button variant="outline" onClick={backspace}>
                            <Delete size={16} />
                        </Button>

                        <Button variant="outline" onClick={() => append('0')}>
                            0
                        </Button>

                        <Button variant="outline" onClick={() => append('00')}>
                            00
                        </Button>

                        <Button variant="outline" onClick={() => append('000')}>
                            000
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => append('0000')}
                        >
                            0000
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={reset}
                        >
                            Reset
                        </Button>

                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Kembali
                        </Button>

                        <Button className="flex-1" onClick={confirm}>
                            Konfirm
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
