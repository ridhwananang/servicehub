import { useAppearance } from '@/hooks/use-appearance';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';

function Toaster({ ...props }: ToasterProps) {
    const { appearance } = useAppearance();

    useFlashToast();

    return (
        <Sonner
            theme={appearance}
            className="toaster group"
            position="top-right"
            richColors
            closeButton
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-white/95 dark:group-[.toaster]:bg-slate-900/95 group-[.toaster]:text-slate-900 dark:group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-200/90 dark:group-[.toaster]:border-slate-800/90 group-[.toaster]:shadow-xl group-[.toaster]:shadow-slate-900/10 dark:group-[.toaster]:shadow-black/40 group-[.toaster]:rounded-2xl group-[.toaster]:p-3.5 group-[.toaster]:backdrop-blur-md group-[.toaster]:font-sans text-xs sm:text-sm tracking-tight',
                    description:
                        'group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400 text-xs mt-0.5',
                    actionButton:
                        'group-[.toast]:bg-slate-900 dark:group-[.toast]:bg-slate-100 group-[.toast]:text-white dark:group-[.toast]:text-slate-900 group-[.toast]:rounded-xl font-medium text-xs',
                    cancelButton:
                        'group-[.toast]:bg-slate-100 dark:group-[.toast]:bg-slate-800 group-[.toast]:text-slate-600 dark:group-[.toast]:text-slate-300 group-[.toast]:rounded-xl font-medium text-xs',
                    closeButton:
                        'group-[.toast]:bg-white dark:group-[.toast]:bg-slate-800 group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400 group-[.toast]:border-slate-200 dark:group-[.toast]:border-slate-700 group-[.toast]:hover:bg-slate-100 dark:group-[.toast]:hover:bg-slate-700 group-[.toast]:rounded-lg',
                },
            }}
            {...props}
        />
    );
}

export { Toaster, toast };

