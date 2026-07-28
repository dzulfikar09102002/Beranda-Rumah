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
import products from '@/routes/products';

export type AlertState = {
    delete: boolean
    isOpen: boolean
    dataId: any
    proccessing: boolean
}

type Props = {
    alertState: AlertState
    onAlertClose: () => void
    onAlertProccessing: () => void
}

export default ({ alertState, onAlertClose, onAlertProccessing }: Props) => {

    return (
        <AlertDialog
            open={alertState.isOpen}
            onOpenChange={() => alertState.proccessing || onAlertClose()}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{alertState.delete ? 'Hapus' : 'Pulihkan'} Item</AlertDialogTitle>
                    <AlertDialogDescription>
                        Apakah anda yakin?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={alertState.proccessing}>Batal</AlertDialogCancel>
                    <Button variant={alertState.delete ? 'destructive' : 'default'} disabled={alertState.proccessing} onClick={() => {
                        const options = {
                            only: ['pagination'],
                            preserveState: true,
                            onBefore: onAlertProccessing,
                            onError: (errors: any) => {
                                toast.error(
                                    alertState.delete
                                        ? 'Gagal menghapus data'
                                        : 'Gagal memulihkan data'
                                )

                                console.error(errors)
                            },
                            onSuccess: () => {
                                toast.success(
                                    alertState.delete
                                        ? 'Data berhasil dihapus'
                                        : 'Data berhasil dipulihkan'
                                )
                            },
                            onFinish: onAlertClose,
                        }

                        alertState.delete
                            ? router.delete(products.destroy(alertState.dataId).url, options)
                            : router.post(products.restore(alertState.dataId).url, {}, options)
                    }}>
                        <Spinner className={alertState.proccessing ? '' : 'hidden'} />
                        Ya
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}