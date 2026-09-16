// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Lupa Kata Sandi - Aquos Platinum" />

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-center text-xs font-medium text-emerald-800 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <div className="space-y-4">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Alamat Email Terdaftar
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="nama@aquosplatinum.com"
                                    className="h-10 bg-slate-50/80 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus-visible:border-red-600 focus-visible:ring-red-600/20 text-xs sm:text-sm shadow-xs transition-colors"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="pt-2">
                                <Button
                                    className="w-full h-10.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="size-4 animate-spin text-white" />
                                    )}
                                    <span>Kirim Tautan Reset Kata Sandi</span>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                    <span>Sudah ingat kata sandi? </span>
                    <TextLink href={login()} className="font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline">
                        Kembali ke Halaman Masuk
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Lupa Kata Sandi',
    description: 'Masukkan alamat email Anda untuk menerima tautan pemulihan kata sandi',
};
