import React from 'react';
import { TicketTableRow } from './ticket-table-row';
import type { ServiceTicket } from '@/types';
import type { ViewMode } from '@/hooks/use-ticket-filters';

interface TicketTableViewProps {
    tickets: ServiceTicket[];
    viewMode: ViewMode;
    canDelete?: boolean;
    onEdit: (ticket: ServiceTicket) => void;
    onDelete: (ticket: ServiceTicket) => void;
    onPreviewPhotos: (ticket: ServiceTicket) => void;
    onViewDetail: (ticket: ServiceTicket) => void;
}

export function TicketTableView({
    tickets,
    viewMode,
    canDelete = true,
    onEdit,
    onDelete,
    onPreviewPhotos,
    onViewDetail,
}: TicketTableViewProps) {
    const isVisible =
        viewMode === 'table' ? true : viewMode === 'cards' ? false : true; // 'auto' shows on desktop

    return (
        <section
            aria-label="Tabel Data Tiket Servis"
            className={`overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/30 to-zinc-50/60 shadow-xs dark:border-zinc-800/80 dark:bg-gradient-to-b dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-950/95 ${
                viewMode === 'table'
                    ? 'block'
                    : viewMode === 'cards'
                    ? 'hidden'
                    : 'hidden lg:block'
            }`}
        >
            <div className="overflow-x-auto custom-scrollbar pb-1">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead className="border-b border-zinc-200 bg-gradient-to-r from-zinc-50 via-zinc-100/70 to-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:border-zinc-800 dark:bg-gradient-to-r dark:from-zinc-950/90 dark:via-zinc-900/90 dark:to-zinc-950/90 dark:text-zinc-400">
                        <tr>
                            <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">NOTIF (UNIQUE)</th>
                            <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">NAMA PELANGGAN</th>
                            <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">NO HANDPHONE</th>
                            <th scope="col" className="px-3.5 py-3.5">ALAMAT</th>
                            <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">MODEL UNIT</th>
                            <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">NO SERI</th>
                            <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">STATUS</th>
                            <th scope="col" className="px-3.5 py-3.5">JENIS PENGERJAAN</th>
                            <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">MAINWORK CENTER</th>
                            <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">DEADLINE & PROSES</th>
                            <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">FOTO DOKUMENTASI</th>
                            <th scope="col" className="px-3.5 py-3.5 text-right whitespace-nowrap">AKSI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="px-4 py-12 text-center text-slate-400">
                                    Tidak ada tiket servis yang sesuai dengan filter atau pencarian.
                                </td>
                            </tr>
                        ) : (
                            tickets.map((ticket) => (
                                <TicketTableRow
                                    key={ticket.id}
                                    ticket={ticket}
                                    canDelete={canDelete}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onPreviewPhotos={onPreviewPhotos}
                                    onViewDetail={onViewDetail}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
