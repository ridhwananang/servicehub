import React, { useState } from 'react';
import { Form, Head, Link } from '@inertiajs/react';
import { Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);

    return (
        <>
            <Head title="Masuk ke Akun - Aquos Platinum" />

            <PasskeyVerify />

            {status && (
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{status}</span>
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-3.5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-3">
                            {/* Email Field */}
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="nama@aquosplatinum.com"
                                        className="pl-8.5 h-10 bg-slate-50/80 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus-visible:border-red-600 focus-visible:ring-red-600/20 text-xs sm:text-sm shadow-xs transition-colors"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            className="text-[11px] font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline transition-colors"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 dark:text-slate-500 pointer-events-none z-10" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
                                        className="pl-8.5 h-10 bg-slate-50/80 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus-visible:border-red-600 focus-visible:ring-red-600/20 text-xs sm:text-sm shadow-xs transition-colors"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between pt-0.5">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={remember}
                                        onCheckedChange={(checked) => setRemember(Boolean(checked))}
                                        tabIndex={3}
                                        className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600 data-[state=checked]:text-white"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none font-medium"
                                    >
                                        Ingat saya di perangkat ini
                                    </Label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-10 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1 active:scale-[0.99]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="size-3.5 mr-1 text-white" />
                                        <span>Memverifikasi Akun...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Masuk ke Dashboard</span>
                                        <ArrowRight className="size-3.5 ml-0.5" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80">
                            Belum memiliki akun teknisi?{' '}
                            <Link
                                href={register()}
                                className="font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline transition-colors"
                                tabIndex={6}
                            >
                                Buat Akun Baru
                            </Link>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Masuk ke Akun Aquos Platinum',
    description: 'Akses sistem work order & notifikasi pelaporan teknisi',
};

