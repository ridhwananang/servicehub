import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ServiceTicket } from '@/types';

interface DeleteTicketDialogProps {
    ticket: ServiceTicket | null;
    onClose: () => void;
}

export function DeleteTicketDialog({ ticket, onClose }: DeleteTicketDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!ticket) return null;

    const handleConfirmDelete = () => {
        setIsDeleting(true);
        router.delete(`/tickets/${ticket.id}`, {
            onSuccess: () => {
                toast.success(`Tiket ${ticket.notif_number} berhasil dihapus`);
                onClose();
            },
            onError: () => {
                toast.error('Gagal menghapus tiket servis');
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    return (
        <Dialog open={Boolean(ticket)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader className="flex flex-col items-center text-center gap-3">
                    <div
                        className="flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                        aria-hidden="true"
                    >
                        <Trash2 className="size-6" />
                    </div>
                    <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                        Hapus Tiket Servis
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Apakah Anda yakin ingin menghapus notifikasi{' '}
                        <strong className="font-mono font-bold text-slate-800 dark:text-slate-200">
                            {ticket.notif_number}
                        </strong>{' '}
                        untuk pelanggan{' '}
                        <strong className="font-semibold text-slate-800 dark:text-slate-200">
                            {ticket.customer_name}
                        </strong>
                        ? Data pengerjaan dan foto dokumentasi yang terkait akan dihapus secara permanen.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isDeleting}
                        className="rounded-xl h-10 text-xs font-semibold"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        className="rounded-xl h-10 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs shadow-red-600/20"
                    >
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Tiket'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
