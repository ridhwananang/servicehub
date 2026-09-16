import React from 'react';
import { Share, PlusSquare, Smartphone } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PwaInstallGuideDialogProps {
    isOpen: boolean;
    onClose: () => void;
    isIOS: boolean;
    onMarkInstalled?: () => void;
}

export function PwaInstallGuideDialog({ isOpen, onClose, isIOS, onMarkInstalled }: PwaInstallGuideDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader className="flex flex-col items-center text-center gap-3">
                    <div
                        className="flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                        aria-hidden="true"
                    >
                        <Smartphone className="size-6" />
                    </div>
                    <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                        Cara Install Aquos Platinum Web App
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                        Jadikan Aquos Platinum sebagai aplikasi mandiri di perangkat Anda tanpa perlu melalui toko aplikasi.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2 text-xs text-slate-700 dark:text-slate-300">
                    {isIOS ? (
                        <>
                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/60 dark:border-slate-800">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-red-600 text-white font-bold text-[11px]">
                                    1
                                </div>
                                <div className="leading-relaxed">
                                    Buka peramban <strong>Safari</strong> di iPhone/iPad Anda, lalu ketuk tombol <strong>Bagikan / Share</strong> (<Share className="inline size-3.5 mx-0.5 text-red-600" />) di bilah bawah.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/60 dark:border-slate-800">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-red-600 text-white font-bold text-[11px]">
                                    2
                                </div>
                                <div className="leading-relaxed">
                                    Gulir ke bawah dan pilih menu <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong> (<PlusSquare className="inline size-3.5 mx-0.5 text-red-600" />).
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/60 dark:border-slate-800">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-red-600 text-white font-bold text-[11px]">
                                    3
                                </div>
                                <div className="leading-relaxed">
                                    Ketuk <strong>"Tambah" (Add)</strong> di pojok kanan atas. Ikon Aquos Platinum akan muncul di layar ponsel seperti aplikasi asli!
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/60 dark:border-slate-800">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-red-600 text-white font-bold text-[11px]">
                                    1
                                </div>
                                <div className="leading-relaxed">
                                    Di peramban Chrome/Edge, ketuk tombol <strong>titik tiga (&vellip;)</strong> di pojok atas atau ikon <strong>Install App</strong> di bilah alamat browser.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/60 dark:border-slate-800">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-red-600 text-white font-bold text-[11px]">
                                    2
                                </div>
                                <div className="leading-relaxed">
                                    Pilih opsi <strong>"Install Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/60 dark:border-slate-800">
                                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-red-600 text-white font-bold text-[11px]">
                                    3
                                </div>
                                <div className="leading-relaxed">
                                    Aplikasi Aquos Platinum siap dibuka secara mandiri berlayar penuh (*fullscreen standalone*) tanpa bilah URL browser!
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="mt-2 flex flex-col-reverse sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            if (onMarkInstalled) onMarkInstalled();
                            onClose();
                        }}
                        className="w-full sm:flex-1 rounded-xl h-10 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                    >
                        Sudah Saya Pasang
                    </Button>
                    <Button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:flex-1 rounded-xl h-10 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs"
                    >
                        Saya Mengerti
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
