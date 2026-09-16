import React from 'react';
import { FileText } from 'lucide-react';
import { TicketCardItem } from './ticket-card-item';
import type { ServiceTicket } from '@/types';
import type { ViewMode } from '@/hooks/use-ticket-filters';

interface TicketCardsViewProps {
    tickets: ServiceTicket[];
    viewMode: ViewMode;
    onEdit: (ticket: ServiceTicket) => void;
    onDelete: (ticket: ServiceTicket) => void;
    onPreviewPhotos: (ticket: ServiceTicket) => void;
    onViewDetail: (ticket: ServiceTicket) => void;
}

export function TicketCardsView({
    tickets,
    viewMode,
    onEdit,
    onDelete,
    onPreviewPhotos,
    onViewDetail,
}: TicketCardsViewProps) {
    return (
        <section
            aria-label="Tampilan Kartu Tiket Servis"
            className={`gap-3.5 sm:gap-4 ${
                viewMode === 'cards'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
                    : viewMode === 'table'
                    ? 'hidden'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:hidden'
            }`}
        >
            {tickets.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-3">
                        <FileText className="size-6" />
                    </div>
                    <p className="font-semibold text-sm sm:text-base text-zinc-800 dark:text-zinc-200">
                        Tidak ada tiket servis yang sesuai
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Coba sesuaikan kata kunci pencarian atau filter yang dipilih.
                    </p>
                </div>
            ) : (
                tickets.map((ticket) => (
                    <TicketCardItem
                        key={ticket.id}
                        ticket={ticket}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onPreviewPhotos={onPreviewPhotos}
                        onViewDetail={onViewDetail}
                    />
                ))
            )}
        </section>
    );
}

