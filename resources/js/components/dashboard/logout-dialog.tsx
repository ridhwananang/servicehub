import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LogoutDialogProps {
    isOpen: boolean;
    onClose: () => void;
    displayName: string;
}

export function LogoutDialog({ isOpen, onClose, displayName }: LogoutDialogProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleConfirmLogout = () => {
        setIsLoggingOut(true);
        router.flushAll();
        router.post('/logout', {}, {
            onFinish: () => setIsLoggingOut(false),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader className="flex flex-col items-center text-center gap-3">
                    <div
                        className="flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                        aria-hidden="true"
                    >
                        <LogOut className="size-6" />
                    </div>
                    <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                        Konfirmasi Keluar Akun
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Apakah Anda yakin ingin keluar dari akun Aquos Platinum sebagai{' '}
                        <strong className="font-semibold text-slate-800 dark:text-slate-200">
                            {displayName}
                        </strong>
                        ? Anda harus masuk kembali dengan kata sandi untuk mengakses tiket dan work order teknisi.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoggingOut}
                        className="rounded-xl h-10 text-xs font-semibold"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirmLogout}
                        disabled={isLoggingOut}
                        className="rounded-xl h-10 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs shadow-red-600/20"
                    >
                        {isLoggingOut ? 'Mengeluarkan...' : 'Ya, Keluar Akun'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
