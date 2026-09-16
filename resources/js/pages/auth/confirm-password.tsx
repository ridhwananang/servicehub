import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import PasskeyVerify from '@/components/passkey-verify';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />

            <PasskeyVerify
                routes={{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }}
                label="Confirm with passkey"
                loadingLabel="Confirming..."
                separator="Or confirm with password"
            />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Kata Sandi
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Masukkan kata sandi Anda"
                                autoComplete="current-password"
                                autoFocus
                                className="h-10 bg-slate-50/80 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus-visible:border-red-600 focus-visible:ring-red-600/20 text-xs sm:text-sm shadow-xs transition-colors"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="pt-1">
                            <Button
                                className="w-full h-10.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner className="size-4 mr-1 text-white" />}
                                Konfirmasi Kata Sandi
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Confirm password',
    description:
        'This is a secure area of the application. Please confirm your password before continuing.',
};
