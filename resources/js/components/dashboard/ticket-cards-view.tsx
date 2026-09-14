import React from 'react';
import { TicketCardItem } from './ticket-card-item';
import type { ServiceTicket } from '@/types';
import type { ViewMode } from '@/hooks/use-ticket-filters';

interface TicketCardsViewProps {
    tickets: ServiceTicket[];
    viewMode: ViewMode;
    onEdit: (ticket: ServiceTicket) => void;
    onDelete: (ticket: ServiceTicket) => void;
    onPreviewPhotos: (ticket: ServiceTicket) => void;
}

export function TicketCardsView({
    tickets,
    viewMode,
    onEdit,
    onDelete,
    onPreviewPhotos,
}: TicketCardsViewProps) {
    return (
        <section
            aria-label="Tampilan Kartu Tiket Servis"
            className={`gap-3 ${
                viewMode === 'cards'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : viewMode === 'table'
                    ? 'hidden'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:hidden'
            }`}
        >
            {tickets.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                    Tidak ada tiket servis yang sesuai dengan filter atau pencarian.
                </div>
            ) : (
                tickets.map((ticket) => (
                    <TicketCardItem
                        key={ticket.id}
                        ticket={ticket}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onPreviewPhotos={onPreviewPhotos}
                    />
                ))
            )}
        </section>
    );
}
