import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Calendar, Clock, LogOut, Smartphone, Users, ZoomIn, ChevronDown, User as UserIcon, Camera, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLiveClock } from '@/hooks/use-live-clock';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { PwaInstallGuideDialog } from '@/components/pwa-install-guide-dialog';
import { AvatarPreviewDialog } from '@/components/avatar-preview-dialog';
import { LogoutDialog } from './logout-dialog';
import type { User } from '@/types';

interface HeaderNavProps {
    onExport?: () => void;
    onCreateNew?: () => void;
    userName?: string;
    userRole?: string;
}

export function HeaderNav({
    onExport,
    onCreateNew,
    userName,
    userRole,
}: HeaderNavProps) {
    const { currentDate, currentTime } = useLiveClock();
    const { auth } = usePage<{ auth?: { user?: User } }>().props;
    const { isInstallable, isInstalled, isIOS, promptInstall, markAsInstalled } = usePwaInstall();

    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isPwaGuideOpen, setIsPwaGuideOpen] = useState(false);
    const [isPreviewAvatarOpen, setIsPreviewAvatarOpen] = useState(false);

    const currentUser = auth?.user;
    const displayName = userName || currentUser?.name || 'Pengguna';
    const displayInitial = displayName.charAt(0).toUpperCase();

    // Determine actual role
    const effectiveRole = (currentUser?.role || userRole || 'teknisi').toLowerCase();
    const isAdmin = effectiveRole === 'admin';
    const roleLabel = isAdmin ? 'Admin' : 'Teknisi';
    const avatarUrl = currentUser?.avatar;

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
            <header
                role="banner"
                className="sticky top-0 z-40 w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-950 dark:via-red-900 dark:to-red-950 text-white shadow-lg shadow-red-950/20 border-b border-red-500/40 dark:border-red-800/60 backdrop-blur-md overflow-x-clip"
            >
                <div className="mx-auto flex h-14 sm:h-16 md:h-18 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2">
                    {/* Left: Branding */}
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <img
                            src="/icons/logo.png"
                            alt="Aquos Platinum"
                            className="h-8 sm:h-10 md:h-12 w-auto object-contain shrink-0 drop-shadow-md transition-transform hover:scale-105"
                        />
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-base sm:text-lg md:text-xl font-black tracking-tight text-white drop-shadow-xs truncate">
                                    Aquos Platinum
                                </span>
                                <span className="hidden md:inline-flex rounded-md bg-white/20 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-white border border-white/30 backdrop-blur-xs shrink-0">
                                    Pusat Servis & Notifikasi
                                </span>
                            </div>
                            <p className="hidden xs:block truncate text-[10px] sm:text-xs font-medium text-red-100">
                                Work Order & Pelaporan Teknisi Lapangan
                            </p>
                        </div>
                    </div>

                    {/* Center: Live Date & Clock Pill (Desktop) */}
                    <div
                        aria-label="Waktu sistem langsung"
                        className="hidden lg:flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs backdrop-blur-xs shrink-0"
                    >
                        <Calendar className="size-3.5 text-white/80" aria-hidden="true" />
                        <span>{currentDate || 'Memuat...'}</span>
                        <span className="text-white/40" aria-hidden="true">|</span>
                        <Clock className="size-3.5 text-white/80" aria-hidden="true" />
                        <span className="font-mono font-bold">{currentTime || '--:--:-- WIB'}</span>
                    </div>

                    {/* Right: Actions & User Profile */}
                    <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
                        {/* Theme Toggle Button */}
                        <ThemeToggle className="bg-white/15 hover:bg-white/25 border-white/25 text-white dark:bg-black/35 dark:hover:bg-black/50 dark:border-white/20 size-8 sm:size-9" />

                        {/* Admin Only: Kelola Pengguna button (Quick shortcut on tablet & desktop) */}
                        {isAdmin && (
                            <Button
                                variant="outline"
                                asChild
                                className="hidden sm:inline-flex items-center justify-center gap-1.5 border border-white/30 text-white bg-white/15 hover:bg-white/25 text-xs font-semibold h-9 px-3 rounded-xl shadow-xs cursor-pointer active:scale-95 backdrop-blur-xs shrink-0"
                                title="Kelola Pengguna & Hak Akses"
                            >
                                <Link href="/users">
                                    <Users className="size-3.5 text-white shrink-0" aria-hidden="true" />
                                    <span className="hidden md:inline">Kelola User</span>
                                    <span className="inline md:hidden">User</span>
                                </Link>
                            </Button>
                        )}

                        {/* Install Web App button (Quick shortcut on tablet & desktop) */}
                        {!isInstalled && (
                            <Button
                                variant="outline"
                                onClick={handleInstallClick}
                                aria-label="Install Aquos Platinum sebagai Aplikasi"
                                title="Install Aquos Platinum Web App"
                                className="hidden sm:inline-flex items-center justify-center gap-1.5 border border-white/30 text-white bg-white/15 hover:bg-white/25 text-xs font-semibold h-9 px-3 rounded-xl shadow-xs cursor-pointer active:scale-95 backdrop-blur-xs shrink-0"
                            >
                                <Smartphone className="size-3.5 text-white shrink-0" aria-hidden="true" />
                                <span className="hidden md:inline">Install App</span>
                                <span className="inline md:hidden">Install</span>
                            </Button>
                        )}

                        <div className="hidden sm:block h-5 w-px bg-white/20 shrink-0" aria-hidden="true" />

                        {/* Unified User Menu Trigger & Dropdown (Mobile & Desktop) */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button
                                    type="button"
                                    aria-label={`Menu pengguna ${displayName}`}
                                    className="flex items-center gap-1.5 sm:gap-2 rounded-full sm:rounded-2xl bg-white/15 hover:bg-white/25 border border-white/25 p-1 sm:px-2.5 sm:py-1.5 text-white shadow-xs backdrop-blur-xs transition-all cursor-pointer active:scale-95 group focus:outline-hidden focus:ring-2 focus:ring-white/40 shrink-0"
                                >
                                    {/* Avatar */}
                                    <div className="relative flex size-7.5 sm:size-8 items-center justify-center overflow-hidden rounded-full bg-white/20 font-bold text-xs text-white ring-2 ring-white/30 shrink-0">
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt={displayName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span>{displayInitial}</span>
                                        )}
                                    </div>

                                    {/* Name & Role (Hidden on mobile < sm, visible on tablet/desktop) */}
                                    <div className="hidden sm:flex flex-col text-left max-w-[100px] md:max-w-[140px] min-w-0">
                                        <span className="text-xs font-bold text-white leading-tight truncate">
                                            {displayName}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] text-red-100 leading-tight">
                                            <span className="truncate">{roleLabel}</span>
                                            <span
                                                className={`size-1.5 rounded-full shrink-0 ${
                                                    isAdmin ? 'bg-amber-300' : 'bg-emerald-400'
                                                }`}
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </div>

                                    {/* Dropdown Chevron */}
                                    <ChevronDown className="size-3.5 text-white/80 group-hover:text-white transition-transform group-data-[state=open]:rotate-180 shrink-0 pr-0.5 sm:pr-0" />
                                </button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                                align="end"
                                sideOffset={8}
                                className="w-72 rounded-2xl p-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl z-50 text-slate-800 dark:text-slate-100 overflow-hidden"
                            >
                                {/* Ruby Red Accent Glow Line */}
                                <div className="-mx-2 -mt-2 mb-2 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                                {/* User Info Card Header */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 mb-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsPreviewAvatarOpen(true)}
                                        title="Perbesar foto profil"
                                        className="relative size-10 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 ring-2 ring-red-500/20 shrink-0 cursor-pointer group hover:opacity-90 transition-opacity"
                                    >
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={displayName} className="size-full object-cover" />
                                        ) : (
                                            <span className="flex size-full items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200">
                                                {displayInitial}
                                            </span>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                                            <ZoomIn className="size-3 text-white" />
                                        </div>
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                            {displayName}
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                            {currentUser?.email || 'Akun Aktif'}
                                        </div>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span className={`size-1.5 rounded-full ${isAdmin ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                                {roleLabel}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-slate-800" />

                                {/* Menu Item: Profil & Pengaturan */}
                                <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 cursor-pointer text-xs font-semibold focus:bg-slate-100 dark:focus:bg-slate-800/80">
                                    <Link href="/settings/profile" className="flex items-center gap-2.5 w-full">
                                        <div className="size-7.5 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                            <UserIcon className="size-4" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-slate-900 dark:text-white block">Profil & Akun</span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Edit nama, email & ganti sandi</span>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>

                                {/* Admin Only: Kelola User */}
                                {isAdmin && (
                                    <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 cursor-pointer text-xs font-semibold focus:bg-slate-100 dark:focus:bg-slate-800/80">
                                        <Link href="/users" className="flex items-center gap-2.5 w-full">
                                            <div className="size-7.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                <Users className="size-4" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-bold text-slate-900 dark:text-white block">Kelola Pengguna</span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Hak akses admin & tambah teknisi</span>
                                            </div>
                                        </Link>
                                    </DropdownMenuItem>
                                )}

                                {/* Install App */}
                                {!isInstalled && (
                                    <DropdownMenuItem
                                        onClick={handleInstallClick}
                                        className="rounded-xl px-2.5 py-2 cursor-pointer text-xs font-semibold focus:bg-slate-100 dark:focus:bg-slate-800/80"
                                    >
                                        <div className="flex items-center gap-2.5 w-full">
                                            <div className="size-7.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                <Smartphone className="size-4" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-bold text-slate-900 dark:text-white block">Install Aplikasi</span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Pasang PWA di homescreen HP</span>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                )}

                                {/* Lihat Foto Profil */}
                                {avatarUrl && (
                                    <DropdownMenuItem
                                        onClick={() => setIsPreviewAvatarOpen(true)}
                                        className="rounded-xl px-2.5 py-2 cursor-pointer text-xs font-semibold focus:bg-slate-100 dark:focus:bg-slate-800/80"
                                    >
                                        <div className="flex items-center gap-2.5 w-full">
                                            <div className="size-7.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                <Camera className="size-4" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="font-bold text-slate-900 dark:text-white block">Lihat Foto Profil</span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-normal">Buka pratinjau resolusi penuh</span>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator className="my-1.5 bg-slate-100 dark:bg-slate-800" />

                                {/* Logout Item */}
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => setIsLogoutDialogOpen(true)}
                                    className="rounded-xl px-2.5 py-2 cursor-pointer text-xs font-semibold text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/40"
                                >
                                    <div className="flex items-center gap-2.5 w-full">
                                        <div className="size-7.5 rounded-lg bg-red-100 dark:bg-red-950/70 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                            <LogOut className="size-4" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold block">Keluar / Logout</span>
                                            <span className="text-[10px] text-red-500/80 dark:text-red-400/80 block font-normal">Akhiri sesi login akun ini</span>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile Sub-header for Live Clock */}
                <div
                    aria-label="Waktu sistem langsung di ponsel"
                    className="flex lg:hidden items-center justify-between border-t border-red-500/30 px-4 py-1.5 text-[11px] text-red-100 bg-red-700/70 dark:bg-red-950/70 backdrop-blur-xs"
                >
                    <span className="flex items-center gap-1">
                        <Calendar className="size-3 text-red-200" aria-hidden="true" />
                        {currentDate || 'Memuat...'}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                        <Clock className="size-3 text-red-200" aria-hidden="true" />
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
                onMarkInstalled={markAsInstalled}
            />

            {/* Modal Preview Foto Profil */}
            <AvatarPreviewDialog
                isOpen={isPreviewAvatarOpen}
                onClose={() => setIsPreviewAvatarOpen(false)}
                user={{
                    name: displayName,
                    email: currentUser?.email,
                    role: effectiveRole,
                    avatar: avatarUrl,
                }}
            />
        </>
    );
}
