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
    return (
        <section
            aria-label="Pencarian dan Filter Tiket Servis"
            className="space-y-3 rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
        >
            {/* Top Row: Search Input & Primary Action Buttons */}
            <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                {/* Search Input with accessible clear button */}
                <div className="relative flex-1">
                    <Search
                        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Cari No Notif, Nama, Alamat, No Seri, HP..."
                        aria-label="Cari tiket berdasarkan No Notif, Nama Pelanggan, Alamat, atau No Seri"
                        className="h-10 sm:h-11 rounded-xl pl-10 pr-9 text-xs font-medium border-slate-200 bg-slate-50/50 focus:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:focus:bg-slate-950"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            aria-label="Hapus kata kunci pencarian"
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                {/* Buttons (Responsive: 2-columns grid on mobile, flex on desktop) */}
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 shrink-0">
                    <Button
                        type="button"
                        onClick={onExport}
                        aria-label={`Unduh ${filteredCount} tiket ke file XLSX`}
                        className="h-10 sm:h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-2.5 sm:px-4 flex items-center justify-center gap-1.5 shadow-xs shadow-emerald-600/20 cursor-pointer"
                    >
                        <Download className="size-3.5 sm:size-4 shrink-0" aria-hidden="true" />
                        <span className="hidden xs:inline truncate">Download (XLSX)</span>
                        <span className="xs:hidden truncate">Download</span>
                        <span className="hidden sm:inline-flex rounded-md bg-emerald-700/80 px-1 py-0.2 text-[10px] font-bold">
                            {filteredCount}
                        </span>
                    </Button>

                    <Button
                        type="button"
                        onClick={onCreateNew}
                        aria-label="Tambah Notif atau Tiket Servis Baru"
                        className="h-10 sm:h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-2.5 sm:px-4 flex items-center justify-center gap-1.5 shadow-xs shadow-indigo-600/20 cursor-pointer"
                    >
                        <Plus className="size-3.5 sm:size-4 shrink-0" aria-hidden="true" />
                        <span className="hidden xs:inline truncate">Tambah Notif</span>
                        <span className="xs:hidden truncate">Tambah</span>
                    </Button>
                </div>
            </div>

            {/* Bottom Row: Secondary Filter Dropdowns & View Switcher */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-100 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800/80">
                {/* Dropdown Filters (Responsive grid on mobile/tablet, flex-wrap on desktop) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-2">
                    <span className="hidden lg:flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Filter className="size-3.5" aria-hidden="true" />
                        Filter:
                    </span>

                    {/* Month Filter */}
                    <select
                        aria-label="Filter bulan pengerjaan"
                        value={monthFilter}
                        onChange={(e) => onMonthChange(e.target.value)}
                        className="h-8 sm:h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full lg:w-auto font-sans"
                    >
                        <option value="semua">Bulan: Semua</option>
                        {availableMonths.map((ym) => (
                            <option key={ym} value={ym}>
                                Bulan: {formatMonthLabel(ym)}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        aria-label="Filter status tiket"
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="h-8 sm:h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full lg:w-auto"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* Center Filter */}
                    <select
                        aria-label="Filter mainwork center"
                        value={centerFilter}
                        onChange={(e) => onCenterChange(e.target.value)}
                        className="h-8 sm:h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full lg:w-auto"
                    >
                        {CENTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* Pengerjaan Filter */}
                    <select
                        aria-label="Filter jenis pengerjaan"
                        value={workTypeFilter}
                        onChange={(e) => onWorkTypeChange(e.target.value)}
                        className="h-8 sm:h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full lg:w-auto"
                    >
                        <option value="semua">Pengerjaan: Semua</option>
                        {WORK_TYPE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>

                    {/* Sort Filter - spans 2 cols on mobile for balanced grid */}
                    <select
                        aria-label="Urutan penyortiran tiket"
                        value={sortOrder}
                        onChange={(e) => onSortOrderChange(e.target.value)}
                        className="h-8 sm:h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 w-full col-span-2 sm:col-span-1 lg:col-auto"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* View Switcher & Counter */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 lg:pt-0 border-t border-slate-100 dark:border-slate-800/80 lg:border-t-0">
                    {/* View Switcher: Auto / Table / Cards */}
                    <div
                        role="group"
                        aria-label="Pilihan tampilan data"
                        className="flex items-center rounded-lg border border-slate-200 p-0.5 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800"
                    >
                        <button
                            type="button"
                            onClick={() => onViewModeChange('table')}
                            title="Tampilan Tabel Lengkap"
                            aria-pressed={viewMode === 'table'}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all cursor-pointer ${
                                viewMode === 'table'
                                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                            }`}
                        >
                            <TableIcon className="size-3.5" aria-hidden="true" />
                            <span className="hidden sm:inline">Tabel</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onViewModeChange('cards')}
                            title="Tampilan Kartu Responsif"
                            aria-pressed={viewMode === 'cards'}
                            className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all cursor-pointer ${
                                viewMode === 'cards'
                                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                            }`}
                        >
                            <LayoutGrid className="size-3.5" aria-hidden="true" />
                            <span className="hidden sm:inline">Kartu</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onViewModeChange('auto')}
                            title="Tampilan Otomatis (Kartu di HP, Tabel di Desktop)"
                            aria-pressed={viewMode === 'auto'}
                            className={`rounded-md px-2 py-1 text-xs font-medium transition-all cursor-pointer ${
                                viewMode === 'auto'
                                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                            }`}
                        >
                            Auto
                        </button>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                        <strong className="font-semibold text-slate-800 dark:text-slate-200">{filteredCount}</strong> tiket
                    </div>
                </div>
            </div>
        </section>
    );
}
