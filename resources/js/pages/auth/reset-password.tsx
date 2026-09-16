import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <>
            <Head title="Reset password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="space-y-3.5">
                        <div className="space-y-1">
                            <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Alamat Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="h-10 bg-slate-100/80 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-xs sm:text-sm shadow-xs"
                                readOnly
                            />
                            <InputError
                                message={errors.email}
                                className="mt-1"
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Kata Sandi Baru
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="h-10 bg-slate-50/80 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus-visible:border-red-600 focus-visible:ring-red-600/20 text-xs sm:text-sm shadow-xs transition-colors"
                                autoFocus
                                placeholder="Masukkan kata sandi baru"
                                passwordrules={passwordRules}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="password_confirmation" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Konfirmasi Kata Sandi Baru
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="h-10 bg-slate-50/80 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus-visible:border-red-600 focus-visible:ring-red-600/20 text-xs sm:text-sm shadow-xs transition-colors"
                                placeholder="Ulangi kata sandi baru"
                                passwordrules={passwordRules}
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-1"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-10.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2 active:scale-[0.99]"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner className="size-4 mr-1 text-white" />}
                            Simpan Kata Sandi Baru
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = {
    title: 'Reset password',
    description: 'Please enter your new password below',
};
