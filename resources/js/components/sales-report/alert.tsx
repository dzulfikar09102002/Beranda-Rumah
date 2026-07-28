import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { Spinner } from '../ui/spinner';
import salesReport from '@/routes/reports/sales';

export type AlertState = {
    type: 'delete' | 'restore' | 'cancel';
    isOpen: boolean;
    dataId: any;
    processing: boolean;
};

type Props = {
    alertState: AlertState;
    onAlertClose: () => void;
    onAlertProcessing: () => void;
    onSuccess?: () => void;
};

export default ({
    alertState,
    onAlertClose,
    onAlertProcessing,
    onSuccess,
}: Props) => {
    const isDelete = alertState.type === 'delete';
    const isRestore = alertState.type === 'restore';
    const isCancel = alertState.type === 'cancel';

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

    return (
        <AlertDialog
            open={alertState.isOpen}
            onOpenChange={(open) => {
                // ✅ SELALU boleh close kalau user klik luar / escape
                if (!open) {
                    onAlertClose();
                }
            }}
        >
            <AlertDialogContent className="z-[9999]">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah anda yakin?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={alertState.processing}>
                        Batal
                    </AlertDialogCancel>

                    <Button
                        variant={
                            isDelete || isCancel ? 'destructive' : 'default'
                        }
                        disabled={alertState.processing}
                        onClick={() => {
                            // 🔥 GUARD (anti double klik)
                            if (alertState.processing) return;

                            const options = {
                                preserveScroll: true,
                                onBefore: () => {
                                    onAlertProcessing();
                                },

                                onError: (errors: any) => {
                                    toast.error(errorMessage);
                                    console.error(errors);
                                    onAlertClose();
                                },

                                onSuccess: () => {
                                    toast.success(successMessage);
                                    onAlertClose();
                                    onSuccess?.();
                                },

                                onFinish: () => {
                                    // 🔥 tambahan safety (anti nyangkut)
                                    onAlertClose();
                                },
                            };

                            if (isDelete) {
                                router.delete(
                                    salesReport.destroy(alertState.dataId).url,
                                    options,
                                );
                            } else if (isRestore) {
                                router.post(
                                    salesReport.restore(alertState.dataId).url,
                                    {},
                                    options,
                                );
                            } else if (isCancel) {
                                router.post(
                                    salesReport.cancel(alertState.dataId).url,
                                    {},
                                    options,
                                );
                            }
                        }}
                    >
                        <Spinner
                            className={alertState.processing ? '' : 'hidden'}
                        />
                        Ya
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
