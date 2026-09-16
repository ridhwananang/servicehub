import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

type ThemeToggleProps = {
    className?: string;
    showLabel?: boolean;
};

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted
        ? (typeof document !== 'undefined'
            ? document.documentElement.classList.contains('dark')
            : resolvedAppearance === 'dark')
        : false;

    const handleToggle = () => {
        const isCurrentDark = typeof document !== 'undefined'
            ? document.documentElement.classList.contains('dark')
            : resolvedAppearance === 'dark';
        updateAppearance(isCurrentDark ? 'light' : 'dark');
    };

    return (
        <Button
            type="button"
            variant="ghost"
            size={showLabel ? 'default' : 'icon'}
            onClick={handleToggle}
            suppressHydrationWarning
            className={cn(
                'h-9 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-xs transition-all cursor-pointer active:scale-95',
                showLabel ? 'px-3 gap-2' : 'w-9 p-0',
                className
            )}
            title={mounted ? (isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap') : 'Ganti mode tema'}
            aria-label={mounted ? (isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap') : 'Ganti mode tema'}
        >
            <Sun className="size-4 text-amber-400 shrink-0 transition-transform rotate-0 scale-100 hidden dark:block" />
            <Moon className="size-4 text-zinc-800 dark:text-zinc-200 shrink-0 transition-transform rotate-0 scale-100 block dark:hidden" />
            {showLabel && (
                <>
                    <span className="text-xs font-semibold hidden dark:inline">
                        Mode Terang
                    </span>
                    <span className="text-xs font-semibold inline dark:hidden">
                        Mode Gelap
                    </span>
                </>
            )}
        </Button>
    );
}

export default ThemeToggle;
