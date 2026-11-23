import React from 'react';
import { Head } from '@inertiajs/react';
import { TicketForm } from '@/components/tickets/ticket-form';
import type { ServiceTicket } from '@/types';

interface TicketEditPageProps {
    ticket: ServiceTicket;
}

export default function TicketEditPage({ ticket }: TicketEditPageProps) {
    return (
        <>
            <Head title={`Edit Notifikasi #${ticket.notif_number} - Aquos Platinum`} />
            <TicketForm isEdit={true} initialTicket={ticket} />
        </>
    );
}

TicketEditPage.layout = (page: React.ReactNode) => page;
