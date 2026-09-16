import { Link, usePage } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { ArrowLeft, Palette, Shield, User, Users } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem, User as AuthUser } from '@/types';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { auth } = usePage<{ auth?: { user?: AuthUser } }>().props;
    const isAdmin = (auth?.user?.role || '').toLowerCase() === 'admin';

    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profil Saya',
            href: edit(),
            icon: User,
        },
        {
            title: 'Keamanan & Sandi',
            href: editSecurity(),
            icon: Shield,
        },
        {
            title: 'Tampilan (Tema)',
            href: editAppearance(),
            icon: Palette,
        },
        ...(isAdmin
            ? [
                  {
                      title: 'Kelola Pengguna',
                      href: '/users',
                      icon: Users,
                  },
              ]
            : []),
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
                <Heading
                    title="Pengaturan Akun"
                    description="Kelola profil pribadi, foto, keamanan akun, dan preferensi sistem"
                />
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="self-start sm:self-center flex items-center gap-1.5 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    <Link href="/dashboard">
                        <ArrowLeft className="size-4 text-slate-500" />
                        <span>Kembali ke Dashboard</span>
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full lg:w-56 shrink-0">
                    <nav
                        className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto custom-scrollbar pb-1.5 lg:pb-0 -mx-1 px-1"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = isCurrentOrParentUrl(item.href);

                            return (
                                <Button
                                    key={`${toUrl(item.href)}-${index}`}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn(
                                        'w-auto lg:w-full shrink-0 justify-start gap-2 rounded-xl text-xs sm:text-sm font-medium transition-colors px-3 py-2 whitespace-nowrap',
                                        isActive
                                            ? 'bg-red-50 text-red-700 font-semibold dark:bg-red-950/50 dark:text-red-300 shadow-xs border border-red-200/60 dark:border-red-900/60'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent',
                                    )}
                                >
                                    <Link href={item.href}>
                                        {Icon && (
                                            <Icon
                                                className={cn(
                                                    'h-4 w-4 shrink-0',
                                                    isActive
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : 'text-slate-400 dark:text-slate-500',
                                                )}
                                            />
                                        )}
                                        <span>{item.title}</span>
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-4 lg:hidden" />

                <div className="flex-1 md:max-w-3xl">
                    <section className="space-y-8">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
