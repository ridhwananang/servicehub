import React from 'react';
import { Head } from '@inertiajs/react';
import { TicketForm } from '@/components/tickets/ticket-form';

export default function TicketCreatePage() {
    return (
        <>
            <Head title="Tambah Notifikasi Tiket Baru - Aquos Platinum" />
            <TicketForm isEdit={false} />
        </>
    );
}

TicketCreatePage.layout = (page: React.ReactNode) => page;
