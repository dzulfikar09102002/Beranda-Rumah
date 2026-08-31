import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { Spinner } from '@/components/ui/spinner';
import salesReport from '@/routes/reports/sales';

export type AlertState = {
    type: 'delete' | 'restore' | 'cancel';
    isOpen: boolean;
    dataId: any;
};

type Props = {
    alertState: AlertState;
    onAlertClose: () => void;
    onSuccess?: () => void;
};

export default function ConfirmAlertDialog({
    alertState,
    onAlertClose,
    onSuccess,
}: Props) {
    const isDelete = alertState.type === 'delete';
    const isRestore = alertState.type === 'restore';
    const isCancel = alertState.type === 'cancel';

    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState('');
    const [loading, setLoading] = useState(false);

    const title = isDelete
        ? 'Hapus Transaksi'
        : isRestore
          ? 'Pulihkan Transaksi'
          : 'Batalkan Transaksi';

    const successMessage = isDelete
        ? 'Transaksi berhasil dihapus'
        : isRestore
          ? 'Transaksi berhasil dipulihkan'
          : 'Transaksi berhasil dibatalkan';

    const errorMessage = isDelete
        ? 'Gagal menghapus transaksi'
        : isRestore
          ? 'Gagal memulihkan transaksi'
          : 'Gagal membatalkan transaksi';

    const handleConfirm = () => {
        if (loading) return;

        if (isCancel && !reason.trim()) {
            setReasonError('Alasan wajib diisi');
            return;
        }

        setLoading(true);

        const options = {
            preserveScroll: true,
            onError: (err: any) => {
                setLoading(false);
                toast.error(errorMessage);
                console.error(err);
            },
            onSuccess: () => {
                document.body.style.pointerEvents = '';
                document.body.removeAttribute('data-scroll-locked');
                toast.success(successMessage);
                onAlertClose();
                onSuccess?.();
            },
            onFinish: () => {
                setLoading(false);
            },
        };

        if (isDelete) {
            router.delete(salesReport.destroy(alertState.dataId).url, options);
        } else if (isCancel) {
            router.post(
                salesReport.cancel(alertState.dataId).url,
                { reason },
                options,
            );
        }
    };

    return (
        <AlertDialog
            open={alertState.isOpen}
            onOpenChange={(open) => {
                if (!open && !loading) {
                    document.body.style.pointerEvents = '';
                    document.body.removeAttribute('data-scroll-locked');
                    onAlertClose();
                }
            }}
        >
            <AlertDialogContent className="z-[9999]">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {isCancel
                            ? 'Masukkan alasan pembatalan transaksi ini.'
                            : 'Apakah anda yakin?'}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {isCancel && (
                    <div className="space-y-1.5">
                        <Textarea
                            placeholder="Contoh: Salah input / customer batal / dll..."
                            value={reason}
                            disabled={loading}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (reasonError) setReasonError('');
                            }}
                        />
                        {reasonError && (
                            <p className="text-sm text-red-600">
                                {reasonError}
                            </p>
                        )}
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={loading}
                        onClick={() => {
                            document.body.style.pointerEvents = '';
                            document.body.removeAttribute('data-scroll-locked');
                            onAlertClose();
                        }}
                    >
                        Batal
                    </AlertDialogCancel>

                    <Button
                        variant={isDelete || isCancel ? 'destructive' : 'default'}
                        disabled={loading}
                        onClick={handleConfirm}
                    >
                        {loading && <Spinner className="mr-2" />}
                        Ya
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}