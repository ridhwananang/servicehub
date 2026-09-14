import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Daftar Akun - ServisHub" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold text-slate-300">
                                    Nama Lengkap
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Nama teknisi / staf"
                                    className="h-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 text-sm"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-1"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-slate-300">
                                    Alamat Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="nama@servishub.com"
                                    className="h-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 text-sm"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold text-slate-300">
                                    Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Minimal 8 karakter"
                                    passwordrules={passwordRules}
                                    className="h-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 text-sm"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold text-slate-300">
                                    Konfirmasi Kata Sandi
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi kata sandi"
                                    passwordrules={passwordRules}
                                    className="h-10 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-xl focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30 text-sm"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                                tabIndex={5}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner className="size-4 mr-1" />}
                                <span>Daftar Akun Baru</span>
                            </Button>
                        </div>

                        <div className="text-center text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                            Sudah memiliki akun?{' '}
                            <TextLink href={login()} tabIndex={6} className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline">
                                Masuk ke Akun
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Daftar Akun Teknisi',
    description: 'Lengkapi formulir di bawah untuk mendaftarkan akun baru',
};
