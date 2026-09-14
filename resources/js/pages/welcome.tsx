import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Wrench,
    ArrowRight,
    Download,
    Building2,
    ShieldCheck,
    Sparkles,
    Check,
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

    const { isInstallable, isInstalled, isIOS, promptInstall } = usePwaInstall();
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
        <div className="relative min-h-screen xl:h-screen xl:max-h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col justify-between overflow-y-auto selection:bg-indigo-500 selection:text-white p-3.5 sm:p-5 lg:px-8 xl:px-10 py-2.5 sm:py-4">
            <Head title="ServisHub - Web App Work Order & Pelaporan Teknisi" />

            {/* Background Glow Orbs */}
            <div className="pointer-events-none absolute -top-40 left-1/3 -z-10 h-80 sm:h-96 w-80 sm:w-96 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-40 right-1/4 -z-10 h-80 sm:h-96 w-80 sm:w-96 rounded-full bg-purple-600/15 blur-[120px]" />

            {/* Responsive Header */}
            <header className="mx-auto w-full max-w-7xl flex items-center justify-between py-1.5 shrink-0 gap-2">
                {/* Brand Logo & Title */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 shrink-0">
                        <Wrench className="size-4.5 sm:size-5 -rotate-45" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-base sm:text-xl font-black tracking-tight text-white">
                                ServisHub
                            </span>
                            <Badge variant="secondary" className="bg-indigo-950/80 text-indigo-300 text-[10px] border border-indigo-800/80 flex items-center gap-1 px-1.5 py-0.5">
                                <Smartphone className="size-3 text-indigo-400" />
                                <span>PWA</span>
                            </Badge>
                        </div>
                        <p className="hidden md:block text-[11px] font-medium text-slate-400">
                            Pusat Servis & Work Order Teknisi Lapangan
                        </p>
                    </div>
                </div>

                {/* Header Action Buttons (Install & Login/Dashboard) */}
                <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    {isInstalled ? (
                        <div className="flex items-center gap-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-2.5 sm:px-3 h-9 select-none">
                            <Check className="size-3.5 text-emerald-400" />
                            <span className="hidden xs:inline">Aplikasi Terpasang</span>
                            <span className="xs:hidden">Terpasang</span>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            onClick={handleInstallClick}
                            className="h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700/80 hover:border-indigo-500/60 text-xs font-semibold px-2.5 sm:px-3.5 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >
                            <Download className="size-3.5 text-indigo-400 shrink-0" />
                            <span className="hidden xs:inline">Install Web App</span>
                            <span className="xs:hidden">Install</span>
                        </Button>
                    )}

                    {user ? (
                        <Link href="/dashboard">
                            <Button className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 sm:px-4 shadow-xs shadow-indigo-600/25 flex items-center gap-1 cursor-pointer active:scale-95">
                                <span className="hidden xs:inline">Buka Dashboard</span>
                                <span className="xs:hidden">Dashboard</span>
                                <ArrowRight className="size-3.5" />
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 sm:px-4 shadow-xs shadow-indigo-600/25 flex items-center gap-1 cursor-pointer active:scale-95">
                                <span className="hidden xs:inline">Masuk ke Akun</span>
                                <span className="xs:hidden">Masuk</span>
                                <ArrowRight className="size-3.5" />
                            </Button>
                        </Link>
                    )}
                </div>
            </header>

            {/* Core Responsive & Interactive Section */}
            <main className="mx-auto w-full max-w-7xl my-auto py-2 sm:py-3 shrink-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
                    {/* Left Column: Brand & Interactive Feature Pills */}
                    <div className="lg:col-span-7 space-y-3.5 sm:space-y-4.5 text-left">
                        {/* Live Pill Indicator */}
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 shadow-inner">
                            <Sparkles className="size-3.5 text-indigo-400" />
                            <span>Platform Manajemen Pengerjaan Servis Modern</span>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-black tracking-tight text-white leading-tight">
                                Work Order & Notifikasi Servis Jadi{' '}
                                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
                                    Cepat, Rapi & Akurat
                                </span>
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
                                Aplikasi Web terintegrasi untuk pencatatan tiket Notif Unique, multi-jenis pengerjaan, jam kunjungan teknisi, dokumentasi foto terkompresi, dan ekspor data Excel.
                            </p>
                        </div>

                        {/* Interactive Feature Pills */}
                        <div className="space-y-2">
                            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <Info className="size-3 text-indigo-400" />
                                <span>Pilih Fitur Unggulan (Klik untuk Interaksi):</span>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs">
                                <button
                                    type="button"
                                    onClick={() => handlePillClick('notif')}
                                    className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 px-3 py-1.5 text-slate-300 font-medium transition-all cursor-pointer active:scale-95"
                                >
                                    <Sparkles className="size-3.5 text-indigo-400" />
                                    <span>Notif (Unique)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePillClick('photo')}
                                    className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 px-3 py-1.5 text-slate-300 font-medium transition-all cursor-pointer active:scale-95"
                                >
                                    <Camera className="size-3.5 text-emerald-400" />
                                    <span>Foto Compress (Canvas)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePillClick('center')}
                                    className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/50 px-3 py-1.5 text-slate-300 font-medium transition-all cursor-pointer active:scale-95"
                                >
                                    <Building2 className="size-3.5 text-purple-400" />
                                    <span>Pulogadung & MOI</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePillClick('export')}
                                    className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 px-3 py-1.5 text-slate-300 font-medium transition-all cursor-pointer active:scale-95"
                                >
                                    <FileSpreadsheet className="size-3.5 text-amber-400" />
                                    <span>Ekspor XLSX</span>
                                </button>
                            </div>

                            {/* Dynamic Hint Banner */}
                            {activeFeatureTip && (
                                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-2.5 text-xs text-indigo-200 flex items-center justify-between gap-2 animate-in fade-in duration-200">
                                    <span>{activeFeatureTip}</span>
                                    <button
                                        type="button"
                                        onClick={() => setActiveFeatureTip(null)}
                                        className="text-slate-400 hover:text-white text-xs px-1"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* System Info Security Pill */}
                        <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="size-4 text-indigo-400" />
                                <span>Keamanan: <strong className="text-slate-200 font-medium">Sesi Terenkripsi &bull; Terproteksi</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Building2 className="size-4 text-slate-400" />
                                <span>Service Center: <strong className="text-slate-200">Pulogadung & MOI</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Interactive Mockup Card with Tabs & Photo View */}
                    <div className="lg:col-span-5">
                        <div className="relative rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3.5">
                            {/* Card Top Header & Ticket Switcher Tabs */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="relative flex size-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-slate-200">Sistem Servis Aktif</span>
                                </div>

                                {/* Interactive Ticket Switcher Tabs */}
                                <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/80">
                                    {SAMPLE_TICKETS.map((t, idx) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setActiveTicketIdx(idx)}
                                            className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                                activeTicketIdx === idx
                                                    ? 'bg-indigo-600 text-white shadow-xs'
                                                    : 'text-slate-400 hover:text-slate-200'
                                            }`}
                                        >
                                            {t.id.slice(-4)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sample Ticket Interactive Body */}
                            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-2.5 text-left text-xs transition-all">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded">
                                            {currentTicket.id}
                                        </span>
                                        <Badge variant="secondary" className="text-[10px] bg-blue-950/60 text-blue-300 border border-blue-800/50">
                                            {currentTicket.center}
                                        </Badge>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                                            currentTicket.status === 'berbayar'
                                                ? 'bg-blue-950/50 text-blue-300 border-blue-900'
                                                : 'bg-emerald-950/50 text-emerald-300 border-emerald-900'
                                        }`}
                                    >
                                        <CheckCircle2 className="size-3" />
                                        {currentTicket.statusLabel}
                                    </span>
                                </div>

                                <div className="space-y-0.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="font-bold text-sm text-white truncate">{currentTicket.customer}</div>
                                        <a
                                            href={`tel:${currentTicket.phone}`}
                                            className="flex items-center gap-1 text-[11px] text-indigo-300 hover:underline shrink-0"
                                            title="Telepon Pelanggan"
                                        >
                                            <Phone className="size-3 text-slate-400" />
                                            <span>{currentTicket.phone}</span>
                                        </a>
                                    </div>
                                    <div className="text-[11px] text-slate-400 truncate">
                                        {currentTicket.unit} &bull; SN: {currentTicket.sn}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1 pt-0.5">
                                    {currentTicket.works.map((w) => (
                                        <span
                                            key={w}
                                            className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-medium"
                                        >
                                            {w}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-[11px] text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="size-3 text-slate-400" />
                                        {currentTicket.time}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsPhotoModalOpen(true)}
                                        className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-600/60 px-2 py-0.5 rounded transition-all cursor-pointer active:scale-95"
                                    >
                                        <Camera className="size-3" />
                                        <span>{currentTicket.photoStatus}</span>
                                        <Maximize2 className="size-2.5 ml-0.5 opacity-75" />
                                    </button>
                                </div>
                            </div>

                            {/* 3 Metrics Mini Grid (Clickable to switch demo) */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <button
                                    type="button"
                                    onClick={() => setActiveTicketIdx((prev) => (prev + 1) % SAMPLE_TICKETS.length)}
                                    className="rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/80 hover:border-slate-700 p-2 text-center transition-all cursor-pointer active:scale-95"
                                    title="Klik untuk melihat tiket selanjutnya"
                                >
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Notif</div>
                                    <div className="mt-0.5 text-base sm:text-lg font-black text-white">8 Tiket</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTicketIdx(0)}
                                    className="rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/80 hover:border-slate-700 p-2 text-center transition-all cursor-pointer active:scale-95"
                                    title="Klik untuk melihat tiket Berbayar"
                                >
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Berbayar</div>
                                    <div className="mt-0.5 text-base sm:text-lg font-black text-blue-400">75%</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTicketIdx(2)}
                                    className="rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/80 hover:border-slate-700 p-2 text-center transition-all cursor-pointer active:scale-95"
                                    title="Klik untuk melihat tiket MOI"
                                >
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Center</div>
                                    <div className="mt-0.5 text-base sm:text-lg font-black text-purple-400">2 Lokasi</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mx-auto w-full max-w-7xl flex flex-col xs:flex-row items-center justify-between py-1 text-[11px] text-slate-400 shrink-0 gap-1.5">
                <div className="flex items-center gap-1.5">
                    <Wrench className="size-3.5 text-indigo-400" />
                    <span>&copy; {new Date().getFullYear()} ServisHub</span>
                    <span>&bull;</span>
                    <span>Pulogadung & MOI Mainwork Center</span>
                </div>
                <span>Sistem Pelaporan & Work Order Teknisi Lapangan</span>
            </footer>

            {/* Interactive Photo Preview Modal */}
            <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
                <DialogContent className="max-w-2xl bg-slate-950 text-slate-100 border-slate-800 p-5 sm:p-6 rounded-2xl">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                <Camera className="size-4 text-emerald-400" />
                                <span>Dokumentasi Foto Tiket: {currentTicket.id}</span>
                            </DialogTitle>
                            <Badge variant="secondary" className="bg-emerald-950/80 text-emerald-300 text-[10px] border border-emerald-800/80">
                                {currentTicket.compressedSize}
                            </Badge>
                        </div>
                        <DialogDescription className="text-xs text-slate-400">
                            Pelanggan: <strong className="text-slate-200">{currentTicket.customer}</strong> &bull; Unit: {currentTicket.unit} ({currentTicket.center})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Foto Kunjungan */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-slate-200">1. Foto Kunjungan</span>
                                <span className="text-[10px] text-slate-400 font-mono">Sebelum Pengerjaan</span>
                            </div>
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
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
                                <span className="font-semibold text-emerald-400">2. Foto Selesai</span>
                                <span className="text-[10px] text-emerald-400 font-mono">Hasil Pengerjaan</span>
                            </div>
                            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
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
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs space-y-1 text-slate-300">
                        <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">Kompresi Otomatis Canvas:</span>
                            <span className="font-mono text-emerald-400 font-semibold">{currentTicket.origSize} &rarr; {currentTicket.compressedSize}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                            Catatan Teknisi: <span className="text-slate-200">{currentTicket.notes}</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* PWA Install Instructions Modal */}
            <PwaInstallGuideDialog
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
                isIOS={isIOS}
            />
        </div>
    );
}
