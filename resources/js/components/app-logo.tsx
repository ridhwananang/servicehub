import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <AppLogoIcon className="h-9 w-auto object-contain shrink-0 drop-shadow-xs" />
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-bold text-zinc-900 dark:text-white">
                    {name || 'Aquos Platinum'}
                </span>
            </div>
        </>
    );
}
