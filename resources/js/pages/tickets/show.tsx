import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
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
    ArrowLeft,
    Trash2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { getDeadlineStatus } from '@/components/dashboard/ticket-table-row';
import { WorkStatusToggle } from '@/components/dashboard/work-status-toggle';
import { DeleteTicketDialog } from '@/components/dashboard/delete-ticket-dialog';
import type { ServiceTicket, User as UserType } from '@/types';

interface TicketShowPageProps {
    ticket: ServiceTicket;
    auth: {
        user: UserType;
    };
}

export default function TicketShowPage({ ticket, auth }: TicketShowPageProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; title: string } | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const deadlineInfo = getDeadlineStatus(ticket);
    const isAdmin = (auth?.user?.role || '').toLowerCase() === 'admin';

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

    const sanitizedPhone = ticket.customer_phone ? ticket.customer_phone.replace(/\D/g, '') : '';
    const waPhone = sanitizedPhone.startsWith('0')
        ? '62' + sanitizedPhone.slice(1)
        : sanitizedPhone.startsWith('62')
        ? sanitizedPhone
        : '62' + sanitizedPhone;
    const waUrl = `https://wa.me/${waPhone}`;

    return (
        <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between">
            <Head title={`Detail Tiket #${ticket.notif_number} - Aquos Platinum`} />

            {/* Top Navigation Red Header */}
            <header className="sticky top-0 z-40 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-950 dark:via-red-900 dark:to-red-950 text-white shadow-lg shadow-red-950/20 border-b border-red-500/40 dark:border-red-800/60 backdrop-blur-md">
                <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 hover:text-white rounded-xl h-9 px-2.5 sm:px-3.5 shrink-0 border border-white/25 bg-white/10 active:scale-95 transition-all"
                        >
                            <Link href="/dashboard" className="flex items-center gap-1.5 text-xs font-semibold">
                                <ArrowLeft className="size-4 shrink-0" />
                                <span>Kembali</span>
                            </Link>
                        </Button>
                        <div className="h-5 sm:h-6 w-px bg-white/25 hidden xs:block shrink-0" />
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <span className="font-mono text-xs xs:text-sm sm:text-base font-black tracking-tight text-white truncate">
                                #{ticket.notif_number}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            asChild
                            size="sm"
                            className="bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl h-9 px-3 sm:px-3.5 shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                            <Link href={`/tickets/${ticket.id}/edit`}>
                                <Edit2 className="size-3.5 mr-1.5" />
                                <span className="hidden xs:inline">Edit Tiket</span>
                                <span className="xs:hidden">Edit</span>
                            </Link>
                        </Button>

                        <ThemeToggle className="bg-white/15 hover:bg-white/25 border-white/25 text-white dark:bg-black/35 dark:hover:bg-black/50 dark:border-white/20 h-8 sm:h-9 w-8 sm:w-9" />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl w-full px-3.5 py-5 sm:px-6 sm:py-8 lg:px-8 flex-1">
                <div className="space-y-5">
                    {/* Hero Header Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-950 dark:via-red-900 dark:to-red-950 text-white p-5 sm:p-6 shadow-xl border border-red-500/40 dark:border-red-800/60">
                        <div className="relative z-10 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="font-mono text-sm sm:text-base font-bold bg-white/20 text-white border-white/30 backdrop-blur-xs px-3 py-1"
                                    >
                                        {ticket.notif_number}
                                    </Badge>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(ticket.notif_number, 'notif')}
                                        title="Salin Nomor Notif"
                                        aria-label="Salin Nomor Notifikasi"
                                        className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                                    >
                                        {copiedField === 'notif' ? (
                                            <Check className="size-4 text-emerald-300" />
                                        ) : (
                                            <Copy className="size-4" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/90 font-medium hidden sm:inline">Status Pengerjaan:</span>
                                    <div className="bg-white/15 dark:bg-black/40 p-1 rounded-xl backdrop-blur-xs border border-white/20">
                                        <WorkStatusToggle ticket={ticket} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
                                    Detail Tiket Servis Pelanggan
                                </h1>
                                <p className="text-xs sm:text-sm text-red-100 mt-0.5">
                                    Rincian lengkap pelanggan, model unit, jadwal pengerjaan, dan bukti foto servis.
                                </p>
                            </div>

                            {/* Status and urgency badges */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
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

                    {/* Grid: Pelanggan & Unit Perangkat */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Informasi Pelanggan */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5 shadow-xs dark:border-slate-800">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                <User className="size-4" />
                                <span>Informasi Pelanggan</span>
                            </div>

                            <div className="space-y-3 text-xs sm:text-sm">
                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Nama Lengkap</span>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{ticket.customer_name}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">No Handphone / Kontak</span>
                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <a
                                            href={`tel:${ticket.customer_phone}`}
                                            className="font-mono font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 hover:underline"
                                        >
                                            <Phone className="size-3.5" />
                                            {ticket.customer_phone}
                                        </a>
                                        {ticket.customer_phone && (
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
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Alamat Domisili / Lokasi</span>
                                        {ticket.customer_address && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.customer_address)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400 hover:underline transition-colors"
                                            >
                                                <MapPin className="size-3" />
                                                <span>Buka di Maps</span>
                                                <ExternalLink className="size-2.5" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex items-start gap-1.5 mt-1 text-slate-700 dark:text-slate-300">
                                        <MapPin className="size-4 text-red-500 shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{ticket.customer_address || 'Tidak ada data alamat'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Informasi Unit Perangkat */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5 shadow-xs dark:border-slate-800">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                <Tv className="size-4" />
                                <span>Informasi Unit & Perangkat</span>
                            </div>

                            <div className="space-y-3 text-xs sm:text-sm">
                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Model / Tipe Unit</span>
                                    <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{ticket.unit_model}</span>
                                </div>

                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Nomor Seri (Serial Number)</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
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
                                                <Check className="size-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Pusat Servis (Mainwork Center)</span>
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-1">
                                        <Building2 className="size-4 text-red-500" />
                                        {ticket.mainwork_center}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid: Waktu & Status Biaya */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 3. Waktu & Jadwal */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5 shadow-xs dark:border-slate-800">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                <Calendar className="size-4" />
                                <span>Jadwal & Waktu Pengerjaan</span>
                            </div>

                            <div className="space-y-3 text-xs sm:text-sm">
                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Batas Waktu (Deadline)</span>
                                    <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 mt-1">
                                        <Clock className="size-4 shrink-0" />
                                        {formatDate(ticket.deadline || ticket.service_date)}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Tanggal Masuk / Kunjungan</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200 mt-1 block">
                                        {formatDate(ticket.service_date)}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Jam Pengerjaan Lapangan</span>
                                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 mt-1 block">
                                        {ticket.start_time || '--:--'} s/d {ticket.finish_time || '--:--'} WIB
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Status Pembayaran */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5 shadow-xs dark:border-slate-800">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                <CheckCircle2 className="size-4" />
                                <span>Status Garansi & Biaya</span>
                            </div>

                            <div className="space-y-3 text-xs sm:text-sm">
                                <div>
                                    <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Kategori Biaya</span>
                                    <div className="mt-1">
                                        {ticket.status === 'berbayar' ? (
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900">
                                                <CheckCircle2 className="size-4" />
                                                Berbayar (Out-of-Warranty)
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900">
                                                <XCircle className="size-4" />
                                                Tidak Berbayar (Garansi Sharp)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {ticket.status_note && (
                                    <div>
                                        <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Keterangan Khusus</span>
                                        <p className="font-medium text-slate-800 dark:text-slate-200 mt-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                            {ticket.status_note}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 5. Jenis Pekerjaan */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3 shadow-xs dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <Wrench className="size-4" />
                            <span>Rincian Jenis Pekerjaan</span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            {ticket.work_types && ticket.work_types.length > 0 ? (
                                ticket.work_types.map((wt, i) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900 px-3 py-1.5 text-xs font-semibold rounded-lg"
                                    >
                                        &bull; {wt}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-xs text-slate-400 italic">Tidak ada rincian jenis pekerjaan</span>
                            )}
                        </div>

                        {ticket.other_work_text && (
                            <div className="mt-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900">
                                <strong>Pekerjaan Lainnya:</strong> {ticket.other_work_text}
                            </div>
                        )}
                    </div>

                    {/* 6. Catatan Teknisi */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3 shadow-xs dark:border-slate-800">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <FileText className="size-4" />
                            <span>Catatan Teknisi Lapangan</span>
                        </div>

                        {ticket.notes ? (
                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                {ticket.notes}
                            </p>
                        ) : (
                            <p className="text-xs text-slate-400 italic">Belum ada catatan teknisi yang ditambahkan.</p>
                        )}
                    </div>

                    {/* 7. Foto Dokumentasi */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5 shadow-xs dark:border-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                                <Camera className="size-4" />
                                <span>Dokumentasi Foto Pengerjaan</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            {/* Foto Kunjungan */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 overflow-hidden flex flex-col">
                                <div className="px-3.5 py-2 bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-between">
                                    <span>Foto Kunjungan / Unit Awal</span>
                                    {ticket.visit_photo ? (
                                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:text-emerald-400">Ada</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-300 dark:text-slate-500">Kosong</Badge>
                                    )}
                                </div>
                                <div className="aspect-video w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 relative group overflow-hidden">
                                    {ticket.visit_photo ? (
                                        <img
                                            src={ticket.visit_photo}
                                            alt="Foto Kunjungan"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            onClick={() => setSelectedPhoto({ url: ticket.visit_photo!, title: 'Foto Kunjungan' })}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                            <ImageOff className="size-7" />
                                            <span className="text-xs">Belum ada foto kunjungan</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Foto Selesai */}
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 overflow-hidden flex flex-col">
                                <div className="px-3.5 py-2 bg-slate-100/80 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-between">
                                    <span>Foto Selesai / Pengerjaan Beres</span>
                                    {ticket.completion_photo ? (
                                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 dark:text-emerald-400">Ada</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-300 dark:text-slate-500">Kosong</Badge>
                                    )}
                                </div>
                                <div className="aspect-video w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 relative group overflow-hidden">
                                    {ticket.completion_photo ? (
                                        <img
                                            src={ticket.completion_photo}
                                            alt="Foto Selesai"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                                            onClick={() => setSelectedPhoto({ url: ticket.completion_photo!, title: 'Foto Selesai' })}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-1.5 text-slate-400">
                                            <ImageOff className="size-7" />
                                            <span className="text-xs">Belum ada foto penyelesaian</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 8. Audit Trail & Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-200/80 dark:border-slate-800 pt-4 px-1">
                        <div>
                            <span>Dibuat oleh: </span>
                            <strong className="text-slate-700 dark:text-slate-300">
                                {ticket.creator ? `${ticket.creator.name} (${ticket.creator.role || 'teknisi'})` : 'Sistem'}
                            </strong>
                        </div>
                        <div>
                            <span>Dibuat pada: </span>
                            <strong className="text-slate-700 dark:text-slate-300">{formatDateTime(ticket.created_at)}</strong>
                        </div>
                        <div>
                            <span>Terakhir diperbarui: </span>
                            <strong className="text-slate-700 dark:text-slate-300">{formatDateTime(ticket.updated_at)}</strong>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="sticky bottom-4 z-30 p-3 sm:p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-xl text-xs font-semibold h-10 px-4"
                        >
                            <Link href="/dashboard">
                                <ArrowLeft className="size-4 mr-1.5" />
                                <span>Kembali ke Dashboard</span>
                            </Link>
                        </Button>

                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDeleteDialogOpen(true)}
                                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40 rounded-xl text-xs font-semibold h-10 px-4 cursor-pointer"
                                >
                                    <Trash2 className="size-4 mr-1.5" />
                                    <span>Hapus Tiket</span>
                                </Button>
                            )}

                            <Button
                                asChild
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold h-10 px-5 shadow-sm shadow-red-600/25 active:scale-95 transition-all"
                            >
                                <Link href={`/tickets/${ticket.id}/edit`}>
                                    <Edit2 className="size-4 mr-1.5" />
                                    <span>Edit Tiket Ini</span>
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Lightbox Photo Zoom Dialog */}
            {selectedPhoto && (
                <Dialog open={Boolean(selectedPhoto)} onOpenChange={() => setSelectedPhoto(null)}>
                    <DialogContent className="max-w-3xl p-3 bg-black/95 border-zinc-800">
                        <div className="relative flex flex-col items-center">
                            <img
                                src={selectedPhoto.url}
                                alt={selectedPhoto.title}
                                className="max-h-[82vh] w-auto object-contain rounded-xl"
                            />
                            <div className="w-full text-center text-xs text-zinc-300 pt-3 font-semibold">
                                {selectedPhoto.title} &bull; Tiket #{ticket.notif_number}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Delete Confirmation Modal for Admin */}
            {isAdmin && (
                <DeleteTicketDialog
                    ticket={isDeleteDialogOpen ? ticket : null}
                    onClose={() => setIsDeleteDialogOpen(false)}
                />
            )}
        </div>
    );
}

TicketShowPage.layout = (page: React.ReactNode) => page;
