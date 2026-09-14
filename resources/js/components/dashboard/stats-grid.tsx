import React from 'react';
import { FileText, Camera, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import type { TicketStats } from '@/types';

interface StatsGridProps {
    stats: TicketStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <section aria-label="Ringkasan Statistik Tiket Servis">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
                {/* Card 1: Total Notif */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/50 via-white to-white p-3 sm:p-4 lg:p-5 shadow-xs dark:border-indigo-900/50 dark:from-slate-900 dark:to-slate-900 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Total Notif
                            </span>
                            <div
                                aria-hidden="true"
                                className="flex size-6 sm:size-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 shrink-0"
                            >
                                <FileText className="size-3.5 sm:size-4" />
                            </div>
                        </div>
                        <div
                            aria-label={`Total notif ${stats.total}`}
                            className="mt-1 sm:mt-2 text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white"
                        >
                            {stats.total}
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3 flex items-center gap-1 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 leading-tight">
                        <Camera className="size-3 sm:size-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                        <span className="truncate">{stats.complete_photos_count} foto lengkap</span>
                    </div>
                </div>

                {/* Card 2: Status Berbayar */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-blue-200/70 bg-white p-3 sm:p-4 lg:p-5 shadow-xs dark:border-blue-900/50 dark:bg-slate-900 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Berbayar
                            </span>
                            <div
                                aria-hidden="true"
                                className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 shrink-0"
                            >
                                <CheckCircle2 className="size-3.5 sm:size-4" />
                            </div>
                        </div>
                        <div
                            aria-label={`Tiket berbayar ${stats.berbayar_count}`}
                            className="mt-1 sm:mt-2 text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-600 dark:text-blue-400"
                        >
                            {stats.berbayar_count}
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-medium text-blue-600 dark:text-blue-400 truncate">
                        {stats.berbayar_percent}% dari total
                    </div>
                </div>

                {/* Card 3: Status Tidak Berbayar */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-amber-200/70 bg-white p-3 sm:p-4 lg:p-5 shadow-xs dark:border-amber-900/50 dark:bg-slate-900 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Tidak Berbayar
                            </span>
                            <div
                                aria-hidden="true"
                                className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 shrink-0"
                            >
                                <XCircle className="size-3.5 sm:size-4" />
                            </div>
                        </div>
                        <div
                            aria-label={`Tiket tidak berbayar ${stats.tidak_berbayar_count}`}
                            className="mt-1 sm:mt-2 text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white"
                        >
                            {stats.tidak_berbayar_count}
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-medium text-amber-600 dark:text-amber-400 truncate">
                        Garansi ({stats.tidak_berbayar_percent}%)
                    </div>
                </div>

                {/* Card 4: Mainwork Center */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-purple-200/70 bg-white p-3 sm:p-4 lg:p-5 shadow-xs dark:border-purple-900/50 dark:bg-slate-900 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Center
                        </span>
                        <div
                            aria-hidden="true"
                            className="flex size-6 sm:size-7 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 shrink-0"
                        >
                            <Building2 className="size-3.5 sm:size-4" />
                        </div>
                    </div>
                    <div className="mt-1 sm:mt-2 space-y-0.5 text-[10px] sm:text-[11px]" aria-label="Distribusi per mainwork center">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Pulo:</span>
                            <strong className="font-bold text-slate-900 dark:text-white">{stats.center_counts.pulogadung}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>MOI:</span>
                            <strong className="font-bold text-slate-900 dark:text-white">{stats.center_counts.moi}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Lain:</span>
                            <strong className="font-bold text-slate-900 dark:text-white">{stats.center_counts.lain_lain}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
