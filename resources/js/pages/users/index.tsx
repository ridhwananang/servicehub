import React, { useState, useMemo, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Camera,
    CheckCircle2,
    Eye,
    KeyRound,
    LayoutGrid,
    Mail,
    Pencil,
    Plus,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Table as TableIcon,
    Trash2,
    User as UserIcon,
    Users,
    Wrench,
    X,
    ZoomIn,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AvatarPreviewDialog } from '@/components/avatar-preview-dialog';
import InputError from '@/components/input-error';
import type { User, UserRole } from '@/types/auth';

type ViewMode = 'auto' | 'table' | 'cards';

interface UsersPageProps {
    users: User[];
    stats: {
        total: number;
        admin_count: number;
        teknisi_count: number;
    };
    filters?: {
        search?: string;
        role?: string;
    };
    auth: {
        user: User;
    };
}

export default function UsersIndex({
    users = [],
    stats = { total: 0, admin_count: 0, teknisi_count: 0 },
    filters,
    auth,
}: UsersPageProps) {
    const loggedInUser = auth.user;

    // Filters state
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || 'semua');
    const [viewMode, setViewMode] = useState<ViewMode>('auto');

    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [previewUser, setPreviewUser] = useState<User | null>(null);

    // Create user form
    const createFileInputRef = useRef<HTMLInputElement>(null);
    const [createAvatarPreview, setCreateAvatarPreview] = useState<string | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        role: 'teknisi' as UserRole,
        password: '',
        password_confirmation: '',
        avatar: null as File | null,
    });

    // Edit user form
    const editFileInputRef = useRef<HTMLInputElement>(null);
    const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);

    const editForm = useForm({
        _method: 'put',
        name: '',
        email: '',
        role: 'teknisi' as UserRole,
        password: '',
        password_confirmation: '',
        avatar: null as File | null,
        remove_avatar: false,
    });

    // Delete user form
    const deleteForm = useForm({});

    // Filtered user list
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch =
                !searchQuery ||
                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesRole =
                roleFilter === 'semua' || (u.role || 'teknisi').toLowerCase() === roleFilter.toLowerCase();

            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    // Create User Handlers
    const handleOpenCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setCreateAvatarPreview(null);
        setIsCreateOpen(true);
    };

    const handleCreateAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
            toast.error('Format foto harus JPG, PNG, atau WEBP.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran foto melebihi 2MB.');
            return;
        }

        createForm.setData('avatar', file);
        setCreateAvatarPreview(URL.createObjectURL(file));
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/users', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
                setCreateAvatarPreview(null);
                toast.success('Pengguna baru berhasil ditambahkan!');
            },
            onError: () => {
                toast.error('Gagal menambahkan pengguna. Periksa formulir.');
            },
        });
    };

    // Edit User Handlers
    const handleOpenEdit = (target: User) => {
        setUserToEdit(target);
        editForm.reset();
        editForm.clearErrors();
        editForm.setData({
            _method: 'put',
            name: target.name,
            email: target.email,
            role: (target.role || 'teknisi') as UserRole,
            password: '',
            password_confirmation: '',
            avatar: null,
            remove_avatar: false,
        });
        setEditAvatarPreview(target.avatar || null);
    };

    const handleEditAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
            toast.error('Format foto harus JPG, PNG, atau WEBP.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Ukuran foto melebihi 2MB.');
            return;
        }

        editForm.setData('avatar', file);
        editForm.setData('remove_avatar', false);
        setEditAvatarPreview(URL.createObjectURL(file));
    };

    const handleEditRemoveAvatar = () => {
        editForm.setData('avatar', null);
        editForm.setData('remove_avatar', true);
        setEditAvatarPreview(null);
        if (editFileInputRef.current) {
            editFileInputRef.current.value = '';
        }
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToEdit) return;

        editForm.post(`/users/${userToEdit.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setUserToEdit(null);
                toast.success('Data pengguna berhasil diperbarui!');
            },
            onError: (err) => {
                const msg = err.role || err.name || err.email || 'Gagal memperbarui data pengguna.';
                toast.error(msg);
            },
        });
    };

    // Delete User Handler
    const handleDeleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userToDelete) return;

        deleteForm.delete(`/users/${userToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setUserToDelete(null);
                toast.success('Pengguna berhasil dihapus!');
            },
            onError: (err) => {
                toast.error(err.delete || 'Gagal menghapus pengguna.');
            },
        });
    };

    return (
        <div className="min-h-screen bg-slate-50/70 font-sans text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100">
            <Head title="Manajemen Pengguna - Aquos Platinum" />

            {/* Top Bar Header */}
            <header className="sticky top-0 z-40 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-950 dark:via-red-900 dark:to-red-950 text-white shadow-lg shadow-red-950/20 border-b border-red-500/40 dark:border-red-800/60 backdrop-blur-md">
                <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 hover:text-white rounded-xl h-9 px-2.5 sm:px-3.5 shrink-0 border border-white/25 bg-white/10 active:scale-95 transition-all"
                        >
                            <Link href="/dashboard" className="flex items-center gap-1.5 text-xs font-semibold">
                                <ArrowLeft className="size-4 shrink-0" />
                                <span className="hidden sm:inline">Kembali ke Dashboard</span>
                                <span className="inline sm:hidden">Dashboard</span>
                            </Link>
                        </Button>
                        <div className="h-5 sm:h-6 w-px bg-white/25 hidden xs:block shrink-0" />
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <Users className="size-4.5 sm:size-5 text-white/90 shrink-0" />
                            <span className="font-black text-xs xs:text-sm sm:text-base tracking-tight text-white truncate">
                                Manajemen Pengguna
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <ThemeToggle className="bg-white/15 hover:bg-white/25 border-white/25 text-white dark:bg-black/35 dark:hover:bg-black/50 dark:border-white/20 h-8 sm:h-9 w-8 sm:w-9" />
                        <Button
                            onClick={handleOpenCreate}
                            className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-white text-red-700 hover:bg-red-50 text-xs font-bold shadow-md cursor-pointer transition-transform active:scale-95 px-2.5 sm:px-4 h-8 sm:h-9 shrink-0"
                        >
                            <Plus className="size-4 shrink-0" />
                            <span className="hidden xs:inline">Tambah User</span>
                            <span className="inline xs:hidden">Tambah</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="mx-auto max-w-7xl px-3.5 py-4 sm:px-6 sm:py-7 lg:px-8 space-y-4 sm:space-y-6">
                {/* Title & Description */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                            Daftar Pengguna & Hak Akses
                        </h1>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                            Kelola akun teknisi lapangan dan administrator sistem Aquos Platinum.
                        </p>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-right pt-0.5 sm:pt-0">
                        <span>Login sebagai: </span>
                        <strong className="font-bold text-slate-800 dark:text-slate-200">
                            {loggedInUser.name} ({loggedInUser.role || 'Admin'})
                        </strong>
                    </div>
                </div>

                {/* 3 Summary Stats Cards (Harmonized with Dashboard StatsGrid) */}
                <section aria-label="Ringkasan Statistik Pengguna">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5">
                        {/* Card 1: Total Pengguna (Crimson Red / Ruby Gradient) */}
                        <div className="col-span-2 sm:col-span-1 relative overflow-hidden rounded-xl sm:rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50/90 via-white to-rose-50/50 p-2.5 sm:p-4 lg:p-5 shadow-xs shadow-red-950/5 dark:border-red-900/50 dark:bg-gradient-to-br dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-red-950/35 dark:shadow-black/60 flex flex-col justify-between transition-all hover:shadow-md">
                            {/* Glowing Top Accent Line */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
                                        Total Pengguna
                                    </span>
                                    <div
                                        aria-hidden="true"
                                        className="hidden xs:flex size-5 sm:size-7 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400 border border-red-200/60 dark:border-red-800/60 shrink-0 shadow-2xs"
                                    >
                                        <Users className="size-3 sm:size-4" />
                                    </div>
                                </div>
                                <div
                                    aria-label={`Total pengguna ${stats.total}`}
                                    className="mt-1 sm:mt-2 text-lg xs:text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 dark:text-white"
                                >
                                    {stats.total}
                                </div>
                            </div>
                            <div className="mt-1.5 sm:mt-3 flex items-center gap-1 sm:gap-1.5 text-[9px] xs:text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 leading-tight">
                                <ShieldCheck className="size-3 sm:size-3.5 text-red-500 dark:text-red-400 shrink-0" aria-hidden="true" />
                                <span className="truncate">Semua aktif</span>
                            </div>
                        </div>

                        {/* Card 2: Teknisi Lapangan (Emerald / Teal Gradient) */}
                        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/50 p-2.5 sm:p-4 lg:p-5 shadow-xs shadow-emerald-950/5 dark:border-emerald-900/50 dark:bg-gradient-to-br dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-emerald-950/35 dark:shadow-black/60 flex flex-col justify-between transition-all hover:shadow-md">
                            {/* Glowing Top Accent Line */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600" />

                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
                                        Teknisi
                                    </span>
                                    <div
                                        aria-hidden="true"
                                        className="hidden xs:flex size-5 sm:size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0 shadow-2xs"
                                    >
                                        <Wrench className="size-3 sm:size-4" />
                                    </div>
                                </div>
                                <div
                                    aria-label={`Jumlah teknisi ${stats.teknisi_count}`}
                                    className="mt-1 sm:mt-2 text-lg xs:text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600 dark:text-emerald-400"
                                >
                                    {stats.teknisi_count}
                                </div>
                            </div>
                            <div className="mt-1.5 sm:mt-3 text-[9px] xs:text-[10px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                                {stats.total > 0 ? Math.round((stats.teknisi_count / stats.total) * 100) : 0}% total
                            </div>
                        </div>

                        {/* Card 3: Administrator (Indigo / Blue Gradient) */}
                        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/50 p-2.5 sm:p-4 lg:p-5 shadow-xs shadow-indigo-950/5 dark:border-indigo-900/50 dark:bg-gradient-to-br dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-indigo-950/35 dark:shadow-black/60 flex flex-col justify-between transition-all hover:shadow-md">
                            {/* Glowing Top Accent Line */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600" />

                            <div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
                                        Admin
                                    </span>
                                    <div
                                        aria-hidden="true"
                                        className="hidden xs:flex size-5 sm:size-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 shrink-0 shadow-2xs"
                                    >
                                        <ShieldCheck className="size-3 sm:size-4" />
                                    </div>
                                </div>
                                <div
                                    aria-label={`Jumlah administrator ${stats.admin_count}`}
                                    className="mt-1 sm:mt-2 text-lg xs:text-2xl sm:text-3xl lg:text-4xl font-black text-indigo-600 dark:text-indigo-400"
                                >
                                    {stats.admin_count}
                                </div>
                            </div>
                            <div className="mt-1.5 sm:mt-3 text-[9px] xs:text-[10px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-400 truncate">
                                {stats.total > 0 ? Math.round((stats.admin_count / stats.total) * 100) : 0}% wewenang
                            </div>
                        </div>
                    </div>
                </section>

                {/* Unified Filter & Action Bar (Harmonized with Dashboard FilterBar) */}
                <section
                    aria-label="Pencarian dan Filter Pengguna"
                    className="rounded-xl sm:rounded-2xl border border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/40 to-zinc-50/80 p-2 sm:p-2.5 shadow-xs dark:border-zinc-800/80 dark:bg-gradient-to-b dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-950/95"
                >
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                        {/* Left: Search Input & Role Filter */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-1 min-w-0">
                            {/* Search Input with Clear Button */}
                            <div className="relative flex-1 sm:flex-none sm:w-60 lg:w-64 xl:w-72 min-w-[140px]">
                                <Search
                                    className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
                                    aria-hidden="true"
                                />
                                <Input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari Nama, Email..."
                                    aria-label="Cari pengguna"
                                    className="h-9 rounded-xl pl-8.5 pr-7 text-xs font-medium border-slate-200 bg-slate-50/50 focus:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:focus:bg-slate-950"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        aria-label="Hapus pencarian"
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                    >
                                        <X className="size-3" />
                                    </button>
                                )}
                            </div>

                            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0 hidden sm:block" />

                            {/* Role Filter Dropdown */}
                            <select
                                aria-label="Filter peran pengguna"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shrink-0 cursor-pointer"
                            >
                                <option value="semua" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Peran: Semua ({users.length})</option>
                                <option value="teknisi" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Teknisi ({stats.teknisi_count})</option>
                                <option value="admin" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Administrator ({stats.admin_count})</option>
                            </select>
                        </div>

                        {/* Right: View Switcher & Action Button */}
                        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 pt-1 sm:pt-0 border-t border-slate-100 dark:border-slate-800/80 sm:border-t-0">
                            {/* View Switcher: Auto / Table / Cards */}
                            <div
                                role="group"
                                aria-label="Pilihan tampilan data"
                                className="flex items-center rounded-xl border border-slate-200 p-0.5 bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800 h-9 shrink-0"
                            >
                                <button
                                    type="button"
                                    onClick={() => setViewMode('table')}
                                    title="Tampilan Tabel Lengkap"
                                    aria-pressed={viewMode === 'table'}
                                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all cursor-pointer ${
                                        viewMode === 'table'
                                            ? 'bg-white text-red-600 shadow-xs dark:bg-slate-700 dark:text-red-400'
                                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    <TableIcon className="size-3.5" aria-hidden="true" />
                                    <span className="hidden sm:inline text-[11px]">Tabel</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('cards')}
                                    title="Tampilan Kartu Responsif"
                                    aria-pressed={viewMode === 'cards'}
                                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all cursor-pointer ${
                                        viewMode === 'cards'
                                            ? 'bg-white text-red-600 shadow-xs dark:bg-slate-700 dark:text-red-400'
                                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    <LayoutGrid className="size-3.5" aria-hidden="true" />
                                    <span className="hidden sm:inline text-[11px]">Kartu</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('auto')}
                                    title="Tampilan Otomatis"
                                    aria-pressed={viewMode === 'auto'}
                                    className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                                        viewMode === 'auto'
                                            ? 'bg-white text-red-600 shadow-xs dark:bg-slate-700 dark:text-red-400'
                                            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                                    }`}
                                >
                                    Auto
                                </button>
                            </div>

                            {/* Tambah User Button */}
                            <Button
                                type="button"
                                onClick={handleOpenCreate}
                                aria-label="Tambah Pengguna Baru"
                                className="h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs px-2.5 sm:px-3 flex items-center justify-center gap-1.5 shadow-xs shadow-red-600/20 cursor-pointer shrink-0 active:scale-95 transition-transform"
                            >
                                <Plus className="size-3.5 shrink-0" aria-hidden="true" />
                                <span>Tambah</span>
                                <span className="hidden sm:inline">User</span>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Desktop Table View (Harmonized with TicketTableView) */}
                <section
                    aria-label="Tabel Data Pengguna"
                    className={`overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/30 to-zinc-50/60 shadow-xs dark:border-zinc-800/80 dark:bg-gradient-to-b dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-950/95 ${
                        viewMode === 'table'
                            ? 'block'
                            : viewMode === 'cards'
                            ? 'hidden'
                            : 'hidden md:block'
                    }`}
                >
                    <div className="overflow-x-auto custom-scrollbar pb-1">
                        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                            <thead className="border-b border-red-950/40 bg-gradient-to-r from-zinc-950 via-red-600 to-zinc-950 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs dark:border-zinc-800/80 dark:from-black dark:via-red-800 dark:to-black">
                                <tr>
                                    <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">PENGGUNA</th>
                                    <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">EMAIL</th>
                                    <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">PERAN (ROLE)</th>
                                    <th scope="col" className="px-3.5 py-3.5 whitespace-nowrap">TERDAFTAR SEJAK</th>
                                    <th scope="col" className="px-3.5 py-3.5 text-right whitespace-nowrap">AKSI</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                                            <Users className="size-8 mx-auto stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
                                            <span>Tidak ada pengguna yang cocok dengan kriteria pencarian atau filter.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((item) => {
                                        const itemRole = (item.role || 'teknisi').toLowerCase();
                                        const isItemAdmin = itemRole === 'admin';
                                        const initial = (item.name || 'U').charAt(0).toUpperCase();
                                        const isSelf = loggedInUser.id === item.id;

                                        return (
                                            <tr
                                                key={item.id}
                                                className="group hover:bg-red-50/30 dark:hover:bg-red-950/20 transition-colors"
                                            >
                                                {/* Name & Avatar */}
                                                <td className="px-3.5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setPreviewUser(item)}
                                                            title="Klik untuk melihat foto"
                                                            className="relative size-9 shrink-0 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 cursor-pointer group hover:ring-2 hover:ring-red-400 transition-all shadow-2xs"
                                                        >
                                                            {item.avatar ? (
                                                                <img
                                                                    src={item.avatar}
                                                                    alt={item.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span>{initial}</span>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                                                                <ZoomIn className="size-3 text-white" />
                                                            </div>
                                                        </button>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                <span className="truncate">{item.name}</span>
                                                                {isSelf && (
                                                                    <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-600 dark:text-zinc-300 px-1.5 py-0.2 border border-zinc-200/80 dark:border-zinc-700/80">
                                                                        Anda
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[11px] font-mono text-slate-400">
                                                                ID #{item.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Email */}
                                                <td className="px-3.5 py-3 text-slate-600 dark:text-slate-300 font-medium">
                                                    {item.email}
                                                </td>

                                                {/* Role */}
                                                <td className="px-3.5 py-3">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border shrink-0 ${
                                                            isItemAdmin
                                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                                                        }`}
                                                    >
                                                        {isItemAdmin ? (
                                                            <ShieldCheck className="size-3" />
                                                        ) : (
                                                            <Wrench className="size-3" />
                                                        )}
                                                        <span>{isItemAdmin ? 'Administrator' : 'Teknisi'}</span>
                                                    </span>
                                                </td>

                                                {/* Created At */}
                                                <td className="px-3.5 py-3 text-slate-500 dark:text-slate-400">
                                                    {item.created_at
                                                        ? new Date(item.created_at).toLocaleDateString('id-ID', {
                                                              day: 'numeric',
                                                              month: 'short',
                                                              year: 'numeric',
                                                          })
                                                        : '-'}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-3.5 py-3 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => handleOpenEdit(item)}
                                                            aria-label={`Edit pengguna ${item.name}`}
                                                            title="Edit Pengguna"
                                                            className="size-8 rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 dark:text-zinc-300 dark:hover:bg-amber-950/50 dark:hover:text-amber-300 cursor-pointer active:scale-95 transition-all"
                                                        >
                                                            <Pencil className="size-3.5" aria-hidden="true" />
                                                        </Button>

                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="icon"
                                                            disabled={isSelf}
                                                            onClick={() => setUserToDelete(item)}
                                                            aria-label={`Hapus pengguna ${item.name}`}
                                                            title={isSelf ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Pengguna'}
                                                            className={`size-8 rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 dark:text-zinc-400 dark:hover:bg-red-950/50 dark:hover:text-red-400 cursor-pointer active:scale-95 transition-all ${
                                                                isSelf ? 'opacity-30 cursor-not-allowed' : ''
                                                            }`}
                                                        >
                                                            <Trash2 className="size-3.5" aria-hidden="true" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* User Cards Grid View (Harmonized with TicketCardItem) */}
                <section
                    aria-label="Daftar Kartu Pengguna"
                    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 ${
                        viewMode === 'cards'
                            ? 'grid'
                            : viewMode === 'table'
                            ? 'hidden'
                            : 'grid md:hidden'
                    }`}
                >
                    {filteredUsers.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-zinc-200/80 bg-white p-8 text-center text-slate-400 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                            <Users className="size-8 mx-auto stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
                            <p className="text-xs">Tidak ada pengguna yang cocok.</p>
                        </div>
                    ) : (
                        filteredUsers.map((item) => {
                            const itemRole = (item.role || 'teknisi').toLowerCase();
                            const isItemAdmin = itemRole === 'admin';
                            const initial = (item.name || 'U').charAt(0).toUpperCase();
                            const isSelf = loggedInUser.id === item.id;
                            const accentGradient = isItemAdmin
                                ? 'from-indigo-600 via-blue-500 to-indigo-600'
                                : 'from-emerald-500 via-teal-500 to-emerald-600';

                            const formattedDate = item.created_at
                                ? new Date(item.created_at).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                  })
                                : '-';

                            return (
                                <article
                                    key={item.id}
                                    aria-label={`Pengguna ${item.name}`}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-3.5 sm:p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800/90 dark:bg-zinc-900/95 dark:hover:border-zinc-700 dark:hover:shadow-black/50"
                                >
                                    {/* Glowing Top Accent Line */}
                                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${accentGradient}`} />

                                    <div className="space-y-2.5 sm:space-y-3">
                                        {/* Top Meta Row: Role Badge & ID */}
                                        <div className="flex items-center justify-between gap-2 pt-0.5">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border shrink-0 ${
                                                        isItemAdmin
                                                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60'
                                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                                                    }`}
                                                >
                                                    {isItemAdmin ? (
                                                        <ShieldCheck className="size-3" />
                                                    ) : (
                                                        <Wrench className="size-3" />
                                                    )}
                                                    <span>{isItemAdmin ? 'Administrator' : 'Teknisi'}</span>
                                                </span>

                                                {isSelf && (
                                                    <span className="font-mono text-[10px] font-bold text-zinc-900 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200/80 dark:border-zinc-700/80 shrink-0">
                                                        Akun Anda
                                                    </span>
                                                )}
                                            </div>

                                            <div className="font-mono text-[11px] text-zinc-400 shrink-0">
                                                ID #{item.id}
                                            </div>
                                        </div>

                                        {/* User Info Header: Avatar, Name, Email */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewUser(item)}
                                                title="Klik untuk melihat foto"
                                                className="relative size-12 shrink-0 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-zinc-700 dark:text-zinc-200 cursor-pointer shadow-xs active:scale-95 transition-transform group"
                                            >
                                                {item.avatar ? (
                                                    <img
                                                        src={item.avatar}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{initial}</span>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                                                    <ZoomIn className="size-3.5 text-white" />
                                                </div>
                                            </button>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-sm sm:text-base text-zinc-900 hover:text-red-600 dark:text-white dark:hover:text-red-400 truncate transition-colors">
                                                    {item.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                                    <Mail className="size-3 shrink-0 text-zinc-400" />
                                                    <span className="truncate">{item.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Specification Pod */}
                                        <div className="rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 p-2.5 text-xs border border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                                            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                                                <span className="text-[11px] flex items-center gap-1">
                                                    <Calendar className="size-3 text-red-500" />
                                                    Terdaftar:
                                                </span>
                                                <span className="font-medium text-zinc-900 dark:text-zinc-200 font-mono text-[11px]">
                                                    {formattedDate}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
                                                <span className="text-[11px] flex items-center gap-1">
                                                    <Shield className="size-3 text-zinc-400" />
                                                    Hak Akses:
                                                </span>
                                                <span className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                                                    {isItemAdmin ? 'Akses Penuh & User' : 'Pengerjaan Tiket Lapangan'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Section: Photo Button & Action Buttons */}
                                    <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                                        {/* Foto Button */}
                                        <button
                                            type="button"
                                            onClick={() => setPreviewUser(item)}
                                            aria-label={`Buka foto pengguna ${item.name}`}
                                            className={`flex items-center gap-1.5 rounded-xl sm:rounded-lg px-3 sm:px-2.5 h-9 sm:h-8 text-xs font-medium border transition-all cursor-pointer active:scale-95 ${
                                                item.avatar
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                                    : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700'
                                            }`}
                                        >
                                            <Camera className="size-3.5 shrink-0" aria-hidden="true" />
                                            <span className="text-[11px]">
                                                {item.avatar ? 'Lihat Foto' : 'Tanpa Foto'}
                                            </span>
                                        </button>

                                        {/* Action Buttons Group */}
                                        <div className="flex items-center gap-1.5 sm:gap-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenEdit(item)}
                                                aria-label={`Edit pengguna ${item.name}`}
                                                title="Edit Pengguna"
                                                className="h-9 sm:h-8 px-3 sm:px-2.5 rounded-xl sm:rounded-lg border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 dark:text-zinc-300 dark:hover:bg-amber-950/50 dark:hover:text-amber-300 cursor-pointer active:scale-95 transition-all text-xs font-semibold flex items-center gap-1"
                                            >
                                                <Pencil className="size-3.5 sm:size-3 mr-0.5" />
                                                <span>Edit</span>
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                disabled={isSelf}
                                                onClick={() => setUserToDelete(item)}
                                                aria-label={`Hapus pengguna ${item.name}`}
                                                title={isSelf ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Pengguna'}
                                                className={`h-9 sm:h-8 px-3 sm:px-2.5 rounded-xl sm:rounded-lg border-zinc-200 dark:border-zinc-700 cursor-pointer active:scale-95 transition-all text-xs font-semibold flex items-center gap-1 ${
                                                    isSelf
                                                        ? 'opacity-30 cursor-not-allowed'
                                                        : 'text-zinc-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 dark:text-zinc-400 dark:hover:bg-red-950/50 dark:hover:text-red-400'
                                                }`}
                                            >
                                                <Trash2 className="size-3.5 sm:size-3 mr-0.5" />
                                                <span>Hapus</span>
                                            </Button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </section>
            </main>

            {/* Modal Tambah Pengguna Baru */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md sm:max-w-lg w-[calc(100vw-2rem)] sm:w-full max-h-[88dvh] overflow-y-auto custom-scrollbar p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl focus:outline-hidden">
                    <DialogHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                                <Plus className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    Tambah Pengguna Baru
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Tambahkan akun teknisi atau admin baru untuk mengakses sistem.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        {/* Avatar Upload Pod */}
                        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-800/80 dark:bg-slate-950/60 flex flex-col items-center text-center gap-3">
                            <div className="relative group">
                                <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-full border-3 border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md ring-2 ring-red-500/20 dark:ring-red-400/20 flex items-center justify-center">
                                    {createAvatarPreview ? (
                                        <img
                                            src={createAvatarPreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover select-none"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                            <UserIcon className="size-10 stroke-1" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => createFileInputRef.current?.click()}
                                    title="Pilih Foto"
                                    className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md border-2 border-white dark:border-slate-900 transition-transform active:scale-95 cursor-pointer"
                                >
                                    <Camera className="size-3.5" />
                                </button>
                            </div>

                            <div className="space-y-2 w-full flex flex-col items-center">
                                <div>
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Foto Profil (Opsional)
                                    </Label>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        Format JPG, PNG, atau WEBP (Maksimal 2MB)
                                    </p>
                                </div>

                                <input
                                    type="file"
                                    ref={createFileInputRef}
                                    onChange={handleCreateAvatarChange}
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                />

                                <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => createFileInputRef.current?.click()}
                                        className="h-8.5 px-3.5 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                                    >
                                        <Camera className="size-3.5 text-slate-600 dark:text-slate-300" />
                                        <span>{createAvatarPreview ? 'Ganti Foto' : 'Pilih Foto'}</span>
                                    </Button>

                                    {createAvatarPreview && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                createForm.setData('avatar', null);
                                                setCreateAvatarPreview(null);
                                                if (createFileInputRef.current) createFileInputRef.current.value = '';
                                            }}
                                            className="h-8.5 px-3.5 rounded-xl border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                                        >
                                            <Trash2 className="size-3.5 text-red-500" />
                                            <span>Hapus</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Nama Lengkap */}
                        <div className="space-y-1">
                            <Label htmlFor="create_name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="create_name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: Budi Santoso"
                                required
                                className="rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 h-9.5 text-xs focus:ring-2 focus:ring-red-500"
                            />
                            <InputError message={createForm.errors.name} />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <Label htmlFor="create_email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Alamat Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="create_email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                placeholder="teknisi@aquosplatinum.com"
                                required
                                className="rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 h-9.5 text-xs focus:ring-2 focus:ring-red-500"
                            />
                            <InputError message={createForm.errors.email} />
                        </div>

                        {/* Interactive Role Card Selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Peran Akun (Role) <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => createForm.setData('role', 'teknisi')}
                                    className={`flex flex-col text-left p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                                        createForm.data.role === 'teknisi'
                                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                                            <Wrench className="size-3.5 text-emerald-600" />
                                            <span>Teknisi</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
                                            Default
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Hanya mengerjakan & update tiket servis lapangan.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => createForm.setData('role', 'admin')}
                                    className={`flex flex-col text-left p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                                        createForm.data.role === 'admin'
                                            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 shadow-xs'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                                            <ShieldCheck className="size-3.5 text-indigo-600" />
                                            <span>Administrator</span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 bg-indigo-100/70 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800">
                                            Penuh
                                        </Badge>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Wewenang penuh termasuk tambah & kelola user.
                                    </p>
                                </button>
                            </div>
                            <InputError message={createForm.errors.role} />
                        </div>

                        {/* Password & Confirm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="create_password" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Kata Sandi <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create_password"
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    required
                                    className="rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 h-9.5 text-xs"
                                />
                                <InputError message={createForm.errors.password} />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="create_password_confirmation" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                    Konfirmasi Sandi <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="create_password_confirmation"
                                    type="password"
                                    value={createForm.data.password_confirmation}
                                    onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi kata sandi"
                                    required
                                    className="rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 h-9.5 text-xs"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateOpen(false)}
                                className="rounded-xl text-xs h-10 sm:h-9.5 px-4 w-full sm:w-auto cursor-pointer"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer h-10 sm:h-9.5 px-5 w-full sm:w-auto active:scale-95 transition-transform"
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Pengguna */}
            <Dialog open={Boolean(userToEdit)} onOpenChange={(open) => !open && setUserToEdit(null)}>
                <DialogContent className="max-w-md sm:max-w-lg w-[calc(100vw-2rem)] sm:w-full max-h-[88dvh] overflow-y-auto custom-scrollbar p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl focus:outline-hidden">
                    <DialogHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                                <Pencil className="size-4.5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    Edit Data Pengguna
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Perbarui nama, email, peran akun, foto, atau ubah kata sandi.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                        {/* Avatar Edit Area */}
                        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4 sm:p-5 dark:border-slate-800/80 dark:bg-slate-950/60 flex flex-col items-center text-center gap-3">
                            <div className="relative group">
                                <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-full border-3 border-white dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md ring-2 ring-blue-500/20 dark:ring-blue-400/20 flex items-center justify-center">
                                    {editAvatarPreview ? (
                                        <img
                                            src={editAvatarPreview}
                                            alt="Preview"
                                            className="h-full w-full object-cover select-none"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                            <UserIcon className="size-10 stroke-1" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => editFileInputRef.current?.click()}
                                    title="Ganti Foto"
                                    className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md border-2 border-white dark:border-slate-900 transition-transform active:scale-95 cursor-pointer"
                                >
                                    <Camera className="size-3.5" />
                                </button>
                            </div>

                            <div className="space-y-2 w-full flex flex-col items-center">
                                <div>
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Foto Profil
                                    </Label>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                        Format JPG, PNG, atau WEBP (Maksimal 2MB)
                                    </p>
                                </div>

                                <input
                                    type="file"
                                    ref={editFileInputRef}
                                    onChange={handleEditAvatarChange}
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                />

                                <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => editFileInputRef.current?.click()}
                                        className="h-8.5 px-3.5 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                                    >
                                        <Camera className="size-3.5 text-slate-600 dark:text-slate-300" />
                                        <span>Ganti Foto</span>
                                    </Button>

                                    {editAvatarPreview && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleEditRemoveAvatar}
                                            className="h-8.5 px-3.5 rounded-xl border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                                        >
                                            <Trash2 className="size-3.5 text-red-500" />
                                            <span>Hapus Foto</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Nama */}
                        <div className="space-y-1">
                            <Label htmlFor="edit_name" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Nama Lengkap <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                                className="rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 h-9.5 text-xs focus:ring-2 focus:ring-red-500"
                            />
                            <InputError message={editForm.errors.name} />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <Label htmlFor="edit_email" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Alamat Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit_email"
                                type="email"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                required
                                className="rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 h-9.5 text-xs focus:ring-2 focus:ring-red-500"
                            />
                            <InputError message={editForm.errors.email} />
                        </div>

                        {/* Interactive Role Card Selector */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                Peran Akun (Role) <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => editForm.setData('role', 'teknisi')}
                                    className={`flex flex-col text-left p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                                        editForm.data.role === 'teknisi'
                                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-xs'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                                        <Wrench className="size-3.5 text-emerald-600" />
                                        <span>Teknisi</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Tidak dapat menambah user baru.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => editForm.setData('role', 'admin')}
                                    className={`flex flex-col text-left p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                                        editForm.data.role === 'admin'
                                            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30 shadow-xs'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
                                        <ShieldCheck className="size-3.5 text-indigo-600" />
                                        <span>Administrator</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Hak penuh kelola akun & sistem.
                                    </p>
                                </button>
                            </div>
                            <InputError message={editForm.errors.role} />
                        </div>

                        {/* Optional Password Change */}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-950/50 space-y-2">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                <KeyRound className="size-3.5 text-slate-500" />
                                <span>Ganti Kata Sandi (Kosongkan jika tidak ingin mengubah)</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                <div>
                                    <Input
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        placeholder="Sandi baru (opsional)"
                                        className="rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 h-9 text-xs"
                                    />
                                    <InputError message={editForm.errors.password} />
                                </div>
                                <div>
                                    <Input
                                        type="password"
                                        value={editForm.data.password_confirmation}
                                        onChange={(e) => editForm.setData('password_confirmation', e.target.value)}
                                        placeholder="Ulangi sandi baru"
                                        className="rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUserToEdit(null)}
                                className="rounded-xl text-xs h-10 sm:h-9.5 px-4 w-full sm:w-auto cursor-pointer"
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer h-10 sm:h-9.5 px-5 w-full sm:w-auto active:scale-95 transition-transform"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Perbarui Pengguna'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Hapus Pengguna */}
            <Dialog open={Boolean(userToDelete)} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <DialogContent className="max-w-md w-[calc(100vw-2rem)] sm:w-full max-h-[88dvh] overflow-y-auto custom-scrollbar p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950/60 shadow-2xl focus:outline-hidden">
                    <DialogHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/70 dark:text-red-400">
                                <ShieldAlert className="size-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base sm:text-lg font-bold text-red-600">
                                    Hapus Akun Pengguna
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Tindakan ini permanen dan tidak dapat dibatalkan.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {userToDelete && (
                        <div className="py-3 text-xs space-y-2.5 text-slate-700 dark:text-slate-300">
                            <p>
                                Apakah Anda yakin ingin menghapus akun pengguna berikut?
                            </p>
                            <div className="rounded-2xl bg-red-50/70 p-3.5 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 space-y-1">
                                <p className="font-bold text-sm text-slate-900 dark:text-white">
                                    {userToDelete.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{userToDelete.email}</p>
                                <p className="font-semibold text-xs text-red-700 dark:text-red-300 capitalize pt-0.5">
                                    Peran: {userToDelete.role || 'Teknisi'}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setUserToDelete(null)}
                            className="rounded-xl text-xs h-10 sm:h-9.5 px-4 w-full sm:w-auto cursor-pointer"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            disabled={deleteForm.processing}
                            onClick={handleDeleteSubmit}
                            className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer h-10 sm:h-9.5 px-5 w-full sm:w-auto active:scale-95 transition-transform"
                        >
                            {deleteForm.processing ? 'Menghapus...' : 'Ya, Hapus Pengguna'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Lightbox Preview Foto Pengguna */}
            <AvatarPreviewDialog
                isOpen={Boolean(previewUser)}
                onClose={() => setPreviewUser(null)}
                user={previewUser}
            />
        </div>
    );
}

// Bypass default sidebar wrapper layout to show full standalone dashboard layout
UsersIndex.layout = (page: React.ReactNode) => page;
