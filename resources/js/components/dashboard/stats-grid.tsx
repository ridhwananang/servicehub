import React from 'react';
import { FileText, Camera, CheckCircle2, XCircle, Building2 } from 'lucide-react';
import type { TicketStats } from '@/types';

interface StatsGridProps {
    stats: TicketStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <section aria-label="Ringkasan Statistik Tiket Servis">
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 md:grid-cols-4 lg:gap-4">
                {/* Card 1: Total Notif (Crimson Red / Ruby Gradient) */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50/90 via-white to-rose-50/50 p-3 sm:p-4 lg:p-5 shadow-xs shadow-red-950/5 dark:border-red-900/50 dark:bg-gradient-to-br dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-red-950/35 dark:shadow-black/60 flex flex-col justify-between transition-all hover:shadow-md">
                    {/* Glowing Top Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Total Notif
                            </span>
                            <div
                                aria-hidden="true"
                                className="flex size-6 sm:size-7 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400 border border-red-200/60 dark:border-red-800/60 shrink-0 shadow-2xs"
                            >
                                <FileText className="size-3.5 sm:size-4" />
                            </div>
                        </div>
                        <div
                            aria-label={`Total notif ${stats.total}`}
                            className="mt-1 sm:mt-2 text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 dark:text-white"
                        >
                            {stats.total}
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3 flex items-center gap-1.5 text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                        <Camera className="size-3 sm:size-3.5 text-red-500 dark:text-red-400 shrink-0" aria-hidden="true" />
                        <span className="truncate">{stats.complete_photos_count} foto lengkap</span>
                    </div>
                </div>

                {/* Card 2: Status Berbayar (Sapphire Blue Gradient) */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-white to-sky-50/50 p-3 sm:p-4 lg:p-5 shadow-xs shadow-blue-950/5 dark:border-blue-900/50 dark:bg-gradient-to-br dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-blue-950/35 dark:shadow-black/60 flex flex-col justify-between transition-all hover:shadow-md">
                    {/* Glowing Top Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600" />

                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Berbayar
                            </span>
                            <div
                                aria-hidden="true"
                                className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shrink-0 shadow-2xs"
                            >
                                <CheckCircle2 className="size-3.5 sm:size-4" />
                            </div>
                        </div>
                        <div
                            aria-label={`Tiket berbayar ${stats.berbayar_count}`}
                            className="mt-1 sm:mt-2 text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black text-blue-600 dark:text-blue-400"
                        >
                            {stats.berbayar_count}
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-semibold text-blue-700 dark:text-blue-300 truncate">
                        {stats.berbayar_percent}% dari total
                    </div>
                </div>

                {/* Card 3: Status Tidak Berbayar (Amber / Warm Gold Gradient) */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-yellow-50/50 p-3 sm:p-4 lg:p-5 shadow-xs shadow-amber-950/5 dark:border-amber-900/50 dark:bg-gradient-to-br dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-amber-950/35 dark:shadow-black/60 flex flex-col justify-between transition-all hover:shadow-md">
                    {/* Glowing Top Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600" />

                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Tidak Berbayar
                            </span>
                            <div
                                aria-hidden="true"
                                className="flex size-6 sm:size-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 shrink-0 shadow-2xs"
                            >
                                <XCircle className="size-3.5 sm:size-4" />
                            </div>
                        </div>
                        <div
                            aria-label={`Tiket tidak berbayar ${stats.tidak_berbayar_count}`}
                            className="mt-1 sm:mt-2 text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 dark:text-white"
                        >
                            {stats.tidak_berbayar_count}
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs font-semibold text-amber-700 dark:text-amber-400 truncate">
                        Garansi ({stats.tidak_berbayar_percent}%)
                    </div>
                </div>

                {/* Card 4: Mainwork Center (Purple / Violet Gradient) */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/90 via-white to-violet-50/50 p-3 sm:p-4 lg:p-5 shadow-xs shadow-purple-950/5 dark:border-purple-900/50 dark:bg-gradient-to-br dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-purple-950/35 dark:shadow-black/60 flex flex-col justify-between transition-all hover:shadow-md">
                    {/* Glowing Top Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-600 via-violet-500 to-purple-600" />

                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Center
                            </span>
                            <div
                                aria-hidden="true"
                                className="flex size-6 sm:size-7 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-950/80 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 shrink-0 shadow-2xs"
                            >
                                <Building2 className="size-3.5 sm:size-4" />
                            </div>
                        </div>
                        <div
                            aria-label={`Distribusi center total ${stats.center_counts.pulogadung + stats.center_counts.moi + stats.center_counts.lain_lain}`}
                            className="mt-1 sm:mt-2 text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black text-purple-600 dark:text-purple-400"
                        >
                            {stats.center_counts.pulogadung + stats.center_counts.moi + stats.center_counts.lain_lain}
                        </div>
                    </div>
                    <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] sm:text-xs font-semibold text-purple-700 dark:text-purple-300">
                        <span>Pulo: {stats.center_counts.pulogadung}</span>
                        <span>&bull;</span>
                        <span>MOI: {stats.center_counts.moi}</span>
                        {stats.center_counts.lain_lain > 0 && (
                            <>
                                <span>&bull;</span>
                                <span>Lain: {stats.center_counts.lain_lain}</span>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
}
