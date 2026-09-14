import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Camera, CheckCircle2, ImageOff, MapPin, Calendar } from 'lucide-react';
import type { ServiceTicket } from '@/types';

interface PhotoPreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: ServiceTicket | null;
}

export function PhotoPreviewDialog({
    isOpen,
    onClose,
    ticket,
}: PhotoPreviewDialogProps) {
    if (!ticket) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl overflow-hidden p-6 sm:rounded-2xl">
                <DialogHeader className="border-b pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono text-sm font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                            {ticket.notif_number}
                        </Badge>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                            Dokumentasi Foto: {ticket.customer_name}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs text-slate-500 space-y-1 pt-1">
                        <div className="flex flex-wrap items-center gap-3">
                            <span>{ticket.unit_model} (SN: {ticket.serial_number})</span>
                            <span>&bull;</span>
                            <span>Center: <strong>{ticket.mainwork_center}</strong></span>
                            {ticket.service_date && (
                                <>
                                    <span>&bull;</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-3 text-slate-400" />
                                        {new Date(ticket.service_date).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </>
                            )}
                        </div>
                        {ticket.customer_address && (
                            <div className="flex items-start gap-1 text-slate-600 dark:text-slate-400 pt-0.5">
                                <MapPin className="size-3 text-red-500 shrink-0 mt-0.5" />
                                <span>{ticket.customer_address}</span>
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Foto Kunjungan */}
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Camera className="size-4 text-blue-600" />
                            <span>1. Foto Kunjungan / Unit Awal</span>
                        </div>
                        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950 flex items-center justify-center">
                            {ticket.visit_photo ? (
                                <img
                                    src={ticket.visit_photo}
                                    alt="Foto Kunjungan"
                                    className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                    <ImageOff className="size-8 stroke-1" />
                                    <span className="text-xs">Belum ada foto kunjungan</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Foto Selesai */}
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                            <span>2. Foto Selesai / Pengerjaan Beres</span>
                        </div>
                        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950 flex items-center justify-center">
                            {ticket.completion_photo ? (
                                <img
                                    src={ticket.completion_photo}
                                    alt="Foto Selesai"
                                    className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-1 text-slate-400">
                                    <ImageOff className="size-8 stroke-1" />
                                    <span className="text-xs">Belum ada foto selesai</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {ticket.notes && (
                    <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        <strong className="text-slate-800 dark:text-slate-200">Catatan Teknisi:</strong> {ticket.notes}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
