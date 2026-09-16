import React, { useState, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    KeyRound,
    Mail,
    ShieldCheck,
    Sparkles,
    Trash2,
    User as UserIcon,
    Wrench,
    ZoomIn,
} from 'lucide-react';
import { toast } from 'sonner';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { AvatarPreviewDialog } from '@/components/avatar-preview-dialog';
import { send } from '@/routes/verification';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
    mustVerifyEmail: boolean;
    status?: string;
};

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const [, setSelectedImageFile] = useState<File | null>(null);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(user.avatar || null);
    const [, setIsAvatarRemoved] = useState<boolean>(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method: 'patch',
        name: user.name || '',
        email: user.email || '',
        avatar: null as File | null,
        remove_avatar: false,
    });

    const isAdmin = (user.role || 'teknisi').toLowerCase() === 'admin';
    const displayInitial = (user.name || 'U').charAt(0).toUpperCase();

    // Handle file selection with client-side instant preview
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
            toast.error('Format gambar harus JPG, PNG, atau WEBP.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran gambar melebihi batas maksimal 2MB.');
            return;
        }

        setSelectedImageFile(file);
        setData('avatar', file);
        setData('remove_avatar', false);
        setIsAvatarRemoved(false);

        const objectUrl = URL.createObjectURL(file);
        setPreviewImageUrl(objectUrl);
        toast.success('Foto baru dipilih. Klik "Simpan Perubahan" untuk menyimpan.');
    };

    // Handle photo removal
    const handleRemovePhoto = () => {
        setSelectedImageFile(null);
        setData('avatar', null);
        setData('remove_avatar', true);
        setIsAvatarRemoved(true);
        setPreviewImageUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        toast.info('Foto profil ditandai untuk dihapus. Klik "Simpan Perubahan" untuk konfirmasi.');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/settings/profile', {
            forceFormData: true,
            preserveScroll: true,
            onError: () => {
                toast.error('Gagal memperbarui profil. Periksa data yang Anda masukkan.');
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100">
            <Head title="Profil Saya - Aquos Platinum" />

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
                                Pengaturan Profil
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
                        className="rounded-xl bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold border border-red-200/80 dark:border-red-900/60 text-xs px-3.5 h-9 cursor-pointer"
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
                        className="rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold px-3.5 h-9 cursor-pointer"
                    >
                        <Link href="/settings/security" className="flex items-center gap-2">
                            <ShieldCheck className="size-3.5" />
                            <span>Keamanan & Sandi</span>
                        </Link>
                    </Button>
                </div>

                {/* Unified Master Profile Card */}
                <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {/* Top Decorative Banner */}
                    <div className="relative h-28 sm:h-40 w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-950 dark:via-zinc-900 dark:to-red-950 overflow-hidden">
                        {/* Subtle ambient decorative accents */}
                        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
                        <div className="absolute -right-8 -bottom-8 size-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                        <div className="absolute -left-8 -top-8 size-36 rounded-full bg-rose-400/20 blur-xl pointer-events-none" />

                        <div className="absolute top-3.5 right-4 sm:top-4 sm:right-6">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white/95 border border-white/15 shadow-xs">
                                <Sparkles className="size-3 text-amber-300" />
                                <span>Akun Resmi Aquos</span>
                            </span>
                        </div>
                    </div>

                    {/* Card Content with Overlapping Avatar */}
                    <div className="px-5 sm:px-8 pb-7 sm:pb-9 pt-0">
                        {/* Header Row: Overlapping Avatar + Metadata + Quick Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-6">
                            {/* Avatar with Camera Trigger & Metadata */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                                <div className="relative group shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsPreviewModalOpen(true)}
                                        title={previewImageUrl ? 'Klik untuk melihat foto ukuran penuh' : 'Foto Profil'}
                                        className="relative flex size-24 sm:size-28 items-center justify-center overflow-hidden rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-red-500/25"
                                    >
                                        {previewImageUrl ? (
                                            <img
                                                src={previewImageUrl}
                                                alt={user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-3xl sm:text-4xl font-black text-slate-700 dark:text-slate-200">
                                                {displayInitial}
                                            </span>
                                        )}
                                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full text-white">
                                            <ZoomIn className="size-6" />
                                        </div>
                                    </button>

                                    {/* Camera Badge to Quickly Pick Image */}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        title="Pilih dan unggah foto baru"
                                        className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg border-2 border-white dark:border-slate-900 transition-transform active:scale-95 cursor-pointer"
                                    >
                                        <Camera className="size-3.5" />
                                    </button>
                                </div>

                                {/* User Titles & Role Badge */}
                                <div className="space-y-1 min-w-0">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {user.name}
                                        </h1>
                                        <Badge
                                            variant="outline"
                                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                                                isAdmin
                                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                            }`}
                                        >
                                            {isAdmin ? (
                                                <ShieldCheck className="size-3" />
                                            ) : (
                                                <Wrench className="size-3" />
                                            )}
                                            <span>{isAdmin ? 'Administrator' : 'Teknisi Lapangan'}</span>
                                        </Badge>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                                        {user.email}
                                    </p>
                                    {user.created_at && (
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                            Bergabung sejak{' '}
                                            {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Avatar Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 pt-1 sm:pt-0">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                    id="profile-avatar-upload"
                                />

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-xs font-semibold cursor-pointer h-9 px-3 shadow-2xs"
                                >
                                    <Camera className="size-3.5 mr-1.5 text-slate-600 dark:text-slate-300" />
                                    <span>{previewImageUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
                                </Button>

                                {previewImageUrl && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsPreviewModalOpen(true)}
                                            className="rounded-xl border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-xs font-semibold cursor-pointer h-9 px-3 shadow-2xs"
                                            title="Lihat foto ukuran penuh"
                                        >
                                            <ZoomIn className="size-3.5 mr-1.5 text-slate-600 dark:text-slate-300" />
                                            <span>Lihat</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRemovePhoto}
                                            className="rounded-xl border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/60 text-xs font-semibold cursor-pointer h-9 px-3 shadow-2xs"
                                            title="Hapus foto dan gunakan inisial nama"
                                        >
                                            <Trash2 className="size-3.5 mr-1.5" />
                                            <span>Hapus</span>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Validation Error if any for Avatar */}
                        {errors.avatar && (
                            <div className="mb-4">
                                <InputError message={errors.avatar} />
                            </div>
                        )}

                        <div className="my-6 border-t border-slate-100 dark:border-slate-800" />

                        {/* Profile Details Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Informasi Akun & Kontak
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Pastikan nama lengkap dan alamat email Anda sesuai untuk keperluan verifikasi dan penugasan servis.
                                </p>
                            </div>

                            {/* 2-Column Responsive Form Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                {/* Nama Lengkap */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Nama Lengkap
                                    </Label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                            <UserIcon className="size-4" />
                                        </div>
                                        <Input
                                            id="name"
                                            className="pl-9 rounded-xl border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-500 h-10.5 text-sm transition-colors"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            autoComplete="name"
                                            placeholder="Nama lengkap Anda"
                                        />
                                    </div>
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Alamat Email
                                    </Label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                            <Mail className="size-4" />
                                        </div>
                                        <Input
                                            id="email"
                                            type="email"
                                            className="pl-9 rounded-xl border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-red-500 h-10.5 text-sm transition-colors"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoComplete="username"
                                            placeholder="email@aquosplatinum.com"
                                        />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>
                            </div>

                            {/* Read-only Role Info Banner */}
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/70">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-xl shrink-0 ${isAdmin ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                                        {isAdmin ? <ShieldCheck className="size-5" /> : <Wrench className="size-5" />}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Hak Akses Sistem:
                                            </span>
                                            <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                                {isAdmin ? 'Administrator' : 'Teknisi Lapangan'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {isAdmin
                                                ? 'Anda memiliki hak akses penuh administrator untuk mengelola seluruh tiket servis, jadwal teknisi, data pelanggan, serta manajemen akun staf.'
                                                : 'Anda terdaftar sebagai teknisi lapangan resmi Aquos Platinum untuk melihat penugasan tiket servis dan memperbarui status pengerjaan.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {mustVerifyEmail && user.email_verified_at === null && (
                                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800/60">
                                    <p className="text-xs text-amber-800 dark:text-amber-300">
                                        Alamat email Anda belum terverifikasi.{' '}
                                        <Link
                                            href={send()}
                                            as="button"
                                            className="font-bold underline hover:text-amber-900 dark:hover:text-amber-200 cursor-pointer"
                                        >
                                            Kirim ulang tautan verifikasi
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-xs font-semibold text-green-700 dark:text-green-400">
                                            Tautan verifikasi baru telah dikirimkan ke email Anda.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Submit Button & Status */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                    Format foto: JPG, PNG, WEBP (maks. 2MB)
                                </div>

                                <div className="flex items-center gap-3">
                                    {recentlySuccessful && (
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                                            <CheckCircle2 className="size-4" />
                                            Perubahan tersimpan!
                                        </span>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold px-6 h-10 shadow-md cursor-pointer transition-all active:scale-95 justify-center"
                                    >
                                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Password & Security Quick Card */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="size-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/60 dark:border-amber-800/40">
                            <KeyRound className="size-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Keamanan & Kata Sandi
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Perbarui kata sandi akun atau aktifkan otentikasi dua faktor untuk mengamankan akun.
                            </p>
                        </div>
                    </div>
                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 text-xs font-semibold h-9 px-4 shrink-0 cursor-pointer"
                    >
                        <Link href="/settings/security">
                            Kelola Keamanan
                        </Link>
                    </Button>
                </div>

                {/* Account Deletion Section */}
                <div className="rounded-3xl border border-red-100 bg-white p-5 sm:p-6 shadow-xs dark:border-red-950/50 dark:bg-slate-900">
                    <DeleteUser />
                </div>
            </main>

            {/* Frameless Floating Lightbox Avatar Preview Dialog */}
            <AvatarPreviewDialog
                isOpen={isPreviewModalOpen}
                onClose={() => setIsPreviewModalOpen(false)}
                user={{
                    name: data.name || user.name,
                    email: data.email || user.email,
                    role: user.role,
                    avatar: previewImageUrl,
                }}
            />
        </div>
    );
}

// Bypass standard sidebar/drawer and breadcrumbs header layout
Profile.layout = (page: React.ReactNode) => page;
