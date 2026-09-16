import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative min-h-dvh sm:h-dvh sm:max-h-dvh w-full bg-slate-50/60 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between overflow-y-auto sm:overflow-hidden selection:bg-red-600 selection:text-white px-4 py-2.5 sm:px-6 sm:py-3.5 lg:px-8 transition-colors duration-200">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10" aria-hidden="true">
                <div className="absolute -top-32 left-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-red-600/10 dark:bg-red-600/20 blur-[120px]" />
                <div className="absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-slate-300/40 dark:bg-slate-800/40 blur-[120px]" />
            </div>

            {/* Top Navigation Red Header */}
            <header className="mx-auto w-full max-w-5xl flex items-center justify-between px-3.5 sm:px-5 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-950/95 dark:via-red-900/95 dark:to-red-950/95 text-white shadow-lg shadow-red-950/20 border border-red-500/40 dark:border-red-800/60 shrink-0 gap-2 backdrop-blur-md">
                <Link
                    href={home()}
                    className="flex items-center gap-2.5 sm:gap-3 group transition-opacity hover:opacity-95"
                >
                    <img
                        src="/icons/logo.png"
                        alt="Aquos Platinum"
                        className="h-9 sm:h-11 w-auto object-contain shrink-0 drop-shadow-md transition-transform group-hover:scale-105"
                    />
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-xs">
                                Aquos Platinum
                            </span>
                            <Badge
                                variant="secondary"
                                className="bg-white/20 text-white text-[10px] border border-white/30 font-bold backdrop-blur-xs"
                            >
                                PWA
                            </Badge>
                        </div>
                        <p className="hidden xs:block text-[10px] font-medium text-red-100">
                            Pulogadung &bull; MOI Mainwork
                        </p>
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <ThemeToggle className="bg-white/15 hover:bg-white/25 border-white/25 text-white dark:bg-slate-900/50 dark:hover:bg-slate-900/75 dark:border-white/20" />
                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white transition-all bg-white/15 hover:bg-white/25 border border-white/25 px-3 py-1.5 rounded-xl shadow-xs backdrop-blur-xs active:scale-95 hover:scale-[1.02]"
                    >
                        <ArrowLeft className="size-3 text-white" />
                        <span className="hidden xs:inline">Kembali ke Beranda</span>
                        <span className="xs:hidden">Beranda</span>
                    </Link>
                </div>
            </header>

            {/* Main Auth Card (Strictly 1-Screen Centered, No Scroll) */}
            <main className="my-auto py-1 shrink-0 w-full flex justify-center items-center">
                <div className="w-full max-w-md">
                    <div className="relative rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 p-5 sm:p-6 shadow-2xl shadow-slate-950/5 dark:shadow-black/50 backdrop-blur-xl overflow-hidden">
                        {/* Red Accent Strip Header */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                        {(title || description) && (
                            <div className="space-y-1 text-center mb-4 pt-1">
                                {title && (
                                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                                        {title}
                                    </h1>
                                )}
                                {description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-balance">
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}

                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mx-auto w-full max-w-5xl flex flex-col xs:flex-row items-center justify-between py-1 text-[11px] text-slate-500 dark:text-slate-400 shrink-0 gap-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-red-600 dark:text-red-400" />
                    <span>Sesi Terenkripsi &bull; Autentikasi Aman</span>
                </div>
                <span>&copy; {new Date().getFullYear()} Aquos Platinum Work Order System</span>
            </footer>
        </div>
    );
}

