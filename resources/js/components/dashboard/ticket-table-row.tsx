import React from 'react';
import { Phone, MapPin, CheckCircle2, XCircle, Calendar, Camera, Edit2, Trash2, Clock, AlertTriangle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkStatusToggle } from './work-status-toggle';
import type { ServiceTicket } from '@/types';

interface TicketTableRowProps {
    ticket: ServiceTicket;
    onEdit: (ticket: ServiceTicket) => void;
    onDelete: (ticket: ServiceTicket) => void;
    onPreviewPhotos: (ticket: ServiceTicket) => void;
    onViewDetail: (ticket: ServiceTicket) => void;
}

export function getDeadlineStatus(ticket: ServiceTicket) {
    if (ticket.work_status === 'selesai') {
        return {
            variant: 'completed' as const,
            label: 'Selesai',
            urgencyText: null,
            badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
            isCritical: false,
        };
    }

    const dateStr = ticket.deadline || ticket.service_date;
    if (!dateStr) {
        return {
            variant: 'normal' as const,
            label: 'Belum Selesai',
            urgencyText: null,
            badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300',
            isCritical: false,
        };
    }

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < -3) {
        const overdueDays = Math.abs(diffDays);
        return {
            variant: 'critical' as const,
            label: `🚨 Lewat ${overdueDays} Hari!`,
            urgencyText: 'Segera Proses!',
            badgeClass: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 animate-pulse font-bold shadow-xs',
            isCritical: true,
        };
    }

    if (diffDays < 0) {
        const overdueDays = Math.abs(diffDays);
        return {
            variant: 'overdue' as const,
            label: `⚠️ Lewat ${overdueDays} Hari`,
            urgencyText: 'Segera Proses',
            badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 font-semibold',
            isCritical: false,
        };
    }

    if (diffDays === 0) {
        return {
            variant: 'today' as const,
            label: '⏳ Hari Ini Deadline',
            urgencyText: 'Segera Proses',
            badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800 font-semibold',
            isCritical: false,
        };
    }

    if (diffDays <= 3) {
        return {
            variant: 'approaching' as const,
            label: `⏳ Sisa ${diffDays} Hari`,
            urgencyText: 'Segera Proses',
            badgeClass: 'bg-amber-50 text-amber-700 border-amber-300/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80',
            isCritical: false,
        };
    }

    return {
        variant: 'ontime' as const,
        label: `Sisa ${diffDays} Hari`,
        urgencyText: null,
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        isCritical: false,
    };
}

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return 'Hari ini';
    try {
        const d = new Date(dateStr);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(d);
    } catch {
        return dateStr;
    }
}

export const TicketTableRow = React.memo(function TicketTableRow({
    ticket,
    onEdit,
    onDelete,
    onPreviewPhotos,
    onViewDetail,
}: TicketTableRowProps) {
    const isCompletePhoto = Boolean(ticket.visit_photo && ticket.completion_photo);
    const hasAtLeastOnePhoto = Boolean(ticket.visit_photo || ticket.completion_photo);

    // Sanitize phone for WhatsApp link (normalize 08xx to 628xx)
    const rawDigits = ticket.customer_phone?.replace(/\D/g, '') || '';
    const waNumber = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;

    const deadlineInfo = getDeadlineStatus(ticket);

    return (
        <tr className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
            {/* Notif Unique */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                    {ticket.notif_number}
                </span>
            </td>

            {/* Nama Pelanggan */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                <span className="font-semibold text-slate-900 dark:text-white">
                    {ticket.customer_name}
                </span>
            </td>

            {/* No Handphone */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors"
                    title={`Hubungi ${ticket.customer_name} via WhatsApp`}
                    aria-label={`Hubungi ${ticket.customer_name} via WhatsApp di ${ticket.customer_phone}`}
                >
                    <Phone className="size-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
                    <span>{ticket.customer_phone}</span>
                </a>
            </td>

            {/* Alamat Pelanggan */}
            <td className="px-3.5 py-3.5 align-middle min-w-[200px] max-w-[280px]">
                {ticket.customer_address ? (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.customer_address)}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="group/map flex items-start gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 leading-tight transition-colors"
                        title={`Buka peta lokasi: ${ticket.customer_address}`}
                        aria-label={`Buka peta lokasi ${ticket.customer_address}`}
                    >
                        <MapPin className="size-3.5 text-red-500 shrink-0 mt-0.5 group-hover/map:scale-110 transition-transform" aria-hidden="true" />
                        <span className="line-clamp-2">
                            {ticket.customer_address}
                        </span>
                    </a>
                ) : (
                    <span className="text-slate-400 text-[11px]">-</span>
                )}
            </td>

            {/* Model Unit */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                <span className="font-medium text-slate-800 dark:text-slate-200">
                    {ticket.unit_model}
                </span>
            </td>

            {/* No Seri */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {ticket.serial_number}
                </span>
            </td>

            {/* Status */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                {ticket.status === 'berbayar' ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 border border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900">
                        <CheckCircle2 className="size-3 text-blue-600 shrink-0" aria-hidden="true" />
                        Berbayar
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 border border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900">
                        <XCircle className="size-3 text-amber-600 shrink-0" aria-hidden="true" />
                        {ticket.status_note || 'Tidak Berbayar'}
                    </span>
                )}
            </td>

            {/* Jenis Pengerjaan (Multi) */}
            <td className="px-3.5 py-3.5 align-middle">
                <div className="flex flex-wrap gap-1 max-w-[220px]">
                    {ticket.work_types?.map((work) => (
                        <Badge
                            key={work}
                            variant="outline"
                            className="rounded-md bg-slate-50 text-[11px] font-medium text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        >
                            {work}
                        </Badge>
                    ))}
                    {ticket.other_work_text && (
                        <div className="w-full text-[10px] text-amber-700 dark:text-amber-400 italic">
                            &bull; {ticket.other_work_text}
                        </div>
                    )}
                </div>
            </td>

            {/* Mainwork Center */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                <Badge
                    variant="secondary"
                    className={
                        ticket.mainwork_center === 'Pulogadung'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300'
                            : ticket.mainwork_center === 'MOI'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }
                >
                    {ticket.mainwork_center}
                </Badge>
            </td>

            {/* Deadline & Jam */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    <Calendar className="size-3 text-red-500 shrink-0" aria-hidden="true" />
                    <span>{formatDate(ticket.deadline || ticket.service_date)}</span>
                </div>
                {/* Dynamic Urgency / Process Badge */}
                <div className="mt-1">
                    <span
                        suppressHydrationWarning
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] border ${deadlineInfo.badgeClass}`}
                    >
                        {deadlineInfo.label}
                        {deadlineInfo.urgencyText && (
                            <span className="font-bold underline ml-0.5">{deadlineInfo.urgencyText}</span>
                        )}
                    </span>
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                    {ticket.start_time || '--:--'} - {ticket.finish_time || '--:--'}
                </div>
            </td>

            {/* Foto Kunjungan & Selesai */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                <button
                    type="button"
                    onClick={() => onPreviewPhotos(ticket)}
                    aria-label={`Lihat foto dokumentasi tiket ${ticket.notif_number}`}
                    className="group flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/70 p-1.5 hover:border-red-300 hover:bg-red-50/50 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-red-900/60 transition-all text-left"
                    title="Klik untuk melihat foto dokumentasi"
                >
                    <div className="flex -space-x-2">
                        {ticket.visit_photo ? (
                            <img
                                src={ticket.visit_photo}
                                alt="Foto Kunjungan"
                                className="size-7 rounded-md object-cover ring-2 ring-white dark:ring-slate-900"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex size-7 items-center justify-center rounded-md bg-slate-200 text-slate-400 ring-2 ring-white dark:bg-slate-800 dark:ring-slate-900">
                                <Camera className="size-3.5" aria-hidden="true" />
                            </div>
                        )}
                        {ticket.completion_photo ? (
                            <img
                                src={ticket.completion_photo}
                                alt="Foto Selesai"
                                className="size-7 rounded-md object-cover ring-2 ring-white dark:ring-slate-900"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex size-7 items-center justify-center rounded-md bg-slate-200 text-slate-400 ring-2 ring-white dark:bg-slate-800 dark:ring-slate-900">
                                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-slate-700 group-hover:text-red-600 dark:text-slate-300 dark:group-hover:text-red-400">
                            {isCompletePhoto ? '2 Foto' : hasAtLeastOnePhoto ? '1 Foto' : '0 Foto'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {isCompletePhoto ? 'Lengkap' : 'Perlu Foto'}
                        </span>
                    </div>
                </button>
            </td>

            {/* Actions with Status Toggle */}
            <td className="px-3.5 py-3.5 align-middle text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5">
                    <WorkStatusToggle ticket={ticket} />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewDetail(ticket)}
                        title={`Lihat detail lengkap tiket ${ticket.notif_number}`}
                        aria-label={`Lihat detail lengkap tiket ${ticket.notif_number}`}
                        className="size-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 cursor-pointer"
                    >
                        <Eye className="size-3.5" aria-hidden="true" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(ticket)}
                        title={`Edit tiket ${ticket.notif_number}`}
                        aria-label={`Edit tiket ${ticket.notif_number}`}
                        className="size-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                    >
                        <Edit2 className="size-3.5" aria-hidden="true" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(ticket)}
                        title={`Hapus tiket ${ticket.notif_number}`}
                        aria-label={`Hapus tiket ${ticket.notif_number}`}
                        className="size-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                    </Button>
                </div>
            </td>
        </tr>
    );
});
