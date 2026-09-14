import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Wrench, Calendar, Clock, Download, Plus, LogOut, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiveClock } from '@/hooks/use-live-clock';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { PwaInstallGuideDialog } from '@/components/pwa-install-guide-dialog';
import { LogoutDialog } from './logout-dialog';
import type { User } from '@/types';

interface HeaderNavProps {
    onExport: () => void;
    onCreateNew: () => void;
    userName?: string;
    userRole?: string;
}

export function HeaderNav({
    onExport,
    onCreateNew,
    userName,
    userRole = 'Admin',
}: HeaderNavProps) {
    const { currentDate, currentTime } = useLiveClock();
    const { auth } = usePage<{ auth?: { user?: User } }>().props;
    const { isInstallable, isInstalled, isIOS, promptInstall } = usePwaInstall();

    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isPwaGuideOpen, setIsPwaGuideOpen] = useState(false);

    const displayName = userName || auth?.user?.name || 'Siti Rahmawati';
    const displayInitial = displayName.charAt(0).toUpperCase();

    const handleInstallClick = async () => {
        if (isInstallable) {
            const ok = await promptInstall();
            if (!ok) setIsPwaGuideOpen(true);
        } else {
            setIsPwaGuideOpen(true);
        }
    };

    return (
        <>
            <header role="banner" className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
                <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
                    {/* Left: Branding */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div
                            className="flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20 text-white"
                            aria-hidden="true"
                        >
                            <Wrench className="size-5 sm:size-6 -rotate-45" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                    ServisHub
                                </span>
                                <span className="hidden xs:inline-flex rounded-md bg-indigo-50 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-indigo-700 border border-indigo-200/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800">
                                    Pusat Servis & Notifikasi
                                </span>
                            </div>
                            <p className="truncate text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                                Work Order & Pelaporan Teknisi Lapangan
                            </p>
                        </div>
                    </div>

                    {/* Center: Live Date & Clock Pill (Desktop) */}
                    <div
                        aria-label="Waktu sistem langsung"
                        className="hidden xl:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                    >
                        <Calendar className="size-3.5 text-slate-400" aria-hidden="true" />
                        <span>{currentDate || 'Memuat...'}</span>
                        <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">|</span>
                        <Clock className="size-3.5 text-slate-400" aria-hidden="true" />
                        <span className="font-mono">{currentTime || '--:--:-- WIB'}</span>
                    </div>

                    {/* Right: Actions & User Profile */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
                        {/* Install Web App button if not already in standalone mode */}
                        {!isInstalled && (
                            <Button
                                variant="outline"
                                onClick={handleInstallClick}
                                aria-label="Install ServisHub sebagai Aplikasi"
                                title="Install ServisHub Web App"
                                className="flex items-center gap-1 sm:gap-1.5 border-indigo-200/80 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40 text-xs font-semibold h-8 sm:h-9 rounded-lg px-2 sm:px-3 shadow-2xs cursor-pointer active:scale-95"
                            >
                                <Smartphone className="size-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                                <span className="hidden sm:inline">Install App</span>
                                <span className="hidden xs:inline sm:hidden">Install</span>
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={onExport}
                            aria-label="Unduh data tiket dalam format XLSX"
                            className="hidden md:flex items-center gap-1.5 border-emerald-500/80 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-600 dark:text-emerald-400 dark:hover:bg-emerald-950/40 text-xs font-semibold h-8 sm:h-9 rounded-lg px-2.5 sm:px-3.5 shadow-2xs cursor-pointer"
                        >
                            <Download className="size-3.5 sm:size-4 text-emerald-600 shrink-0" aria-hidden="true" />
                            <span>Download (XLSX)</span>
                        </Button>

                        <Button
                            onClick={onCreateNew}
                            aria-label="Tambah tiket servis baru"
                            className="flex items-center gap-1 sm:gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-8 sm:h-9 rounded-lg px-2 sm:px-3.5 shadow-xs shadow-indigo-600/25 cursor-pointer active:scale-95"
                        >
                            <Plus className="size-3.5 sm:size-4 shrink-0" aria-hidden="true" />
                            <span className="hidden xs:inline">Tambah</span>
                            <span className="xs:hidden">+</span>
                        </Button>

                        <div className="h-5 sm:h-6 w-px bg-slate-200 dark:bg-slate-800" aria-hidden="true" />

                        {/* User Profile */}
                        <div className="flex items-center gap-2" role="region" aria-label="Informasi Pengguna">
                            <div
                                aria-label={`Inisial pengguna ${displayName}`}
                                className="flex size-8 sm:size-9 items-center justify-center rounded-full bg-slate-100 font-bold text-xs sm:text-sm text-slate-700 ring-2 ring-slate-200/70 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 select-none"
                            >
                                {displayInitial}
                            </div>
                            <div className="hidden lg:block text-left">
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                    {displayName}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                    <span>{userRole}</span>
                                    <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLogoutDialogOpen(true)}
                                aria-label="Keluar dari sistem"
                                title="Keluar / Logout"
                                className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                            >
                                <LogOut className="size-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Sub-header for Live Clock */}
                <div
                    aria-label="Waktu sistem langsung di ponsel"
                    className="flex xl:hidden items-center justify-between border-t border-slate-100 px-4 py-1.5 text-[11px] text-slate-500 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50"
                >
                    <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-slate-400" aria-hidden="true" />
                        {currentDate || 'Memuat...'}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                        <Clock className="size-3 text-slate-400" aria-hidden="true" />
                        {currentTime || '--:--:-- WIB'}
                    </span>
                </div>
            </header>

            {/* Modal Konfirmasi Logout */}
            <LogoutDialog
                isOpen={isLogoutDialogOpen}
                onClose={() => setIsLogoutDialogOpen(false)}
                displayName={displayName}
            />

            {/* Modal Panduan Install PWA Web App */}
            <PwaInstallGuideDialog
                isOpen={isPwaGuideOpen}
                onClose={() => setIsPwaGuideOpen(false)}
                isIOS={isIOS}
            />
        </>
    );
}
