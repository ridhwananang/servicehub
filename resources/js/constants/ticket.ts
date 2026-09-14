import type { WorkTypeOption } from '@/types';

export const WORK_TYPE_OPTIONS: WorkTypeOption[] = [
    'Install Standart',
    'Install Bracket',
    'Penjelasan',
    'Service Minor',
    'Service Mayor',
    'Penambahan',
    'Lain-lain',
];

export const CENTER_OPTIONS = [
    { value: 'semua', label: 'Center: Semua' },
    { value: 'Pulogadung', label: 'Center: Pulogadung' },
    { value: 'MOI', label: 'Center: MOI' },
    { value: 'Lain-lain', label: 'Center: Lain-lain' },
] as const;

export const STATUS_OPTIONS = [
    { value: 'semua', label: 'Status: Semua' },
    { value: 'berbayar', label: 'Status: Berbayar' },
    { value: 'tidak_berbayar', label: 'Status: Tidak Berbayar' },
] as const;

export const SORT_OPTIONS = [
    { value: 'waktu_terbaru', label: 'Urutan: Tanggal Terbaru' },
    { value: 'waktu_terlama', label: 'Urutan: Tanggal Terlama' },
    { value: 'notif_asc', label: 'Urutan: No Notif (A-Z)' },
] as const;

export const INDONESIAN_MONTHS = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
] as const;

export function formatMonthLabel(yearMonth: string): string {
    const parts = yearMonth.split('-');
    if (parts.length < 2) return yearMonth;
    const [year, month] = parts;
    const mIdx = parseInt(month, 10) - 1;
    if (mIdx >= 0 && mIdx < 12) {
        return `${INDONESIAN_MONTHS[mIdx]} ${year}`;
    }
    return yearMonth;
}
