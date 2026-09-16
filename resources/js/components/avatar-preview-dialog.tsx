import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Wrench, X, Sparkles } from 'lucide-react';
import type { UserRole } from '@/types/auth';

interface AvatarPreviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        name: string;
        email?: string;
        role?: UserRole | string;
        avatar?: string | null;
    } | null;
}

export function AvatarPreviewDialog({
    isOpen,
    onClose,
    user,
}: AvatarPreviewDialogProps) {
    if (!user) return null;

    const role = (user.role || 'teknisi').toLowerCase();
    const isAdmin = role === 'admin';
    const displayInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className="p-2 sm:p-4 border-0 bg-transparent shadow-none max-w-sm sm:max-w-md w-full max-h-[96dvh] overflow-y-auto custom-scrollbar-thin flex flex-col items-center justify-center focus:outline-hidden"
                style={{ background: 'transparent' }}
            >
                {/* Accessible Hidden Title & Description */}
                <DialogTitle className="sr-only">Preview Foto Profil {user.name}</DialogTitle>
                <DialogDescription className="sr-only">
                    Tampilan resolusi penuh foto profil untuk {user.name} ({user.role})
                </DialogDescription>

                {/* Floating Glass Close Button */}
                <div className="w-full flex justify-end mb-1.5 sm:mb-3 pr-1 sm:pr-2">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup preview"
                        className="group flex size-9 sm:size-10 items-center justify-center rounded-full bg-black/75 hover:bg-black/90 text-white/90 hover:text-white backdrop-blur-xl border border-white/25 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 shrink-0"
                    >
                        <X className="size-4 sm:size-5 transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {/* Immersive Avatar Container with Ambient Glow */}
                <div className="relative flex flex-col items-center justify-center w-full px-2">
                    {/* Ambient Glow Background */}
                    <div
                        className={`absolute -inset-3 sm:-inset-4 rounded-full blur-2xl opacity-40 transition-all duration-500 pointer-events-none ${
                            isAdmin
                                ? 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500'
                                : 'bg-gradient-to-tr from-rose-500 via-red-500 to-amber-500'
                        }`}
                    />

                    {/* Responsive Circular Avatar Frame */}
                    <div className="relative size-40 xs:size-48 sm:size-64 md:size-72 max-w-[72vw] max-h-[44dvh] aspect-square rounded-full overflow-hidden border-3 sm:border-4 border-white/40 dark:border-white/20 shadow-2xl bg-slate-900 flex items-center justify-center ring-4 ring-black/50 ring-offset-2 ring-offset-white/15 backdrop-blur-md shrink-0">
                        {user.avatar ? (
                            <img
                                src={user.avatar}
                                alt={`Foto Profil ${user.name}`}
                                className="h-full w-full object-cover select-none transition-transform duration-500 hover:scale-105"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 select-none">
                                <span className="text-4xl xs:text-5xl sm:text-6xl font-black text-white/90 drop-shadow-md">
                                    {displayInitial}
                                </span>
                                <span className="text-[10px] sm:text-xs font-medium text-white/60">
                                    Belum ada foto
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Floating Info Pill under the Avatar */}
                    <div className="mt-3 sm:mt-4 flex flex-col items-center text-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-black/75 dark:bg-black/85 backdrop-blur-xl border border-white/15 text-white shadow-xl max-w-[280px] xs:max-w-xs sm:max-w-sm w-full mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                            <h3 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight truncate max-w-[170px] xs:max-w-[210px]">
                                {user.name}
                            </h3>
                            <Badge
                                variant="outline"
                                className={`text-[9px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 border ${
                                    isAdmin
                                        ? 'bg-indigo-500/30 text-indigo-200 border-indigo-400/40'
                                        : 'bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                                }`}
                            >
                                {isAdmin ? (
                                    <ShieldCheck className="size-3" />
                                ) : (
                                    <Wrench className="size-3" />
                                )}
                                <span>{isAdmin ? 'Administrator' : 'Teknisi'}</span>
                            </Badge>
                        </div>

                        {user.email && (
                            <p className="text-[11px] sm:text-xs text-white/70 truncate max-w-[230px] mt-0.5">
                                {user.email}
                            </p>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
