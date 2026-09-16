export type WorkTypeOption =
    | 'Install Standart'
    | 'Install Bracket'
    | 'Penjelasan'
    | 'Service Minor'
    | 'Service Mayor'
    | 'Penambahan'
    | 'Lain-lain';

export interface ServiceTicket {
    id: number;
    notif_number: string;
    customer_name: string;
    customer_phone: string;
    customer_address?: string | null;
    unit_model: string;
    serial_number: string;
    service_date?: string | null;
    deadline?: string | null;
    status: 'berbayar' | 'tidak_berbayar';
    status_note: string | null;
    work_status: 'belum_selesai' | 'selesai';
    work_types: string[];
    other_work_text: string | null;
    mainwork_center: string;
    start_time: string | null;
    finish_time: string | null;
    visit_photo: string | null;
    completion_photo: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface TicketStats {
    total: number;
    complete_photos_count: number;
    berbayar_count: number;
    berbayar_percent: number;
    tidak_berbayar_count: number;
    tidak_berbayar_percent: number;
    center_counts: {
        pulogadung: number;
        moi: number;
        lain_lain: number;
    };
}

export interface TicketFilters {
    search: string;
    status: string;
    center: string;
    work_type: string;
    month?: string;
    sort: string;
}
