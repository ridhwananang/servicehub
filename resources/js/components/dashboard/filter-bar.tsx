import React from 'react';
import { Search, Download, Plus, Filter, Table as TableIcon, LayoutGrid, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    CENTER_OPTIONS,
    STATUS_OPTIONS,
    SORT_OPTIONS,
    WORK_TYPE_OPTIONS,
    formatMonthLabel,
} from '@/constants/ticket';
import type { ViewMode } from '@/hooks/use-ticket-filters';

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (value: string) => void;
    centerFilter: string;
    onCenterChange: (value: string) => void;
    workTypeFilter: string;
    onWorkTypeChange: (value: string) => void;
    monthFilter: string;
    onMonthChange: (value: string) => void;
    availableMonths: string[];
    sortOrder: string;
    onSortOrderChange: (value: string) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    filteredCount: number;
    onExport: () => void;
    onCreateNew: () => void;
}

export function FilterBar({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
    centerFilter,
    onCenterChange,
    workTypeFilter,
    onWorkTypeChange,
    monthFilter,
    onMonthChange,
    availableMonths = [],
    sortOrder,
    onSortOrderChange,
    viewMode,
    onViewModeChange,
    filteredCount,
    onExport,
    onCreateNew,
}: FilterBarProps) {
    const activeFilterCount = [
        statusFilter !== 'semua',
        centerFilter !== 'semua',
        workTypeFilter !== 'semua',
        monthFilter !== 'semua',
        sortOrder !== 'waktu_terbaru',
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        onMonthChange('semua');
        onStatusChange('semua');
        onCenterChange('semua');
        onWorkTypeChange('semua');
        onSortOrderChange('waktu_terbaru');
    };

    return (
        <section
            aria-label="Pencarian dan Filter Tiket Servis"
            className="rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/40 to-zinc-50/80 p-2.5 sm:p-3 shadow-xs dark:border-zinc-800/80 dark:bg-gradient-to-b dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-950/95 transition-all space-y-2.5"
        >
            {/* Top Tier: Search Input & Primary Action Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Input with accessible clear button */}
                <div className="relative flex-1 min-w-0">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari No Notif, Nama, HP, Alamat, Unit, SN..."
                        aria-label="Cari tiket"
                        className="h-9.5 rounded-xl pl-8.5 pr-8 text-xs font-medium border-slate-200 bg-slate-50/50 focus:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:focus:bg-slate-950 w-full"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            aria-label="Hapus kata kunci pencarian"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                            <X className="size-3" />
                        </button>
                    )}
                </div>

                {/* Primary Action Buttons (Download XLSX & Tambah Notif) */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Download Button */}
                    <Button
                        type="button"
                        onClick={onExport}
                        aria-label={`Unduh ${filteredCount} tiket ke file XLSX`}
                        title={`Unduh ${filteredCount} tiket ke file XLSX`}
                        className="h-9.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3 sm:px-3.5 flex items-center justify-center gap-1.5 shadow-xs shadow-emerald-600/20 cursor-pointer active:scale-95 transition-all flex-1 sm:flex-none"
                    >
                        <Download className="size-3.5 shrink-0" aria-hidden="true" />
                        <span>Download</span>
                        <span className="inline-flex rounded-md bg-emerald-700/90 px-1.5 py-0.2 text-[10px] font-bold">
                            {filteredCount}
                        </span>
                    </Button>

                    {/* Tambah Notif Button */}
                    <Button
                        type="button"
                        onClick={onCreateNew}
                        aria-label="Tambah Notif atau Tiket Servis Baru"
                        className="h-9.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-3 sm:px-4 flex items-center justify-center gap-1.5 shadow-xs shadow-red-600/20 cursor-pointer active:scale-95 transition-all flex-1 sm:flex-none"
                    >
                        <Plus className="size-4 shrink-0" aria-hidden="true" />
                        <span>Tambah Notif</span>
                    </Button>
                </div>
            </div>

            {/* Bottom Tier: Filter Dropdowns & View Switcher */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                {/* Left: Filter Controls (Fluid Wrap on Tablet/Desktop, Grid on Mobile) */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-0.5">
                        <Filter className="size-3 text-red-600 dark:text-red-400" />
                        <span>Filter:</span>
                    </span>

                    {/* 1. Month Filter */}
                    <select
                        aria-label="Filter bulan pengerjaan"
                        value={monthFilter}
                        onChange={(e) => onMonthChange(e.target.value)}
                        className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 flex-1 sm:flex-none cursor-pointer"
                    >
                        <option value="semua" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Semua Bulan</option>
                        {availableMonths.map((ym) => (
                            <option key={ym} value={ym} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                {formatMonthLabel(ym)}
                            </option>
                        ))}
                    </select>

                    {/* 2. Status Filter */}
                    <select
                        aria-label="Filter status tiket"
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 flex-1 sm:flex-none cursor-pointer"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* 3. Center Filter */}
                    <select
                        aria-label="Filter mainwork center"
                        value={centerFilter}
                        onChange={(e) => onCenterChange(e.target.value)}
                        className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 flex-1 sm:flex-none cursor-pointer"
                    >
                        {CENTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* 4. Pengerjaan Filter */}
                    <select
                        aria-label="Filter jenis pengerjaan"
                        value={workTypeFilter}
                        onChange={(e) => onWorkTypeChange(e.target.value)}
                        className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 flex-1 sm:flex-none cursor-pointer"
                    >
                        <option value="semua" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Semua Pengerjaan</option>
                        {WORK_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                {opt}
                            </option>
                        ))}
                    </select>

                    {/* 5. Sort Filter */}
                    <select
                        aria-label="Urutan penyortiran tiket"
                        value={sortOrder}
                        onChange={(e) => onSortOrderChange(e.target.value)}
                        className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 flex-1 sm:flex-none cursor-pointer"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* Reset Button (Visible when active) */}
                    {activeFilterCount > 0 && (
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            title="Reset semua filter ke default"
                            aria-label="Reset semua filter"
                            className="h-8.5 px-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-300 cursor-pointer shrink-0 transition-colors flex items-center gap-1 active:scale-95"
                        >
                            <X className="size-3" />
                            <span>Reset ({activeFilterCount})</span>
                        </button>
                    )}
                </div>

                {/* Right: View Switcher (Auto / Table / Cards) */}
                <div className="flex items-center justify-between lg:justify-end gap-2 shrink-0 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800/60">
                    <div
                        role="group"
                        aria-label="Pilihan tampilan data"
                        className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800 h-8.5"
                    >
                        <button
                            type="button"
                            onClick={() => onViewModeChange('table')}
                            title="Tampilan Tabel Lengkap"
                            aria-pressed={viewMode === 'table'}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                                viewMode === 'table'
                                    ? 'bg-white text-red-600 shadow-xs dark:bg-slate-700 dark:text-red-400 font-semibold'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                            }`}
                        >
                            <TableIcon className="size-3.5" aria-hidden="true" />
                            <span className="text-[11px]">Tabel</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onViewModeChange('cards')}
                            title="Tampilan Kartu Responsif"
                            aria-pressed={viewMode === 'cards'}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                                viewMode === 'cards'
                                    ? 'bg-white text-red-600 shadow-xs dark:bg-slate-700 dark:text-red-400 font-semibold'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                            }`}
                        >
                            <LayoutGrid className="size-3.5" aria-hidden="true" />
                            <span className="text-[11px]">Kartu</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onViewModeChange('auto')}
                            title="Tampilan Otomatis Sesuai Layar"
                            aria-pressed={viewMode === 'auto'}
                            className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                                viewMode === 'auto'
                                    ? 'bg-white text-red-600 shadow-xs dark:bg-slate-700 dark:text-red-400 font-semibold'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                            }`}
                        >
                            Auto
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
