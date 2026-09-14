import { useState, useMemo, useEffect } from 'react';
import type { ServiceTicket } from '@/types';

export type ViewMode = 'auto' | 'table' | 'cards';

interface UseTicketFiltersOptions {
    tickets: ServiceTicket[];
    initialSearch?: string;
    initialStatus?: string;
    initialCenter?: string;
    initialWorkType?: string;
    initialMonth?: string;
    initialSort?: string;
}

export function useTicketFilters({
    tickets = [],
    initialSearch = '',
    initialStatus = 'semua',
    initialCenter = 'semua',
    initialWorkType = 'semua',
    initialMonth = 'semua',
    initialSort = 'waktu_terbaru',
}: UseTicketFiltersOptions) {
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [centerFilter, setCenterFilter] = useState(initialCenter);
    const [workTypeFilter, setWorkTypeFilter] = useState(initialWorkType);
    const [monthFilter, setMonthFilter] = useState(initialMonth);
    const [sortOrder, setSortOrder] = useState(initialSort);

    // Responsive view mode state: persisted in localStorage if available
    const [viewMode, setViewMode] = useState<ViewMode>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('servishub_view_mode') as ViewMode | null;
            if (saved && (saved === 'auto' || saved === 'table' || saved === 'cards')) {
                return saved;
            }
        }
        return 'auto';
    });

    const handleSetViewMode = (mode: ViewMode) => {
        setViewMode(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('servishub_view_mode', mode);
        }
    };

    // Debounce search query to optimize performance on large ticket datasets
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 200);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Extract available distinct months (YYYY-MM) dynamically from tickets dataset + current date
    const availableMonths = useMemo(() => {
        const monthSet = new Set<string>();

        // Always include current month
        const now = new Date();
        const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        monthSet.add(currentYearMonth);

        // Add months from tickets
        tickets.forEach((t) => {
            const dateStr = t.service_date || t.created_at;
            if (dateStr && dateStr.length >= 7) {
                monthSet.add(dateStr.slice(0, 7));
            }
        });

        // Return array sorted descending (newest month first)
        return Array.from(monthSet).sort().reverse();
    }, [tickets]);

    const filteredTickets = useMemo(() => {
        const query = debouncedSearch.trim().toLowerCase();

        return tickets
            .filter((ticket) => {
                // Search query match
                if (query) {
                    const matchNotif = ticket.notif_number?.toLowerCase().includes(query);
                    const matchName = ticket.customer_name?.toLowerCase().includes(query);
                    const matchPhone = ticket.customer_phone?.toLowerCase().includes(query);
                    const matchAddress = ticket.customer_address?.toLowerCase().includes(query);
                    const matchModel = ticket.unit_model?.toLowerCase().includes(query);
                    const matchSN = ticket.serial_number?.toLowerCase().includes(query);
                    if (!matchNotif && !matchName && !matchPhone && !matchAddress && !matchModel && !matchSN) {
                        return false;
                    }
                }

                // Status match
                if (statusFilter !== 'semua' && ticket.status !== statusFilter) {
                    return false;
                }

                // Center match
                if (centerFilter !== 'semua') {
                    if (centerFilter === 'Lain-lain') {
                        if (ticket.mainwork_center === 'Pulogadung' || ticket.mainwork_center === 'MOI') {
                            return false;
                        }
                    } else if (ticket.mainwork_center !== centerFilter) {
                        return false;
                    }
                }

                // Work Type match
                if (workTypeFilter !== 'semua') {
                    if (!ticket.work_types || !ticket.work_types.includes(workTypeFilter)) {
                        return false;
                    }
                }

                // Month match (checks service_date or created_at prefix YYYY-MM)
                if (monthFilter !== 'semua') {
                    const dateStr = ticket.service_date || ticket.created_at;
                    if (!dateStr || !dateStr.startsWith(monthFilter)) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                const dateA = a.service_date ? new Date(a.service_date).getTime() : new Date(a.created_at).getTime();
                const dateB = b.service_date ? new Date(b.service_date).getTime() : new Date(b.created_at).getTime();

                if (sortOrder === 'waktu_terlama') {
                    return dateA - dateB;
                }
                if (sortOrder === 'notif_asc') {
                    return a.notif_number.localeCompare(b.notif_number);
                }
                // Default waktu_terbaru
                return dateB - dateA;
            });
    }, [tickets, debouncedSearch, statusFilter, centerFilter, workTypeFilter, monthFilter, sortOrder]);

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('semua');
        setCenterFilter('semua');
        setWorkTypeFilter('semua');
        setMonthFilter('semua');
        setSortOrder('waktu_terbaru');
    };

    return {
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
        setViewMode: handleSetViewMode,
        filteredTickets,
        resetFilters,
    };
}
