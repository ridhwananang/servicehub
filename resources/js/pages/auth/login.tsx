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
            <Head title="Masuk ke Akun - ServisHub" />

            <PasskeyVerify />

            {status && (
                <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-xs font-medium text-emerald-300">
                    <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
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
                                <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
                                    Alamat Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
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
                                        placeholder="nama@servishub.com"
                                        className="pl-8.5 h-9.5 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 text-xs sm:text-sm"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold text-slate-300">
                                        Kata Sandi
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={request()}
                                            className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                                            tabIndex={5}
                                        >
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none z-10" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Masukkan kata sandi"
                                        className="pl-8.5 h-9.5 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 text-xs sm:text-sm"
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
                                        className="border-slate-700 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-[11px] sm:text-xs text-slate-300 cursor-pointer select-none font-medium"
                                    >
                                        Ingat saya di perangkat ini
                                    </Label>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="size-3.5 mr-1" />
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
                        <div className="text-center text-[11px] sm:text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                            Belum memiliki akun teknisi?{' '}
                            <Link
                                href={register()}
                                className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
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
    title: 'Masuk ke Akun ServisHub',
    description: 'Akses sistem work order & notifikasi pelaporan teknisi',
};
