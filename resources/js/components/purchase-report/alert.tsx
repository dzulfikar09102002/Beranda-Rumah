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
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import products from '@/routes/products';
import purchasess from '@/routes/reports/purchases';
import purchases from '@/pages/purchases';

export type AlertState = {
    delete: boolean;
    isOpen: boolean;
    dataId: any;
    proccessing: boolean;
};

type Props = {
    alertState: AlertState;
    onAlertClose: () => void;
    onAlertProccessing: () => void;
};

export default ({ alertState, onAlertClose, onAlertProccessing }: Props) => {
    const [reason, setReason] = useState('');

    return (
        <AlertDialog
            open={alertState.isOpen}
            onOpenChange={() => alertState.proccessing || onAlertClose()}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {alertState.delete ? 'Hapus' : 'Pulihkan'} Item
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah anda yakin?
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {alertState.delete && (
                    <Textarea
                        placeholder="Masukkan alasan penghapusan..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={alertState.proccessing}
                    />
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={alertState.proccessing}>
                        Batal
                    </AlertDialogCancel>

                    <Button
                        variant={alertState.delete ? 'destructive' : 'default'}
                        disabled={alertState.proccessing}
                        onClick={() => {
                            const options = {
                                only: ['pagination'],
                                preserveState: true,
                                onBefore: onAlertProccessing,
                                onError: (errors: any) => {
                                    toast.error(
                                        alertState.delete
                                            ? 'Gagal menghapus data'
                                            : 'Gagal memulihkan data',
                                    );

                                    console.error(errors);
                                },
                                onSuccess: () => {
                                    toast.success(
                                        alertState.delete
                                            ? 'Data berhasil dihapus'
                                            : 'Data berhasil dipulihkan',
                                    );

                                    setReason('');
                                },
                                onFinish: onAlertClose,
                            };

                            alertState.delete
                                ? router.delete(
                                      purchasess.destroy(alertState.dataId).url,
                                      { ...options, data: { reason } },
                                  )
                                : router.post(
                                      purchasess.restore(alertState.dataId).url,
                                      {},
                                      options,
                                  );
                        }}
                    >
                        <Spinner
                            className={alertState.proccessing ? '' : 'hidden'}
                        />
                        Ya
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
