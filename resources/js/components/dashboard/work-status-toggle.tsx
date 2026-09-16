import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Check, Clock, Loader2 } from 'lucide-react';
import type { ServiceTicket } from '@/types';

interface WorkStatusToggleProps {
    ticket: ServiceTicket;
    className?: string;
}

export function WorkStatusToggle({ ticket, className = '' }: WorkStatusToggleProps) {
    const isCompletedInitial = ticket.work_status === 'selesai';
    const [isCompleted, setIsCompleted] = useState(isCompletedInitial);
    const [isLoading, setIsLoading] = useState(false);

    // Sync with prop changes
    React.useEffect(() => {
        setIsCompleted(ticket.work_status === 'selesai');
    }, [ticket.work_status]);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;

        const nextStatus = isCompleted ? 'belum_selesai' : 'selesai';
        setIsCompleted(!isCompleted); // optimistic update
        setIsLoading(true);

        router.patch(
            `/tickets/${ticket.id}/toggle-status`,
            { work_status: nextStatus },
            {
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
                onError: () => setIsCompleted(isCompleted), // rollback on error
            }
        );
    };

    return (
        <button
            type="button"
            onClick={handleToggle}
            disabled={isLoading}
            title={isCompleted ? 'Status: Selesai (Klik untuk ubah ke Belum Selesai)' : 'Status: Belum Selesai (Klik untuk tandai Selesai)'}
            aria-label={`Ubah status pengerjaan tiket ${ticket.notif_number}. Saat ini ${isCompleted ? 'Selesai' : 'Belum Selesai'}`}
            aria-pressed={isCompleted}
            className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all shadow-2xs cursor-pointer select-none active:scale-95 shrink-0 ${
                isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/60'
                    : 'bg-amber-50 text-amber-700 border border-amber-300/80 hover:bg-amber-100/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80 dark:hover:bg-amber-900/50'
            } ${className}`}
        >
            {/* Knob with icon */}
            <span
                className={`flex size-3.5 items-center justify-center rounded-full transition-transform shrink-0 ${
                    isLoading
                        ? 'bg-zinc-400 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white group-hover:scale-110'
                        : 'bg-amber-500 text-white group-hover:scale-110'
                }`}
            >
                {isLoading ? (
                    <Loader2 className="size-2.5 animate-spin" />
                ) : isCompleted ? (
                    <Check className="size-2.5 stroke-[3]" />
                ) : (
                    <Clock className="size-2.5 stroke-[2.5]" />
                )}
            </span>
            <span className="truncate">{isCompleted ? 'Selesai' : 'Belum Selesai'}</span>
        </button>
    );
}
