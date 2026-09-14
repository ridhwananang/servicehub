import React from 'react';
import { Phone, MapPin, CheckCircle2, XCircle, Calendar, Camera, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ServiceTicket } from '@/types';

interface TicketTableRowProps {
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

export const TicketTableRow = React.memo(function TicketTableRow({
    ticket,
    onEdit,
    onDelete,
    onPreviewPhotos,
}: TicketTableRowProps) {
    const isCompletePhoto = Boolean(ticket.visit_photo && ticket.completion_photo);
    const hasAtLeastOnePhoto = Boolean(ticket.visit_photo || ticket.completion_photo);

    // Sanitize phone for WhatsApp link (normalize 08xx to 628xx)
    const rawDigits = ticket.customer_phone?.replace(/\D/g, '') || '';
    const waNumber = rawDigits.startsWith('0') ? '62' + rawDigits.slice(1) : rawDigits;

    return (
        <tr className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
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
                    <div className="flex items-start gap-1 text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                        <MapPin className="size-3.5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                        <span className="line-clamp-2" title={ticket.customer_address}>
                            {ticket.customer_address}
                        </span>
                    </div>
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

            {/* Tanggal & Jam */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                    <Calendar className="size-3 text-slate-400 shrink-0" aria-hidden="true" />
                    <span>{formatDate(ticket.service_date)}</span>
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {ticket.start_time || '--:--'} - {ticket.finish_time || '--:--'}
                </div>
            </td>

            {/* Foto Kunjungan & Selesai */}
            <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                <button
                    type="button"
                    onClick={() => onPreviewPhotos(ticket)}
                    aria-label={`Lihat foto dokumentasi tiket ${ticket.notif_number}`}
                    className="group flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/70 p-1.5 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-indigo-800 transition-all text-left"
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
                        <span className="text-[11px] font-semibold text-slate-700 group-hover:text-indigo-600 dark:text-slate-300 dark:group-hover:text-indigo-400">
                            {isCompletePhoto ? '2 Foto' : hasAtLeastOnePhoto ? '1 Foto' : '0 Foto'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                            {isCompletePhoto ? 'Lengkap' : 'Perlu Foto'}
                        </span>
                    </div>
                </button>
            </td>

            {/* Actions */}
            <td className="px-3.5 py-3.5 align-middle text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(ticket)}
                        title={`Edit tiket ${ticket.notif_number}`}
                        aria-label={`Edit tiket ${ticket.notif_number}`}
                        className="size-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
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
