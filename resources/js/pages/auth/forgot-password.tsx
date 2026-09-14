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
            <Head title="Lupa Kata Sandi - ServisHub" />

            {status && (
                <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 text-center text-xs font-medium text-emerald-300">
                    {status}
                </div>
            )}

            <div className="space-y-5">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
                                    Alamat Email Terdaftar
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="nama@servishub.com"
                                    className="h-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 text-sm"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="pt-2">
                                <Button
                                    className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}
                                    <span>Kirim Tautan Reset Kata Sandi</span>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="text-center text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Sudah ingat kata sandi? </span>
                    <TextLink href={login()} className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
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
