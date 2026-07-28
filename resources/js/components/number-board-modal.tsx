import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useState } from 'react';
import { Delete } from 'lucide-react';

type Props = {
    open: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
    grandTotal: number;
};

export default function NumberBoardModal({
    open,
    onClose,
    onConfirm,
    grandTotal,
}: Props) {
    const [value, setValue] = useState('0');

    const append = (v: string) => {
        setValue((prev) => (prev === '0' ? v : prev + v));
    };

    const addNominal = (n: number) => {
        setValue((prev) => String(Number(prev) + n));
    };

    const uangPas = () => {
        setValue(String(grandTotal));
    };

    const confirm = () => {
        onConfirm(Number(value));
    };

    const reset = () => {
        setValue('0');
    };

    const backspace = () => {
        setValue((prev) => {
            if (prev.length <= 1) return '0';
            return prev.slice(0, -1);
        });
    };

    const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '');

        if (!raw) {
            setValue('0');
            return;
        }

        setValue(raw);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="top-[45%] max-w-md">
                <DialogTitle className="sr-only">Number Board</DialogTitle>

                <div className="space-y-4">
                    <Input
                        value={Number(value).toLocaleString('id-ID')}
                        onChange={handleManualInput}
                        inputMode="numeric"
                        className="text-right text-lg"
                    />

                    <div className="grid grid-cols-2 gap-2">
                        <Button onClick={reset}>AC</Button>

                        <Button variant="outline" onClick={backspace}>
                            <Delete />
                        </Button>
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
                            onClick={() => addNominal(10000)}
                        >
                            10.000
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
                            onClick={() => addNominal(20000)}
                        >
                            20.000
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

                        <Button
                            variant="outline"
                            onClick={() => addNominal(50000)}
                        >
                            50.000
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
                            onClick={() => addNominal(100000)}
                        >
                            100.000
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={uangPas}
                        >
                            Uang Pas
                        </Button>

                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Kembali
                        </Button>

                        <Button className="flex-1" onClick={confirm}>
                            Konfirmasi
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
