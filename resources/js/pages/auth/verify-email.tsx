// Components
import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            className="w-full h-10.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
                        >
                            {processing && <Spinner className="size-4 mr-1 text-white" />}
                            Kirim Ulang Email Verifikasi
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-xs font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                        >
                            Keluar Akun
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Email verification',
    description:
        'Please verify your email address by clicking on the link we just emailed to you.',
};
