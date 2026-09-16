import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState<boolean>(true);
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Check if already running in standalone PWA window or stored in localStorage
        const checkIsInstalled = (): boolean => {
            try {
                if (localStorage.getItem('pwa_installed') === 'true') return true;
            } catch {}
            if (window.matchMedia('(display-mode: standalone)').matches) return true;
            if ((window.navigator as any).standalone === true) return true;
            if (document.referrer.includes('android-app://')) return true;
            return false;
        };

        const installed = checkIsInstalled();
        setIsInstalled(installed);
        if (installed) {
            try {
                localStorage.setItem('pwa_installed', 'true');
            } catch {}
        }

        // Check Chromium getInstalledRelatedApps API if available
        if ('getInstalledRelatedApps' in navigator) {
            (navigator as any)
                .getInstalledRelatedApps()
                .then((relatedApps: any[]) => {
                    if (relatedApps && relatedApps.length > 0) {
                        setIsInstalled(true);
                        try {
                            localStorage.setItem('pwa_installed', 'true');
                        } catch {}
                    }
                })
                .catch(() => {});
        }

        // Check if iOS Safari
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
            try {
                localStorage.setItem('pwa_installed', 'true');
            } catch {}
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const markAsInstalled = () => {
        setIsInstalled(true);
        setIsInstallable(false);
        try {
            localStorage.setItem('pwa_installed', 'true');
        } catch {}
    };

    const promptInstall = async (): Promise<boolean> => {
        if (!deferredPrompt) {
            return false;
        }

        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;

        if (choiceResult.outcome === 'accepted') {
            setIsInstalled(true);
            setIsInstallable(false);
            setDeferredPrompt(null);
            try {
                localStorage.setItem('pwa_installed', 'true');
            } catch {}
            return true;
        }

        return false;
    };

    return {
        isInstallable,
        isInstalled,
        isMounted,
        isIOS,
        promptInstall,
        markAsInstalled,
    };
}
