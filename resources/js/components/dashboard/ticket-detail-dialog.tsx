import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    User,
    Phone,
    MapPin,
    Tv,
    Hash,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Building2,
    Wrench,
    FileText,
    Camera,
    Copy,
    Check,
    Edit2,
    MessageCircle,
    ExternalLink,
    AlertCircle,
    ImageOff,
} from 'lucide-react';
import { getDeadlineStatus } from './ticket-table-row';
import { WorkStatusToggle } from './work-status-toggle';
import type { ServiceTicket } from '@/types';

interface TicketDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: ServiceTicket | null;
    onEdit?: (ticket: ServiceTicket) => void;
    onPreviewPhotos?: (ticket: ServiceTicket) => void;
}

export function TicketDetailDialog({
    isOpen,
    onClose,
    ticket,
    onEdit,
    onPreviewPhotos,
}: TicketDetailDialogProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);

    if (!ticket) return null;

    const deadlineInfo = getDeadlineStatus(ticket);

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const formatDateTime = (dateStr?: string | null) => {
        if (!dateStr) return '-';
        try {
            return (
                new Date(dateStr).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }) + ' WIB'
            );
        } catch {
            return dateStr;
        }
    };

    // Format phone number for WhatsApp link
    const sanitizedPhone = ticket.customer_phone.replace(/\D/g, '');
    const waPhone = sanitizedPhone.startsWith('0')
        ? '62' + sanitizedPhone.slice(1)
        : sanitizedPhone.startsWith('62')
        ? sanitizedPhone
        : '62' + sanitizedPhone;
    const waUrl = `https://wa.me/${waPhone}`;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar p-0 sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 shadow-2xl">
                {/* Header with gradient bar */}
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-950 dark:via-red-900 dark:to-red-950 text-white p-5 sm:p-6 pb-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="font-mono text-xs sm:text-sm font-bold bg-white/20 text-white border-white/30 backdrop-blur-xs px-2.5 py-0.5"
                                >
                                    {ticket.notif_number}
                                </Badge>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(ticket.notif_number, 'notif')}
                                    title="Salin Nomor Notif"
                                    aria-label="Salin Nomor Notifikasi"
                                    className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white/90 transition-colors cursor-pointer"
                                >
                                    {copiedField === 'notif' ? (
                                        <Check className="size-3.5 text-emerald-300" />
                                    ) : (
                                        <Copy className="size-3.5" />
                                    )}
                                </button>
                            </div>

                            {/* Ongoing Work Status Toggle */}
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-white/80 font-medium hidden sm:inline">Status:</span>
                                <div className="bg-white/10 dark:bg-black/30 p-1 rounded-xl backdrop-blur-xs border border-white/20">
                                    <WorkStatusToggle ticket={ticket} />
                                </div>
                            </div>
                        </div>

                        <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
                            Detail Tiket Servis
                        </DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm text-red-100 mt-1">
                            Informasi komprehensif pelanggan, unit perangkat, jenis pengerjaan, dan dokumentasi foto.
                        </DialogDescription>

                        {/* Urgency / Deadline Alert Banner if Belum Selesai */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span
                                suppressHydrationWarning
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-sm border ${
                                    deadlineInfo.isCritical
                                        ? 'bg-red-500/90 text-white border-white/40 animate-pulse'
                                        : 'bg-white/20 text-white border-white/30'
                                }`}
                            >
                                <Clock className="size-3.5 shrink-0" />
                                <span>{deadlineInfo.label}</span>
                                {deadlineInfo.urgencyText && (
                                    <span className="font-black underline ml-1">{deadlineInfo.urgencyText}</span>
                                )}
                            </span>

                            <Badge
                                variant="secondary"
                                className={
                                    ticket.status === 'berbayar'
                                        ? 'bg-blue-500/80 text-white border-transparent'
                                        : 'bg-amber-500/80 text-white border-transparent'
                                }
                            >
                                {ticket.status === 'berbayar' ? 'Berbayar' : (ticket.status_note || 'Tidak Berbayar')}
                            </Badge>

                            <Badge variant="outline" className="bg-white/15 text-white border-white/30">
                                <Building2 className="size-3 mr-1" />
                                Center: {ticket.mainwork_center}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                    {/* Grid: Pelanggan & Unit Perangkat */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Informasi Pelanggan */}
                        <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 p-4 space-y-3 shadow-xs">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                <User className="size-4" />
                                <span>Informasi Pelanggan</span>
                            </div>

                            <div className="space-y-2 text-xs sm:text-sm">
                                <div>
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Nama Lengkap</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{ticket.customer_name}</span>
                                </div>

                                <div>
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">No Handphone</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <a
                                            href={`tel:${ticket.customer_phone}`}
                                            className="font-mono font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
                                        >
                                            <Phone className="size-3.5" />
                                            {ticket.customer_phone}
                                        </a>
                                        <a
                                            href={waUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 transition-colors"
                                        >
                                            <MessageCircle className="size-3" />
                                            WhatsApp
                                            <ExternalLink className="size-2.5 ml-0.5" />
                                        </a>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Alamat Domisili</span>
                                    <div className="flex items-start gap-1.5 mt-0.5 text-slate-700 dark:text-slate-300">
                                        <MapPin className="size-4 text-red-500 shrink-0 mt-0.5" />
                                        <span>{ticket.customer_address || 'Tidak ada data alamat'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Informasi Unit Perangkat */}
                        <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 p-4 space-y-3 shadow-xs">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                <Tv className="size-4" />
                                <span>Informasi Unit & Perangkat</span>
                            </div>

                            <div className="space-y-2 text-xs sm:text-sm">
                                <div>
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Model / Tipe Unit</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-100">{ticket.unit_model}</span>
                                </div>

                                <div>
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Nomor Seri (Serial Number)</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="font-mono font-semibold bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-slate-200">
                                            {ticket.serial_number}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(ticket.serial_number, 'sn')}
                                            title="Salin Nomor Seri"
                                            aria-label="Salin Nomor Seri"
                                            className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                                        >
                                            {copiedField === 'sn' ? (
                                                <Check className="size-3.5 text-emerald-500" />
                                            ) : (
                                                <Copy className="size-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Service Center</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                                        <Building2 className="size-3.5 text-zinc-500" />
                                        {ticket.mainwork_center}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid: Waktu & Jadwal Pengerjaan + Status Pembayaran */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 3. Waktu & Deadline */}
                        <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 p-4 space-y-3 shadow-xs">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                <Calendar className="size-4" />
                                <span>Jadwal & Waktu Pengerjaan</span>
                            </div>

                            <div className="space-y-2 text-xs sm:text-sm">
                                <div>
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Deadline Pengerjaan</span>
                                    <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-0.5">
                                        <Clock className="size-3.5 shrink-0" />
                                        {formatDate(ticket.deadline || ticket.service_date)}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Tanggal Masuk / Servis</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">
                                        {formatDate(ticket.service_date)}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Jam Pengerjaan</span>
                                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                                        {ticket.start_time || '--:--'} s/d {ticket.finish_time || '--:--'} WIB
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Status Pembayaran & Garansi */}
                        <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 p-4 space-y-3 shadow-xs">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                <CheckCircle2 className="size-4" />
                                <span>Status Pembayaran & Garansi</span>
                            </div>

                            <div className="space-y-2 text-xs sm:text-sm">
                                <div>
                                    <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Status Biaya</span>
                                    <div className="mt-1">
                                        {ticket.status === 'berbayar' ? (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900">
                                                <CheckCircle2 className="size-3.5" />
                                                Berbayar
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
                                                <XCircle className="size-3.5" />
                                                Tidak Berbayar (Garansi)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {ticket.status_note && (
                                    <div>
                                        <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Keterangan Status / Alasan</span>
                                        <p className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 bg-white dark:bg-zinc-800 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                            {ticket.status_note}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 5. Jenis Pekerjaan */}
                    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 p-4 space-y-2.5 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                            <Wrench className="size-4" />
                            <span>Jenis Pekerjaan</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {ticket.work_types && ticket.work_types.length > 0 ? (
                                ticket.work_types.map((wt, i) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900 px-2.5 py-1 text-xs font-medium"
                                    >
                                        &bull; {wt}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-xs text-zinc-400 italic">Tidak ada rincian jenis pekerjaan</span>
                            )}
                        </div>

                        {ticket.other_work_text && (
                            <div className="mt-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-900">
                                <strong>Keterangan Pekerjaan Tambahan:</strong> {ticket.other_work_text}
                            </div>
                        )}
                    </div>

                    {/* 6. Catatan Teknisi / Lapangan */}
                    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 p-4 space-y-2.5 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                            <FileText className="size-4" />
                            <span>Catatan Lapangan & Teknisi</span>
                        </div>

                        {ticket.notes ? (
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                {ticket.notes}
                            </p>
                        ) : (
                            <p className="text-xs text-zinc-400 italic">Belum ada catatan teknisi yang ditambahkan.</p>
                        )}
                    </div>

                    {/* 7. Foto Dokumentasi */}
                    <div className="rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                                <Camera className="size-4" />
                                <span>Dokumentasi Foto Pengerjaan</span>
                            </div>
                            {(ticket.visit_photo || ticket.completion_photo) && onPreviewPhotos && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onPreviewPhotos(ticket);
                                    }}
                                    className="text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1 hover:underline cursor-pointer"
                                >
                                    Buka di Lightbox
                                    <ExternalLink className="size-3" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            {/* Foto Kunjungan */}
                            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden flex flex-col">
                                <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold flex items-center justify-between">
                                    <span>Foto Kunjungan</span>
                                    {ticket.visit_photo ? (
                                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:text-emerald-400">Ada</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-300 dark:text-zinc-500">Kosong</Badge>
                                    )}
                                </div>
                                <div className="aspect-video w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 relative group overflow-hidden">
                                    {ticket.visit_photo ? (
                                        <img
                                            src={ticket.visit_photo}
                                            alt="Foto Kunjungan"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            onClick={() => setSelectedPhoto({ url: ticket.visit_photo!, title: 'Foto Kunjungan' })}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-zinc-400">
                                            <ImageOff className="size-6" />
                                            <span className="text-[11px]">Belum ada foto kunjungan</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Foto Selesai */}
                            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden flex flex-col">
                                <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold flex items-center justify-between">
                                    <span>Foto Selesai</span>
                                    {ticket.completion_photo ? (
                                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:text-emerald-400">Ada</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-300 dark:text-zinc-500">Kosong</Badge>
                                    )}
                                </div>
                                <div className="aspect-video w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 relative group overflow-hidden">
                                    {ticket.completion_photo ? (
                                        <img
                                            src={ticket.completion_photo}
                                            alt="Foto Selesai"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            onClick={() => setSelectedPhoto({ url: ticket.completion_photo!, title: 'Foto Selesai' })}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-zinc-400">
                                            <ImageOff className="size-6" />
                                            <span className="text-[11px]">Belum ada foto selesai</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 8. Audit Trail / Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-3 px-1">
                        <div>
                            <span>Dibuat pada: </span>
                            <strong className="text-zinc-600 dark:text-zinc-300">{formatDateTime(ticket.created_at)}</strong>
                        </div>
                        <div>
                            <span>Terakhir diperbarui: </span>
                            <strong className="text-zinc-600 dark:text-zinc-300">{formatDateTime(ticket.updated_at)}</strong>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="sticky bottom-0 border-t border-zinc-200 dark:border-zinc-800 p-4 sm:px-6 flex items-center justify-between gap-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="rounded-xl cursor-pointer"
                    >
                        Tutup
                    </Button>

                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <Button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onEdit(ticket);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-1.5 cursor-pointer shadow-sm"
                            >
                                <Edit2 className="size-3.5" />
                                Edit Tiket
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>

            {/* Quick Single Photo Zoom Dialog */}
            {selectedPhoto && (
                <Dialog open={Boolean(selectedPhoto)} onOpenChange={() => setSelectedPhoto(null)}>
                    <DialogContent className="max-w-2xl p-2 bg-black/95 border-zinc-800">
                        <div className="relative flex flex-col items-center">
                            <img
                                src={selectedPhoto.url}
                                alt={selectedPhoto.title}
                                className="max-h-[80vh] w-auto object-contain rounded-lg"
                            />
                            <div className="w-full text-center text-xs text-zinc-300 pt-2 font-medium">
                                {selectedPhoto.title} &bull; {ticket.notif_number}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </Dialog>
    );
}
