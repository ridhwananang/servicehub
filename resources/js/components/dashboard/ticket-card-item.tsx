import React from 'react';
import { Phone, MapPin, CheckCircle2, XCircle, Calendar, Camera, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ServiceTicket } from '@/types';

interface TicketCardItemProps {
    ticket: ServiceTicket;
    onEdit: (ticket: ServiceTicket) => void;
    onDelete: (ticket: ServiceTicket) => void;
    onPreviewPhotos: (ticket: ServiceTicket) => void;
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
    onEdit,
    onDelete,
    onPreviewPhotos,
}: TicketCardItemProps) {
    const isCompletePhoto = Boolean(ticket.visit_photo && ticket.completion_photo);
    const hasAtLeastOnePhoto = Boolean(ticket.visit_photo || ticket.completion_photo);

    // Sanitize phone for WhatsApp link (normalize 08xx to 628xx)
    const rawDigits = ticket.customer_phone?.replace(/\D/g, '') || '';
    const waNumber = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;

    return (
        <article
            aria-label={`Tiket ${ticket.notif_number} untuk ${ticket.customer_name}`}
            className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3 transition-shadow hover:shadow-md"
        >
            {/* Card Header: Notif, Status, & Center */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800 gap-1.5 flex-wrap xs:flex-nowrap">
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
                        {ticket.notif_number}
                    </span>
                    <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                            ticket.mainwork_center === 'Pulogadung'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                : ticket.mainwork_center === 'MOI'
                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        {ticket.mainwork_center}
                    </Badge>
                </div>

                {ticket.status === 'berbayar' ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 shrink-0">
                        <CheckCircle2 className="size-3 text-blue-600" aria-hidden="true" />
                        Berbayar
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 shrink-0">
                        <XCircle className="size-3 text-amber-600" aria-hidden="true" />
                        {ticket.status_note || 'Tidak Berbayar'}
                    </span>
                )}
            </div>

            {/* Customer & Address */}
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {ticket.customer_name}
                    </span>
                    <a
                        href={`https://wa.me/${waNumber}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="shrink-0 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 sm:px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors min-h-[34px]"
                        title={`Hubungi ${ticket.customer_name} via WhatsApp`}
                        aria-label={`Hubungi ${ticket.customer_name} via WhatsApp di ${ticket.customer_phone}`}
                    >
                        <Phone className="size-3 text-emerald-600" aria-hidden="true" />
                        <span>{ticket.customer_phone}</span>
                    </a>
                </div>

                {ticket.customer_address && (
                    <div className="flex items-start gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <MapPin className="size-3.5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="line-clamp-2">{ticket.customer_address}</span>
                    </div>
                )}
            </div>

            {/* Unit Model & SN */}
            <div className="rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {ticket.unit_model}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                        SN: {ticket.serial_number}
                    </span>
                </div>

                {/* Work Types */}
                <div className="mt-2 flex flex-wrap gap-1">
                    {ticket.work_types?.map((work) => (
                        <Badge
                            key={work}
                            variant="outline"
                            className="bg-white text-[10px] font-medium text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300"
                        >
                            {work}
                        </Badge>
                    ))}
                    {ticket.other_work_text && (
                        <div className="w-full text-[10px] text-amber-700 dark:text-amber-400 italic pt-0.5">
                            &bull; {ticket.other_work_text}
                        </div>
                    )}
                </div>
            </div>

            {/* Card Footer: Date, Photos, Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs gap-2">
                <div className="flex flex-col min-w-0 shrink">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 truncate">
                        <Calendar className="size-3 text-slate-400 shrink-0" aria-hidden="true" />
                        <span className="truncate">{formatDate(ticket.service_date)}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                        {ticket.start_time || '--:--'} - {ticket.finish_time || '--:--'}
                    </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    <button
                        type="button"
                        onClick={() => onPreviewPhotos(ticket)}
                        aria-label={`Buka foto dokumentasi tiket ${ticket.notif_number}`}
                        className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 sm:px-2.5 py-1.5 text-xs hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 transition-colors min-h-[34px] cursor-pointer active:scale-95"
                    >
                        <Camera className="size-3.5 text-slate-500" aria-hidden="true" />
                        <span className="text-[10px] sm:text-[11px] font-medium">
                            {isCompletePhoto ? '2 Foto' : hasAtLeastOnePhoto ? '1 Foto' : '0 Foto'}
                        </span>
                    </button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(ticket)}
                        aria-label={`Edit tiket ${ticket.notif_number}`}
                        className="size-8 sm:size-9 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 cursor-pointer active:scale-95"
                    >
                        <Edit2 className="size-3.5" aria-hidden="true" />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(ticket)}
                        aria-label={`Hapus tiket ${ticket.notif_number}`}
                        className="size-8 sm:size-9 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer active:scale-95"
                    >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                    </Button>
                </div>
            </div>
        </article>
    );
});
