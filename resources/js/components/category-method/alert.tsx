import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { Spinner } from '../ui/spinner';
import categories from '@/routes/categories';

export type AlertState = {
    delete: boolean;
    isOpen: boolean;
    dataId: any;
    processing: boolean // perbaikan typo
}

type Props = {
    alertState: AlertState;
    onAlertClose: () => void;
    onAlertProcessing: () => void
};

export default ({ alertState, onAlertClose, onAlertProcessing }: Props) => {
    return (
        <AlertDialog
            open={alertState.isOpen}
            onOpenChange={() => {
                if (!alertState.processing) onAlertClose();
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {alertState.delete ? 'Hapus' : 'Pulihkan'} Kategori
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah Anda yakin ingin {alertState.delete ? 'menghapus' : 'memulihkan'} kategori ini?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={alertState.processing}>
                        Batal
                    </AlertDialogCancel>

                    <Button
                        variant={alertState.delete ? 'destructive' : 'default'}
                        disabled={alertState.processing}
                        onClick={() => {
                            const options = {
                                only: ['pagination'],
                                preserveState: true,
                                onBefore: onAlertProcessing,
                                onError: (errors: any) => {
                                    toast.error(
                                        alertState.delete
                                            ? 'Gagal menghapus kategori'
                                            : 'Gagal memulihkan kategori'
                                    );
                                    console.error(errors);
                                },
                                onSuccess: () => {
                                    toast.success(
                                        alertState.delete
                                            ? 'Kategori berhasil dihapus'
                                            : 'Kategori berhasil dipulihkan'
                                    );
                                },
                                onFinish: onAlertClose,
                            };

                            if (!alertState.dataId) return;

                            if (alertState.delete) {
                                router.delete(
                                    categories.destroy(alertState.dataId).url,
                                    options
                                );
                            } else {
                                router.post(
                                    categories.restore(alertState.dataId).url,
                                    {},
                                    options
                                );
                            }
                        }}
                    >
                        <Spinner className={alertState.processing ? '' : 'hidden'} />
                        Ya
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};