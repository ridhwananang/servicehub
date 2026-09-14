import React, { useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { Toaster } from 'sonner';
import { TicketDialog } from '@/components/ticket-dialog';
import { PhotoPreviewDialog } from '@/components/photo-preview-dialog';
import {
    HeaderNav,
    StatsGrid,
    FilterBar,
    TicketCardsView,
    TicketTableView,
    DeleteTicketDialog,
} from '@/components/dashboard';
import { useTicketFilters } from '@/hooks/use-ticket-filters';
import type { ServiceTicket, TicketStats, TicketFilters } from '@/types';

interface DashboardProps {
    tickets: ServiceTicket[];
    stats: TicketStats;
    filters?: TicketFilters;
}

export default function Dashboard({
    tickets = [],
    stats = {
        total: 0,
        complete_photos_count: 0,
        berbayar_count: 0,
        berbayar_percent: 0,
        tidak_berbayar_count: 0,
        tidak_berbayar_percent: 0,
        center_counts: {
            pulogadung: 0,
            moi: 0,
            lain_lain: 0,
        },
    },
    filters,
}: DashboardProps) {
    // Modal states
    const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
    const [ticketToEdit, setTicketToEdit] = useState<ServiceTicket | null>(null);
    const [previewTicket, setPreviewTicket] = useState<ServiceTicket | null>(null);
    const [ticketToDelete, setTicketToDelete] = useState<ServiceTicket | null>(null);

    // Custom hook for debounced search, filtering, and responsive view state
    const {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        centerFilter,
        setCenterFilter,
        workTypeFilter,
        setWorkTypeFilter,
        monthFilter,
        setMonthFilter,
        availableMonths,
        sortOrder,
        setSortOrder,
        viewMode,
        setViewMode,
        filteredTickets,
    } = useTicketFilters({
        tickets,
        initialSearch: filters?.search || '',
        initialStatus: filters?.status || 'semua',
        initialCenter: filters?.center || 'semua',
        initialWorkType: filters?.work_type || 'semua',
        initialMonth: filters?.month || 'semua',
        initialSort: filters?.sort || 'waktu_terbaru',
    });

    const handleCreateNew = useCallback(() => {
        setTicketToEdit(null);
        setIsTicketDialogOpen(true);
    }, []);

    const handleEdit = useCallback((ticket: ServiceTicket) => {
        setTicketToEdit(ticket);
        setIsTicketDialogOpen(true);
    }, []);

    const handleDelete = useCallback((ticket: ServiceTicket) => {
        setTicketToDelete(ticket);
    }, []);

    const handleExport = useCallback(() => {
        const params = new URLSearchParams();
        if (monthFilter && monthFilter !== 'semua') {
            params.set('month', monthFilter);
        }
        if (statusFilter && statusFilter !== 'semua') {
            params.set('status', statusFilter);
        }
        if (centerFilter && centerFilter !== 'semua') {
            params.set('center', centerFilter);
        }
        if (workTypeFilter && workTypeFilter !== 'semua') {
            params.set('work_type', workTypeFilter);
        }
        if (searchQuery) {
            params.set('search', searchQuery);
        }
        const queryString = params.toString();
        window.location.href = `/tickets/export${queryString ? '?' + queryString : ''}`;
    }, [monthFilter, statusFilter, centerFilter, workTypeFilter, searchQuery]);

    const handlePreviewPhotos = useCallback((ticket: ServiceTicket) => {
        setPreviewTicket(ticket);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100">
            <Head title="ServisHub - Dashboard Tiket Servis & Pengerjaan" />
            <Toaster position="top-right" richColors />

            {/* Standalone Header Nav */}
            <HeaderNav
                onExport={handleExport}
                onCreateNew={handleCreateNew}
            />

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl px-3.5 py-4 sm:px-6 sm:py-7 lg:px-8 space-y-4 sm:space-y-6">
                {/* Page Title & Service Center Meta */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Dashboard Tiket Servis & Pengerjaan
                        </h1>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                            Pencatatan Notif (Unique), status berbayar/tidak berbayar, jam kunjungan, dan foto dokumentasi.
                        </p>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right pt-0.5 sm:pt-0">
                        <span>Service Center: </span>
                        <strong className="font-bold text-slate-800 dark:text-slate-200">Pulogadung & MOI</strong>
                    </div>
                </div>

                {/* 4 Summary Stats Cards */}
                <StatsGrid stats={stats} />

                {/* Filter & Action Bar */}
                <FilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    centerFilter={centerFilter}
                    onCenterChange={setCenterFilter}
                    workTypeFilter={workTypeFilter}
                    onWorkTypeChange={setWorkTypeFilter}
                    monthFilter={monthFilter}
                    onMonthChange={setMonthFilter}
                    availableMonths={availableMonths}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    filteredCount={filteredTickets.length}
                    onExport={handleExport}
                    onCreateNew={handleCreateNew}
                />

                {/* Responsive Mobile Cards View */}
                <TicketCardsView
                    tickets={filteredTickets}
                    viewMode={viewMode}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreviewPhotos={handlePreviewPhotos}
                />

                {/* Desktop Full Table View */}
                <TicketTableView
                    tickets={filteredTickets}
                    viewMode={viewMode}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreviewPhotos={handlePreviewPhotos}
                />
            </main>

            {/* Create / Edit Ticket Modal */}
            <TicketDialog
                isOpen={isTicketDialogOpen}
                onClose={() => setIsTicketDialogOpen(false)}
                ticketToEdit={ticketToEdit}
            />

            {/* Photo Preview Lightbox */}
            <PhotoPreviewDialog
                isOpen={Boolean(previewTicket)}
                onClose={() => setPreviewTicket(null)}
                ticket={previewTicket}
            />

            {/* Delete Ticket Confirmation Modal */}
            <DeleteTicketDialog
                ticket={ticketToDelete}
                onClose={() => setTicketToDelete(null)}
            />
        </div>
    );
}

// Bypass default sidebar/double header layout
Dashboard.layout = (page: React.ReactNode) => page;
