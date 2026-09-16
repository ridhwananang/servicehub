import React from 'react';
import {
    Phone,
    MapPin,
    CheckCircle2,
    XCircle,
    Calendar,
    Camera,
    Edit2,
    Trash2,
    Eye,
    Wrench,
    FileText,
    ExternalLink,
    MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkStatusToggle } from './work-status-toggle';
import { getDeadlineStatus } from './ticket-table-row';
import type { ServiceTicket } from '@/types';

interface TicketCardItemProps {
    ticket: ServiceTicket;
    canDelete?: boolean;
    onEdit: (ticket: ServiceTicket) => void;
    onDelete: (ticket: ServiceTicket) => void;
    onPreviewPhotos: (ticket: ServiceTicket) => void;
    onViewDetail: (ticket: ServiceTicket) => void;
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

export const TicketCardItem = React.memo(function TicketCardItem({
    ticket,
    canDelete = true,
    onEdit,
    onDelete,
    onPreviewPhotos,
    onViewDetail,
}: TicketCardItemProps) {
    const isCompletePhoto = Boolean(ticket.visit_photo && ticket.completion_photo);
    const hasAtLeastOnePhoto = Boolean(ticket.visit_photo || ticket.completion_photo);
    const isCompleted = ticket.work_status === 'selesai';

    // Sanitize phone for WhatsApp link (normalize 08xx to 628xx)
    const rawDigits = ticket.customer_phone?.replace(/\D/g, '') || '';
    const waNumber = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;

    const deadlineInfo = getDeadlineStatus(ticket);

    // Accent top bar color based on status
    let accentGradient = 'from-blue-600 via-sky-500 to-blue-600';
    if (isCompleted) {
        accentGradient = 'from-emerald-500 via-teal-500 to-emerald-600';
    } else if (deadlineInfo.isCritical) {
        accentGradient = 'from-red-600 via-rose-500 to-red-600';
    } else if (deadlineInfo.variant === 'overdue' || deadlineInfo.variant === 'today') {
        accentGradient = 'from-amber-500 via-orange-500 to-amber-600';
    }

    return (
        <article
            aria-label={`Tiket ${ticket.notif_number} untuk ${ticket.customer_name}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-3.5 sm:p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800/90 dark:bg-zinc-900/95 dark:hover:border-zinc-700 dark:hover:shadow-black/50"
        >
            {/* Glowing Top Accent Line */}
            <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${accentGradient}`} />

            <div className="space-y-2.5 sm:space-y-3">
                {/* Top Meta Row: Notif Number, Center, and Payment Status */}
                <div className="flex items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
                            {ticket.notif_number}
                        </span>
                        <span
                            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold border shrink-0 ${
                                ticket.mainwork_center === 'Pulogadung'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60'
                                    : ticket.mainwork_center === 'MOI'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60'
                                    : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                            }`}
                        >
                            {ticket.mainwork_center}
                        </span>
                    </div>

                    {/* Payment Badge */}
                    <div className="shrink-0">
                        {ticket.status === 'berbayar' ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/80">
                                <CheckCircle2 className="size-3 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                                Berbayar
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80">
                                <XCircle className="size-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                                {ticket.status_note || 'Garansi'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Customer Info Header */}
                <div>
                    <div className="flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => onViewDetail(ticket)}
                            className="text-left font-bold text-sm sm:text-base text-zinc-900 hover:text-red-600 dark:text-white dark:hover:text-red-400 truncate transition-colors cursor-pointer"
                            title={`Lihat detail ${ticket.customer_name}`}
                        >
                            {ticket.customer_name}
                        </button>

                        <a
                            href={`https://wa.me/${waNumber}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-600 dark:hover:text-white dark:text-emerald-300 px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all border border-emerald-500/20 active:scale-95"
                            title={`Hubungi ${ticket.customer_name} via WhatsApp (${ticket.customer_phone})`}
                            aria-label={`Hubungi ${ticket.customer_name} via WhatsApp di ${ticket.customer_phone}`}
                        >
                            <MessageCircle className="size-3.5 sm:size-3 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                            <span className="hidden sm:inline font-mono">{ticket.customer_phone}</span>
                            <span className="sm:hidden text-[11px]">Chat WA</span>
                        </a>
                    </div>

                    {/* Customer Address with 1-Tap Google Maps Navigation */}
                    {ticket.customer_address && (
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.customer_address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/addr mt-1.5 flex items-start gap-1.5 rounded-lg bg-zinc-50 hover:bg-red-50/50 dark:bg-zinc-800/40 dark:hover:bg-red-950/20 p-2 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 border border-zinc-100 hover:border-red-200 dark:border-zinc-800/80 dark:hover:border-red-900/60 transition-all cursor-pointer"
                            title={`Buka rute navigasi Google Maps untuk ${ticket.customer_address}`}
                            aria-label={`Buka alamat ${ticket.customer_address} di Google Maps`}
                        >
                            <MapPin className="size-3.5 text-red-500 shrink-0 mt-0.5 group-hover/addr:scale-110 transition-transform" aria-hidden="true" />
                            <span className="line-clamp-2 leading-relaxed flex-1" title={ticket.customer_address}>
                                {ticket.customer_address}
                            </span>
                            <ExternalLink className="size-3 text-zinc-400 group-hover/addr:text-red-500 shrink-0 mt-0.5 opacity-70 group-hover/addr:opacity-100 transition-opacity" aria-hidden="true" />
                        </a>
                    )}
                </div>

                {/* Unit & Work Specification Card */}
                <div className="rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 p-2.5 text-xs border border-zinc-100 dark:border-zinc-800/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <Wrench className="size-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" aria-hidden="true" />
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {ticket.unit_model}
                            </span>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 shrink-0 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-200/60 dark:border-zinc-700/60">
                            SN: {ticket.serial_number}
                        </span>
                    </div>

                    {/* Work Types Badges */}
                    <div className="flex flex-wrap gap-1">
                        {ticket.work_types?.map((work) => (
                            <span
                                key={work}
                                className="inline-flex items-center rounded-md bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 border border-zinc-200 shadow-2xs dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700"
                            >
                                {work}
                            </span>
                        ))}
                        {ticket.other_work_text && (
                            <div className="w-full text-[10px] text-amber-700 dark:text-amber-400 italic pt-0.5">
                                &bull; {ticket.other_work_text}
                            </div>
                        )}
                    </div>

                    {/* Notes if available */}
                    {ticket.notes && (
                        <div className="flex items-start gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 italic pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                            <FileText className="size-3 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{ticket.notes}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Section: Schedule & Actions */}
            <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                {/* Schedule & Status Row */}
                <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                            <Calendar className="size-3 text-red-500 shrink-0" aria-hidden="true" />
                            <span className="truncate">{formatDate(ticket.deadline || ticket.service_date)}</span>
                            <span className="text-zinc-400 dark:text-zinc-500">&bull;</span>
                            <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                                {ticket.start_time || '--:--'} - {ticket.finish_time || '--:--'}
                            </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                            <span
                                suppressHydrationWarning
                                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] border ${deadlineInfo.badgeClass}`}
                            >
                                {deadlineInfo.label}
                                {deadlineInfo.urgencyText && (
                                    <span className="font-bold ml-0.5">{deadlineInfo.urgencyText}</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Work Status Toggle (Selesai / Belum Selesai) */}
                    <div className="shrink-0">
                        <WorkStatusToggle ticket={ticket} />
                    </div>
                </div>

                {/* Action Buttons Bar */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    {/* Foto Button */}
                    <button
                        type="button"
                        onClick={() => onPreviewPhotos(ticket)}
                        aria-label={`Buka foto dokumentasi tiket ${ticket.notif_number}`}
                        className={`flex h-9 sm:h-8 items-center gap-1.5 rounded-xl sm:rounded-lg px-2.5 text-xs font-medium border transition-all cursor-pointer active:scale-95 ${
                            isCompletePhoto
                                ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                : hasAtLeastOnePhoto
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700'
                        }`}
                    >
                        <Camera className="size-4 sm:size-3.5 shrink-0" aria-hidden="true" />
                        <span className="text-[11px]">
                            {isCompletePhoto ? '2 Foto' : hasAtLeastOnePhoto ? '1 Foto' : '0 Foto'}
                        </span>
                    </button>

                    {/* Icon Buttons Group: Detail, Edit, Delete */}
                    <div className="flex items-center gap-1.5 sm:gap-1">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => onViewDetail(ticket)}
                            aria-label={`Lihat detail lengkap tiket ${ticket.notif_number}`}
                            title="Lihat Detail Lengkap"
                            className="size-9 sm:size-8 rounded-xl sm:rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 dark:text-zinc-300 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 cursor-pointer active:scale-95 transition-all"
                        >
                            <Eye className="size-4 sm:size-3.5" aria-hidden="true" />
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => onEdit(ticket)}
                            aria-label={`Edit tiket ${ticket.notif_number}`}
                            title="Edit Tiket"
                            className="size-9 sm:size-8 rounded-xl sm:rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 dark:text-zinc-300 dark:hover:bg-amber-950/50 dark:hover:text-amber-300 cursor-pointer active:scale-95 transition-all"
                        >
                            <Edit2 className="size-4 sm:size-3.5" aria-hidden="true" />
                        </Button>

                        {canDelete && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => onDelete(ticket)}
                                aria-label={`Hapus tiket ${ticket.notif_number}`}
                                title="Hapus Tiket"
                                className="size-9 sm:size-8 rounded-xl sm:rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 dark:text-zinc-400 dark:hover:bg-red-950/50 dark:hover:text-red-400 cursor-pointer active:scale-95 transition-all"
                            >
                                <Trash2 className="size-4 sm:size-3.5" aria-hidden="true" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
});

