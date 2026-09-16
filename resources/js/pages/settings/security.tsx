import React, { useRef } from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    Info,
    KeyRound,
    Lock,
    ShieldCheck,
    Sparkles,
    User as UserIcon,
} from 'lucide-react';
import { Toaster } from 'sonner';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';

type Props = {
    passwordRules: string;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100">
            <Head title="Keamanan & Sandi - Aquos Platinum" />
            <Toaster position="top-right" richColors />

            {/* Standalone Header Nav matching Aquos Platinum Branding */}
            <header className="sticky top-0 z-40 border-b border-red-500/40 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-md backdrop-blur-md dark:border-red-800/60 dark:from-red-950 dark:via-red-900 dark:to-red-950">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 hover:text-white rounded-xl h-9 px-2 sm:px-3 shrink-0 cursor-pointer"
                        >
                            <Link href="/dashboard" className="flex items-center gap-1.5 text-xs font-semibold">
                                <ArrowLeft className="size-4 shrink-0" />
                                <span className="hidden sm:inline">Kembali ke Dashboard</span>
                                <span className="inline sm:hidden">Dashboard</span>
                            </Link>
                        </Button>
                        <div className="h-5 w-px bg-white/25 hidden xs:block shrink-0" />
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-black text-xs xs:text-sm sm:text-base tracking-tight text-white truncate">
                                Keamanan & Sandi
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <ThemeToggle className="bg-white/15 hover:bg-white/25 border-white/25 text-white dark:bg-black/35 dark:hover:bg-black/50 dark:border-white/20 h-8 sm:h-9 w-8 sm:w-9 cursor-pointer" />
                    </div>
                </div>
            </header>

            {/* Main Content: Clean Centered Canvas */}
            <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8 space-y-6">
                {/* Sub Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold px-3.5 h-9 cursor-pointer"
                    >
                        <Link href="/settings/profile" className="flex items-center gap-2">
                            <UserIcon className="size-3.5" />
                            <span>Profil Saya</span>
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="rounded-xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold border border-red-200/80 dark:border-red-900/60 text-xs px-3.5 h-9 cursor-pointer"
                    >
                        <Link href="/settings/security" className="flex items-center gap-2">
                            <ShieldCheck className="size-3.5" />
                            <span>Keamanan & Sandi</span>
                        </Link>
                    </Button>
                </div>

                {/* Master Security Card */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {/* Top Decorative Banner */}
                    <div className="relative h-28 sm:h-40 w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-950 dark:via-zinc-900 dark:to-red-950 overflow-hidden">
                        {/* Subtle ambient decorative accents */}
                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                        <div className="absolute -right-8 -bottom-8 size-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                        <div className="absolute -left-8 -top-8 size-36 rounded-full bg-amber-400/20 blur-xl pointer-events-none" />

                        <div className="absolute top-3.5 right-4 sm:top-4 sm:right-6">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white/95 border border-white/15 shadow-xs">
                                <Sparkles className="size-3 text-amber-300" />
                                <span>Proteksi Akun Aquos</span>
                            </span>
                        </div>
                    </div>

                    {/* Card Content with Overlapping Badge */}
                    <div className="px-5 sm:px-8 pb-7 sm:pb-9 pt-0">
                        {/* Header Row: Overlapping Shield Icon + Title */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                                <div className="relative group shrink-0">
                                    <div className="flex size-24 sm:size-28 items-center justify-center rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/80 dark:to-slate-900 shadow-xl ring-2 ring-amber-500/25 text-amber-600 dark:text-amber-400">
                                        <KeyRound className="size-10 sm:size-12" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg border-2 border-white dark:border-slate-900">
                                        <ShieldCheck className="size-4" />
                                    </div>
                                </div>

                                <div className="space-y-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            Perbarui Kata Sandi
                                        </h1>
                                        <Badge
                                            variant="outline"
                                            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs"
                                        >
                                            <Lock className="size-3" />
                                            <span>Enkripsi Aman</span>
                                        </Badge>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                        Pastikan akun Anda menggunakan kata sandi yang kuat untuk menjaga keamanan data servis.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

                        {/* Password Form */}
                        <Form
                            {...SecurityController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }

                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="space-y-5"
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <>
                                    {/* Kata Sandi Saat Ini */}
                                    <div className="space-y-1.5 max-w-md">
                                        <Label
                                            htmlFor="current_password"
                                            className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                                        >
                                            Kata Sandi Saat Ini
                                        </Label>
                                        <PasswordInput
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-500 h-10.5 text-sm transition-colors"
                                            autoComplete="current-password"
                                            placeholder="Masukkan kata sandi lama Anda"
                                        />
                                        <InputError message={errors.current_password} />
                                    </div>

                                    {/* Grid Kata Sandi Baru & Konfirmasi */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="password"
                                                className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                                            >
                                                Kata Sandi Baru
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                ref={passwordInput}
                                                name="password"
                                                className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-500 h-10.5 text-sm transition-colors"
                                                autoComplete="new-password"
                                                placeholder="Minimal 8 karakter"
                                                passwordrules={props.passwordRules}
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label
                                                htmlFor="password_confirmation"
                                                className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                                            >
                                                Konfirmasi Kata Sandi Baru
                                            </Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                className="mt-1 block w-full rounded-xl border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-500 h-10.5 text-sm transition-colors"
                                                autoComplete="new-password"
                                                placeholder="Ulangi kata sandi baru"
                                                passwordrules={props.passwordRules}
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>
                                    </div>

                                    {/* Security Advice Callout */}
                                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-xl shrink-0 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                                <Info className="size-4.5" />
                                            </div>
                                            <div className="space-y-0.5 text-xs">
                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                    Rekomendasi Keamanan Kata Sandi:
                                                </span>
                                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    Gunakan minimal 8 karakter dengan perpaduan huruf besar, huruf kecil, angka, dan simbol unik. Hindari menggunakan informasi pribadi yang mudah ditebak.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Footer / Submit Button */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Perubahan akan langsung berlaku setelah disimpan
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {recentlySuccessful && (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                                                    <CheckCircle2 className="size-4" />
                                                    Kata sandi berhasil diperbarui!
                                                </span>
                                            )}

                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold px-6 h-10 shadow-md cursor-pointer transition-all active:scale-95 justify-center"
                                                data-test="update-password-button"
                                            >
                                                {processing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {/* Two-Factor Authentication Section */}
                {props.canManageTwoFactor && (
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <ManageTwoFactor
                            canManageTwoFactor={props.canManageTwoFactor}
                            requiresConfirmation={props.requiresConfirmation}
                            twoFactorEnabled={props.twoFactorEnabled}
                        />
                    </div>
                )}

                {/* Passkeys Section */}
                {props.canManagePasskeys && (
                    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                        <ManagePasskeys
                            canManagePasskeys={props.canManagePasskeys}
                            passkeys={props.passkeys}
                        />
                    </div>
                )}

                {/* Back to Profile Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="size-10 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200/60 dark:border-red-800/40">
                            <UserIcon className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Informasi Profil & Foto
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Ingin memperbarui nama lengkap, alamat email, atau mengganti foto profil?
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-xs font-semibold h-9 px-4 shrink-0 cursor-pointer"
                    >
                        <Link href="/settings/profile">
                            Buka Profil Saya
                        </Link>
                    </Button>
                </div>
            </main>
        </div>
    );
}

// Bypass standard sidebar/drawer layout to provide dedicated full branded experience
Security.layout = (page: React.ReactNode) => page;
