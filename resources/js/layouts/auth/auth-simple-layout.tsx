import { Link } from '@inertiajs/react';
import { Wrench, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative min-h-screen sm:h-screen sm:max-h-screen w-full bg-slate-950 text-slate-100 font-sans flex flex-col justify-between overflow-y-auto sm:overflow-hidden selection:bg-indigo-500 selection:text-white px-4 py-2.5 sm:px-6 sm:py-3.5 lg:px-8">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-32 left-1/3 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-32 right-1/4 -z-10 h-80 w-80 rounded-full bg-purple-600/15 blur-[120px]" />

            {/* Top Navigation Header */}
            <header className="mx-auto w-full max-w-5xl flex items-center justify-between py-1 shrink-0">
                <Link
                    href={home()}
                    className="flex items-center gap-2 group transition-opacity hover:opacity-90"
                >
                    <div className="flex size-8 sm:size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition-transform group-hover:scale-105">
                        <Wrench className="size-4 sm:size-4.5 -rotate-45" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-base sm:text-lg font-black tracking-tight text-white">
                                ServisHub
                            </span>
                            <Badge variant="secondary" className="bg-indigo-950/80 text-indigo-300 text-[10px] border border-indigo-800/80">
                                PWA
                            </Badge>
                        </div>
                        <p className="hidden xs:block text-[10px] font-medium text-slate-400">
                            Pulogadung &bull; MOI Mainwork
                        </p>
                    </div>
                </Link>

                <Link
                    href={home()}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors bg-slate-900/80 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg shadow-xs"
                >
                    <ArrowLeft className="size-3" />
                    <span>Kembali ke Beranda</span>
                </Link>
            </header>

            {/* Main Auth Card (Strictly 1-Screen Centered, No Scroll) */}
            <main className="my-auto py-1 shrink-0 w-full flex justify-center items-center">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
                        {(title || description) && (
                            <div className="space-y-1 text-center mb-4">
                                {title && (
                                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                                        {title}
                                    </h1>
                                )}
                                {description && (
                                    <p className="text-xs text-slate-400 text-balance">
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
            <footer className="mx-auto w-full max-w-5xl flex flex-col xs:flex-row items-center justify-between py-1 text-[11px] text-slate-400 shrink-0 gap-1.5">
                <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-indigo-400" />
                    <span>Sesi Terenkripsi &bull; Autentikasi Aman</span>
                </div>
                <span>&copy; {new Date().getFullYear()} ServisHub Work Order System</span>
            </footer>
        </div>
    );
}
