import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Download,
    Building2,
    ShieldCheck,
    Sparkles,
    CheckCircle2,
    Camera,
    Phone,
    Clock,
    FileSpreadsheet,
    Smartphone,
    ExternalLink,
    Maximize2,
    Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { usePwaInstall } from '@/hooks/use-pwa-install';
import { PwaInstallGuideDialog } from '@/components/pwa-install-guide-dialog';
import type { User } from '@/types';

const SAMPLE_TICKETS = [
    {
        id: 'NTF-2026-0901',
        tabLabel: '0901 - TV OLED',
        center: 'Pulogadung',
        status: 'berbayar',
        statusLabel: 'Berbayar',
        customer: 'Budi Santoso',
        phone: '0812-3456-7890',
        unit: 'Smart TV 55 Inch OLED',
        sn: 'OLED55-88231',
        works: ['Install Bracket', 'Penjelasan Unit'],
        time: '08:30 - 10:00 WIB',
        photoStatus: '2 Foto Lengkap',
        visitPhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        completionPhoto: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
        notes: 'Pemasangan bracket dinding di ruang keluarga lantai 2.',
        origSize: '4.8 MB',
        compressedSize: '340 KB (-93%)',
    },
    {
        id: 'NTF-2026-0902',
        tabLabel: '0902 - AC Inverter',
        center: 'Pulogadung',
        status: 'berbayar',
        statusLabel: 'Berbayar',
        customer: 'Hendro Wijaya',
        phone: '0813-9876-5432',
        unit: 'AC Inverter 1.5 PK',
        sn: 'ACINV-77123',
        works: ['Service Mayor'],
        time: '10:15 - 12:00 WIB',
        photoStatus: '2 Foto Lengkap',
        visitPhoto: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
        completionPhoto: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
        notes: 'Overhaul kompresor dan penggantian freon R32.',
        origSize: '5.2 MB',
        compressedSize: '295 KB (-94%)',
    },
    {
        id: 'NTF-2026-0903',
        tabLabel: '0903 - Kulkas MOI',
        center: 'MOI',
        status: 'garansi',
        statusLabel: 'Garansi',
        customer: 'Diana Lestari',
        phone: '0857-1234-9988',
        unit: 'Kulkas Side by Side 4 Pintu',
        sn: 'REF-SBS-44091',
        works: ['Perbaikan Modul', 'Check Evaporator'],
        time: '13:00 - 14:45 WIB',
        photoStatus: '2 Foto Lengkap',
        visitPhoto: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
        completionPhoto: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
        notes: 'Penggantian relay modul kelistrikan inverter kompresor.',
        origSize: '3.9 MB',
        compressedSize: '310 KB (-92%)',
    },
];

export default function Welcome() {
    const { auth } = usePage<{ auth?: { user?: User } }>().props;
    const user = auth?.user;

    const { isInstallable, isInstalled, isIOS, promptInstall, markAsInstalled } = usePwaInstall();
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [activeTicketIdx, setActiveTicketIdx] = useState(0);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [activeFeatureTip, setActiveFeatureTip] = useState<string | null>(null);

    const currentTicket = SAMPLE_TICKETS[activeTicketIdx];

    const handleInstallClick = async () => {
        if (isInstallable) {
            const installed = await promptInstall();
            if (!installed) {
                setIsGuideOpen(true);
            }
        } else {
            setIsGuideOpen(true);
        }
    };

    const handlePillClick = (type: string) => {
        switch (type) {
            case 'notif':
                setActiveFeatureTip('Format nomor notifikasi otomatis unik (NTF-YYYY-XXXX) per tiket.');
                break;
            case 'photo':
                setIsPhotoModalOpen(true);
                break;
            case 'center':
                // Toggle between Pulogadung (idx 0) and MOI (idx 2)
                setActiveTicketIdx((prev) => (prev === 2 ? 0 : 2));
                setActiveFeatureTip('Menampilkan tiket di Service Center: ' + (activeTicketIdx === 2 ? 'Pulogadung' : 'MOI'));
                break;
            case 'export':
                setActiveFeatureTip('Ekspor data ke format Excel (XLSX) dengan formula injection sanitization.');
                break;
            default:
                break;
        }
    };

    return (
        <div className="relative min-h-dvh w-full bg-slate-50/60 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-red-600 selection:text-white px-3 sm:px-6 lg:px-8 xl:px-10 py-2 sm:py-2.5 transition-colors duration-200">
            <Head title="Aquos Platinum - Web App Work Order & Pelaporan Teknisi" />

            {/* Background Glow Orbs (Clipped to container so negative offsets can never cause scroll) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10" aria-hidden="true">
                <div className="absolute -top-40 left-1/3 h-80 sm:h-96 w-80 sm:w-96 -translate-x-1/2 rounded-full bg-red-600/10 dark:bg-red-600/20 blur-[120px]" />
                <div className="absolute -bottom-40 right-1/4 h-80 sm:h-96 w-80 sm:w-96 rounded-full bg-slate-300/40 dark:bg-slate-800/40 blur-[120px]" />
            </div>

            {/* Responsive Red Header */}
            <header className="mx-auto w-full max-w-7xl flex items-center justify-between px-3 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-950/95 dark:via-red-900/95 dark:to-red-950/95 text-white shadow-lg shadow-red-950/20 border border-red-500/40 dark:border-red-800/60 shrink-0 gap-2 backdrop-blur-md">
                {/* Brand Logo & Title */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <img
                        src="/icons/logo.png"
                        alt="Aquos Platinum"
                        className="h-8 sm:h-10 w-auto object-contain shrink-0 drop-shadow-md transition-transform hover:scale-105"
                    />
                    <div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-white drop-shadow-xs">
                                Aquos Platinum
                            </span>
                            <Badge
                                variant="secondary"
                                className="bg-white/20 hover:bg-white/30 text-white text-[10px] border border-white/30 flex items-center gap-1 px-1.5 py-0.5 font-bold backdrop-blur-xs"
                            >
                                <Smartphone className="size-3 text-white" />
                                <span>PWA</span>
                            </Badge>
                        </div>
                        <p className="hidden md:block text-[11px] font-medium text-red-100">
                            Pusat Servis & Work Order Teknisi Lapangan
                        </p>
                    </div>
                </div>

                {/* Header Action Buttons (ThemeToggle, Install & Login/Dashboard) */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    <ThemeToggle className="bg-white/15 hover:bg-white/25 border-white/25 text-white dark:bg-slate-900/50 dark:hover:bg-slate-900/75 dark:border-white/20" />

                    {!isInstalled && (
                        <Button
                            type="button"
                            onClick={handleInstallClick}
                            className="h-8 sm:h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-xs text-xs font-semibold px-2.5 sm:px-3.5 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >
                            <Download className="size-3.5 text-white shrink-0" />
                            <span className="hidden xs:inline">Install Web App</span>
                            <span className="xs:hidden">Install</span>
                        </Button>
                    )}

                    {user ? (
                        <Link href="/dashboard">
                            <Button className="h-8 sm:h-9 rounded-xl bg-white text-red-700 hover:bg-red-50 active:bg-red-100 dark:bg-white dark:text-red-700 dark:hover:bg-red-50 text-xs font-bold px-3 sm:px-4 shadow-md shadow-red-950/20 border border-white/40 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:scale-[1.02]">
                                <span className="hidden xs:inline">Buka Dashboard</span>
                                <span className="xs:hidden">Dashboard</span>
                                <ArrowRight className="size-3.5" />
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button className="h-8 sm:h-9 rounded-xl bg-white text-red-700 hover:bg-red-50 active:bg-red-100 dark:bg-white dark:text-red-700 dark:hover:bg-red-50 text-xs font-bold px-3 sm:px-4 shadow-md shadow-red-950/20 border border-white/40 flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all hover:scale-[1.02]">
                                <span className="hidden xs:inline">Masuk ke Akun</span>
                                <span className="xs:hidden">Masuk</span>
                                <ArrowRight className="size-3.5" />
                            </Button>
                        </Link>
                    )}
                </div>
            </header>

            {/* Core Responsive & Interactive Section */}
            <main className="mx-auto w-full max-w-7xl flex-1 flex flex-col justify-center py-2.5 sm:py-3 lg:py-1 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-center">
                    {/* Left Column: Brand & Interactive Feature Pills */}
                    <div className="md:col-span-7 space-y-2.5 sm:space-y-3 lg:space-y-3.5 text-left">
                        {/* Live Pill Indicator */}
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-semibold text-red-700 dark:text-red-300 shadow-xs">
                            <Sparkles className="size-3 sm:size-3.5 text-red-600 dark:text-red-400" />
                            <span>Platform Manajemen Pengerjaan Servis Modern</span>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <h1 className="text-xl sm:text-2xl md:text-[25px] lg:text-[28px] xl:text-[32px] font-black tracking-tight text-slate-900 dark:text-white leading-[1.2]">
                                Work Order & Notifikasi Servis Jadi{' '}
                                <span className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 dark:from-red-400 dark:via-rose-300 dark:to-red-400 bg-clip-text text-transparent">
                                    Cepat, Rapi & Akurat
                                </span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                                Aplikasi Web terintegrasi untuk pencatatan tiket Notif Unique, multi-jenis pengerjaan, jam kunjungan teknisi, dokumentasi foto terkompresi, dan ekspor data Excel.
                            </p>
                        </div>

                        {/* Interactive Feature Pills */}
                        <div className="space-y-1.5">
                            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Info className="size-3 text-red-600 dark:text-red-400" />
                                <span>Pilih Fitur Unggulan (Klik untuk Interaksi):</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => handlePillClick('notif')}
                                    className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 hover:border-red-500/50 px-2.5 sm:px-3 py-1 sm:py-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium transition-all cursor-pointer active:scale-95 shadow-xs"
                                >
                                    <Sparkles className="size-3.5 text-red-600 dark:text-red-400" />
                                    <span>Notif (Unique)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePillClick('photo')}
                                    className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 px-2.5 sm:px-3 py-1 sm:py-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium transition-all cursor-pointer active:scale-95 shadow-xs"
                                >
                                    <Camera className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Foto Compress (Canvas)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePillClick('center')}
                                    className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 hover:border-purple-500/50 px-2.5 sm:px-3 py-1 sm:py-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium transition-all cursor-pointer active:scale-95 shadow-xs"
                                >
                                    <Building2 className="size-3.5 text-purple-600 dark:text-purple-400" />
                                    <span>Pulogadung & MOI</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePillClick('export')}
                                    className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 px-2.5 sm:px-3 py-1 sm:py-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white font-medium transition-all cursor-pointer active:scale-95 shadow-xs"
                                >
                                    <FileSpreadsheet className="size-3.5 text-amber-600 dark:text-amber-400" />
                                    <span>Ekspor XLSX</span>
                                </button>
                            </div>

                            {/* Dynamic Hint Banner */}
                            {activeFeatureTip && (
                                <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50/90 dark:bg-red-950/40 px-2.5 py-1.5 text-[11px] sm:text-xs text-red-800 dark:text-red-200 flex items-center justify-between gap-2 animate-in fade-in duration-200">
                                    <span>{activeFeatureTip}</span>
                                    <button
                                        type="button"
                                        onClick={() => setActiveFeatureTip(null)}
                                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs px-1"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* System Info Security Pill */}
                        <div className="pt-1.5 sm:pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="size-3.5 sm:size-4 text-red-600 dark:text-red-400" />
                                <span>Keamanan: <strong className="text-slate-800 dark:text-slate-200 font-medium">Sesi Terenkripsi &bull; Terproteksi</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Building2 className="size-3.5 sm:size-4 text-slate-400" />
                                <span>Service Center: <strong className="text-slate-800 dark:text-slate-200">Pulogadung & MOI</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Interactive Mockup Card with Tabs & Photo View */}
                    <div className="md:col-span-5">
                        <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 sm:p-3.5 lg:p-4 shadow-xl sm:shadow-2xl shadow-slate-950/5 dark:shadow-black/50 backdrop-blur-xl space-y-2 sm:space-y-2.5 overflow-hidden">
                            {/* Red Accent Strip Header */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                            {/* Card Top Header & Ticket Switcher Tabs */}
                            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-1.5 sm:pb-2 gap-2 pt-0.5">
                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                    <span className="relative flex size-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200">Sistem Servis Aktif</span>
                                </div>

                                {/* Interactive Ticket Switcher Tabs */}
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                                    {SAMPLE_TICKETS.map((t, idx) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setActiveTicketIdx(idx)}
                                            className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                                activeTicketIdx === idx
                                                    ? 'bg-red-600 text-white shadow-xs'
                                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            {t.id.slice(-4)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sample Ticket Interactive Body */}
                            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 p-2 sm:p-2.5 lg:p-3 space-y-1.5 text-left text-xs transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-[10px] sm:text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 px-1.5 py-0.5 rounded">
                                            {currentTicket.id}
                                        </span>
                                        <Badge
                                            variant="secondary"
                                            className="text-[9px] sm:text-[10px] bg-slate-200/70 dark:bg-blue-950/60 text-slate-800 dark:text-blue-300 border border-slate-300 dark:border-blue-800/50"
                                        >
                                            {currentTicket.center}
                                        </Badge>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-md px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold border ${
                                            currentTicket.status === 'berbayar'
                                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900'
                                                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                                        }`}
                                    >
                                        <CheckCircle2 className="size-3" />
                                        {currentTicket.statusLabel}
                                    </span>
                                </div>

                                <div className="space-y-0.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">{currentTicket.customer}</div>
                                        <a
                                            href={`tel:${currentTicket.phone}`}
                                            className="flex items-center gap-1 text-[10px] sm:text-[11px] text-red-600 dark:text-red-300 hover:underline shrink-0"
                                            title="Telepon Pelanggan"
                                        >
                                            <Phone className="size-3 text-slate-400" />
                                            <span>{currentTicket.phone}</span>
                                        </a>
                                    </div>
                                    <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                        {currentTicket.unit} &bull; SN: {currentTicket.sn}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {currentTicket.works.map((w) => (
                                        <span
                                            key={w}
                                            className="rounded bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] sm:text-[10px] text-slate-700 dark:text-slate-300 font-medium"
                                        >
                                            {w}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800/60 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="size-3 text-slate-400" />
                                        {currentTicket.time}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsPhotoModalOpen(true)}
                                        className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-500/50 px-1.5 sm:px-2 py-0.5 rounded transition-all cursor-pointer active:scale-95"
                                    >
                                        <Camera className="size-3" />
                                        <span>{currentTicket.photoStatus}</span>
                                        <Maximize2 className="size-2.5 ml-0.5 opacity-75" />
                                    </button>
                                </div>
                            </div>

                            {/* 3 Metrics Mini Grid (Clickable to switch demo) */}
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                                <button
                                    type="button"
                                    onClick={() => setActiveTicketIdx((prev) => (prev + 1) % SAMPLE_TICKETS.length)}
                                    className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 p-1.5 sm:p-2 text-center transition-all cursor-pointer active:scale-95"
                                    title="Klik untuk melihat tiket selanjutnya"
                                >
                                    <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Notif</div>
                                    <div className="mt-0.5 text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white">8 Tiket</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTicketIdx(0)}
                                    className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 p-1.5 sm:p-2 text-center transition-all cursor-pointer active:scale-95"
                                    title="Klik untuk melihat tiket Berbayar"
                                >
                                    <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Berbayar</div>
                                    <div className="mt-0.5 text-xs sm:text-sm md:text-base font-black text-blue-600 dark:text-blue-400">75%</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTicketIdx(2)}
                                    className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 p-1.5 sm:p-2 text-center transition-all cursor-pointer active:scale-95"
                                    title="Klik untuk melihat tiket MOI"
                                >
                                    <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Center</div>
                                    <div className="mt-0.5 text-xs sm:text-sm md:text-base font-black text-purple-600 dark:text-purple-400">2 Lokasi</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer (Compact 1 Line on sm+, No Scroll) */}
            <footer className="mx-auto w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between py-1 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 shrink-0 gap-1 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5">
                    <img src="/icons/logo.png" alt="Aquos Platinum" className="size-3.5 object-contain" />
                    <span>&copy; {new Date().getFullYear()} Aquos Platinum</span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="hidden sm:inline">Pulogadung & MOI Mainwork Center</span>
                </div>
                <span>Sistem Pelaporan & Work Order Teknisi Lapangan</span>
            </footer>

            {/* Interactive Photo Preview Modal */}
            <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
                <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Camera className="size-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Dokumentasi Foto Tiket: {currentTicket.id}</span>
                            </DialogTitle>
                            <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] border border-emerald-200 dark:border-emerald-800/80">
                                {currentTicket.compressedSize}
                            </Badge>
                        </div>
                        <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                            Pelanggan: <strong className="text-slate-900 dark:text-slate-200">{currentTicket.customer}</strong> &bull; Unit: {currentTicket.unit} ({currentTicket.center})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Foto Kunjungan */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-900 dark:text-slate-200">1. Foto Kunjungan</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Sebelum Pengerjaan</span>
                            </div>
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/70 group">
                                <img
                                    src={currentTicket.visitPhoto}
                                    alt="Foto Kunjungan"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-slate-300 backdrop-blur-xs">
                                    Mulai: {currentTicket.time.split(' - ')[0]} WIB
                                </div>
                            </div>
                        </div>

                        {/* Foto Selesai */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">2. Foto Selesai</span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Hasil Pengerjaan</span>
                            </div>
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/70 group">
                                <img
                                    src={currentTicket.completionPhoto}
                                    alt="Foto Selesai"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] text-slate-300 backdrop-blur-xs">
                                    Selesai: {currentTicket.time.split(' - ')[1]}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compression & Notes Info */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-3 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 dark:text-slate-400">Kompresi Otomatis Canvas:</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{currentTicket.origSize} &rarr; {currentTicket.compressedSize}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            Catatan Teknisi: <span className="text-slate-900 dark:text-slate-200 font-medium">{currentTicket.notes}</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* PWA Install Instructions Modal */}
            <PwaInstallGuideDialog
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
                isIOS={isIOS}
                onMarkInstalled={markAsInstalled}
            />
        </div>
    );
}
