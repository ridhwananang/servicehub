import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { WorkTypeSelector } from '@/components/work-type-selector';
import { CameraCaptureDialog } from '@/components/camera-capture-dialog';
import { DocumentScannerDialog } from '@/components/document-scanner-dialog';
import {
    Loader2,
    ImagePlus,
    MapPin,
    Calendar,
    Camera,
    Upload,
    Trash2,
    CheckCircle2,
    Clock,
    ScanText,
    User,
    Wrench,
    FileText,
    Building2,
    DollarSign,
    Hash,
} from 'lucide-react';
import { toast } from 'sonner';
import { compressImage } from '@/lib/image-compressor';
import type { ParsedRepairDocument } from '@/lib/document-parser';
import type { ServiceTicket } from '@/types';

interface TicketDialogProps {
    isOpen: boolean;
    onClose: () => void;
    ticketToEdit?: ServiceTicket | null;
}

export function TicketDialog({
    isOpen,
    onClose,
    ticketToEdit,
}: TicketDialogProps) {
    const isEdit = Boolean(ticketToEdit);
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        notif_number: '',
        deadline: today,
        service_date: today,
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        unit_model: '',
        serial_number: '',
        status: 'berbayar',
        status_note: '',
        work_status: 'belum_selesai' as 'belum_selesai' | 'selesai',
        work_types: [] as string[],
        other_work_text: '',
        mainwork_center: 'Pulogadung',
        start_time: '',
        finish_time: '',
        visit_photo: null as File | null,
        completion_photo: null as File | null,
        visit_photo_url: '',
        completion_photo_url: '',
        notes: '',
    });

    const [visitPreview, setVisitPreview] = useState<string | null>(null);
    const [completionPreview, setCompletionPreview] = useState<string | null>(null);

    const [cameraTarget, setCameraTarget] = useState<'visit' | 'completion' | null>(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const visitFileInputRef = React.useRef<HTMLInputElement>(null);
    const completionFileInputRef = React.useRef<HTMLInputElement>(null);

    const handleCameraCapture = async (file: File, previewUrl: string) => {
        const compressedFile = await compressImage(file);
        if (cameraTarget === 'visit') {
            setData('visit_photo', compressedFile);
            setVisitPreview(previewUrl);
        } else if (cameraTarget === 'completion') {
            setData('completion_photo', compressedFile);
            setCompletionPreview(previewUrl);
        }
        setCameraTarget(null);
    };

    const handleRemoveVisitPhoto = () => {
        setData((prev) => ({ ...prev, visit_photo: null, visit_photo_url: '' }));
        setVisitPreview(null);
        if (visitFileInputRef.current) visitFileInputRef.current.value = '';
    };

    const handleRemoveCompletionPhoto = () => {
        setData((prev) => ({ ...prev, completion_photo: null, completion_photo_url: '' }));
        setCompletionPreview(null);
        if (completionFileInputRef.current) completionFileInputRef.current.value = '';
    };

    useEffect(() => {
        if (ticketToEdit) {
            const ticketDeadline = ticketToEdit.deadline
                ? ticketToEdit.deadline.split('T')[0]
                : ticketToEdit.service_date
                ? ticketToEdit.service_date.split('T')[0]
                : today;

            setData({
                notif_number: ticketToEdit.notif_number,
                deadline: ticketDeadline,
                service_date: ticketDeadline,
                customer_name: ticketToEdit.customer_name,
                customer_phone: ticketToEdit.customer_phone,
                customer_address: ticketToEdit.customer_address || '',
                unit_model: ticketToEdit.unit_model,
                serial_number: ticketToEdit.serial_number,
                status: ticketToEdit.status,
                status_note: ticketToEdit.status_note || '',
                work_status: ticketToEdit.work_status || 'belum_selesai',
                work_types: ticketToEdit.work_types || [],
                other_work_text: ticketToEdit.other_work_text || '',
                mainwork_center: ticketToEdit.mainwork_center,
                start_time: ticketToEdit.start_time || '',
                finish_time: ticketToEdit.finish_time || '',
                visit_photo: null,
                completion_photo: null,
                visit_photo_url: ticketToEdit.visit_photo || '',
                completion_photo_url: ticketToEdit.completion_photo || '',
                notes: ticketToEdit.notes || '',
            });
            setVisitPreview(ticketToEdit.visit_photo);
            setCompletionPreview(ticketToEdit.completion_photo);
        } else {
            reset();
            setData((prev) => ({
                ...prev,
                notif_number: '',
                deadline: today,
                service_date: today,
                work_status: 'belum_selesai',
                customer_address: '',
            }));
            setVisitPreview(null);
            setCompletionPreview(null);
        }
        clearErrors();
    }, [ticketToEdit, isOpen]);

    const handleVisitFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const compressed = await compressImage(file);
            setData('visit_photo', compressed);
            setVisitPreview(URL.createObjectURL(compressed));
        }
    };

    const handleCompletionFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const compressed = await compressImage(file);
            setData('completion_photo', compressed);
            setCompletionPreview(URL.createObjectURL(compressed));
        }
    };

    const handleApplyScannedDocument = (scanned: ParsedRepairDocument, imageFile?: File | null) => {
        setData((prev) => {
            const next = { ...prev };
            if (scanned.notif_number) next.notif_number = scanned.notif_number;
            if (scanned.deadline) {
                next.deadline = scanned.deadline;
                next.service_date = scanned.deadline;
            }
            if (scanned.customer_name) next.customer_name = scanned.customer_name;
            if (scanned.customer_phone) next.customer_phone = scanned.customer_phone;
            if (scanned.customer_address) next.customer_address = scanned.customer_address;
            if (scanned.unit_model) next.unit_model = scanned.unit_model;
            if (scanned.serial_number) next.serial_number = scanned.serial_number;
            if (scanned.status) next.status = scanned.status;
            if (scanned.status_note) next.status_note = scanned.status_note;
            if (scanned.work_status) next.work_status = scanned.work_status;
            if (scanned.work_types && scanned.work_types.length > 0) next.work_types = scanned.work_types;
            if (scanned.start_time) next.start_time = scanned.start_time;
            if (scanned.notes) {
                next.notes = prev.notes ? `${prev.notes}\n${scanned.notes}` : scanned.notes;
            }
            if (imageFile) {
                next.visit_photo = imageFile;
            }
            return next;
        });

        if (imageFile) {
            setVisitPreview(URL.createObjectURL(imageFile));
        }

        toast.success('Data laporan reparasi berhasil disalin ke formulir!');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && ticketToEdit) {
            post(`/tickets/${ticketToEdit.id}?_method=PUT`, {
                forceFormData: true,
                onSuccess: () => onClose(),
            });
        } else {
            post('/tickets', {
                forceFormData: true,
                onSuccess: () => onClose(),
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-7 sm:rounded-2xl">
                <DialogHeader className="border-b pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="size-2.5 rounded-full bg-red-600 animate-pulse" />
                                {isEdit ? 'Edit Notifikasi Tiket' : 'Tambah Notifikasi Tiket Servis Baru'}
                            </DialogTitle>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {isEdit
                                    ? 'Perbarui rincian pengerjaan dan status tiket pelanggan.'
                                    : 'Isi formulir pengerjaan servis atau scan dokumen fisik secara otomatis.'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Banner Pindai Dokumen Fisik (OCR) */}
                <div className="mt-2 relative overflow-hidden rounded-xl border border-red-200/80 bg-gradient-to-r from-red-500/10 via-rose-500/5 to-transparent p-3 sm:p-3.5 dark:border-red-900/50 dark:from-red-950/30 dark:via-red-900/10 dark:to-transparent">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="size-9 sm:size-10 rounded-xl bg-red-600/15 text-red-600 dark:bg-red-500/20 dark:text-red-400 flex items-center justify-center shrink-0 ring-2 ring-red-500/20">
                                <ScanText className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                        Scan / Foto Dokumen Fisik (OCR)
                                    </h4>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-red-600 text-white shadow-xs">
                                        AI Auto-Fill
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                                    Foto lembar laporan reparasi atau upload gambar struk untuk mengisi otomatis nomor notif, nama, HP, alamat, unit model, hingga serial number.
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            onClick={() => setIsScannerOpen(true)}
                            className="shrink-0 w-full sm:w-auto h-8 text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-lg gap-1.5 shadow-sm shadow-red-600/25 active:scale-95 cursor-pointer"
                        >
                            <ScanText className="size-3.5" />
                            <span>Scan Dokumen Sekarang</span>
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {/* SECTION 1: Informasi Tiket & Waktu */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 sm:p-4 dark:border-slate-800 dark:bg-slate-900/30 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5 dark:border-slate-800/60">
                            <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-red-600 dark:text-red-400" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                    1. Data Tiket & Jadwal Pengerjaan
                                </h3>
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                                Identitas & Jadwal Operasional
                            </span>
                        </div>

                        {/* Baris 1: Identitas Tiket & Service Center (2 Kolom Seimbang) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <Label htmlFor="notif_number" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Hash className="size-3.5 text-red-500" />
                                        Nomor Notif (Unique) <span className="text-red-500">*</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-normal">Wajib diisi</span>
                                </Label>
                                <Input
                                    id="notif_number"
                                    value={data.notif_number}
                                    onChange={(e) => setData('notif_number', e.target.value)}
                                    placeholder="Contoh: 200847291 / NTF-001"
                                    className="mt-1.5 font-mono uppercase font-semibold text-xs bg-white dark:bg-slate-900 rounded-xl h-9.5 border-slate-200 dark:border-slate-700"
                                    required
                                />
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                    Sesuai nomor pada lembar laporan fisik / nota reparasi.
                                </p>
                                {errors.notif_number && <p className="text-xs text-red-500 mt-1">{errors.notif_number}</p>}
                            </div>

                            <div>
                                <Label htmlFor="mainwork_center" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Building2 className="size-3.5 text-red-500" />
                                        Mainwork Center <span className="text-red-500">*</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-normal">Pusat Servis</span>
                                </Label>
                                <select
                                    id="mainwork_center"
                                    value={data.mainwork_center}
                                    onChange={(e) => setData('mainwork_center', e.target.value)}
                                    className="mt-1.5 flex h-9.5 w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500 dark:border-slate-700 cursor-pointer"
                                    required
                                >
                                    <option value="Pulogadung" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Pulogadung</option>
                                    <option value="MOI" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">MOI</option>
                                    <option value="Lain-lain" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Lain-lain</option>
                                </select>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                    Cabang service center yang bertanggung jawab.
                                </p>
                                {errors.mainwork_center && <p className="text-xs text-red-500 mt-1">{errors.mainwork_center}</p>}
                            </div>
                        </div>

                        {/* Baris 2: Sub-Card Jadwal & Estimasi Waktu (3 Kolom Berimbang) */}
                        <div className="rounded-xl border border-slate-200/90 bg-white/90 p-3 sm:p-3.5 dark:border-slate-800/90 dark:bg-slate-950/60 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Clock className="size-3.5 text-red-500" />
                                    Jadwal Pengerjaan & Waktu Kunjungan
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setData((prev) => ({
                                            ...prev,
                                            deadline: today,
                                            service_date: today,
                                        }));
                                    }}
                                    className="text-[10px] font-semibold text-red-600 dark:text-red-400 hover:underline cursor-pointer flex items-center gap-1"
                                    title="Set tanggal deadline ke hari ini"
                                >
                                    <Calendar className="size-3" />
                                    <span>Set Hari Ini</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <Label htmlFor="deadline" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <Calendar className="size-3 text-red-500" />
                                        Deadline Tanggal <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="deadline"
                                        type="date"
                                        value={data.deadline}
                                        onChange={(e) => {
                                            setData((prev) => ({
                                                ...prev,
                                                deadline: e.target.value,
                                                service_date: e.target.value,
                                            }));
                                        }}
                                        className="mt-1.5 h-9.5 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                        required
                                    />
                                    {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="start_time" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <Clock className="size-3 text-amber-500" />
                                        Jam Mulai (Start)
                                    </Label>
                                    <Input
                                        id="start_time"
                                        type="time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        className="mt-1.5 h-9.5 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Opsional (jam datang)</p>
                                </div>

                                <div>
                                    <Label htmlFor="finish_time" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <CheckCircle2 className="size-3 text-emerald-500" />
                                        Jam Selesai (Finish)
                                    </Label>
                                    <Input
                                        id="finish_time"
                                        type="time"
                                        value={data.finish_time}
                                        onChange={(e) => setData('finish_time', e.target.value)}
                                        className="mt-1.5 h-9.5 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                                    />
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Opsional (jam selesai)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Data Pelanggan & Alamat */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/30 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 dark:border-slate-800/60">
                            <User className="size-4 text-red-600 dark:text-red-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                2. Data Pelanggan & Lokasi
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="customer_name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Nama Pelanggan *
                                </Label>
                                <Input
                                    id="customer_name"
                                    value={data.customer_name}
                                    onChange={(e) => setData('customer_name', e.target.value)}
                                    placeholder="Contoh: MULYONO / Budi Santoso"
                                    className="mt-1.5 bg-white dark:bg-slate-900"
                                    required
                                />
                                {errors.customer_name && <p className="text-xs text-red-500 mt-1">{errors.customer_name}</p>}
                            </div>

                            <div>
                                <Label htmlFor="customer_phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    No Telepon / WhatsApp *
                                </Label>
                                <Input
                                    id="customer_phone"
                                    value={data.customer_phone}
                                    onChange={(e) => setData('customer_phone', e.target.value)}
                                    placeholder="085213579222"
                                    className="mt-1.5 bg-white dark:bg-slate-900 font-mono"
                                    required
                                />
                                {errors.customer_phone && <p className="text-xs text-red-500 mt-1">{errors.customer_phone}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="customer_address" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <MapPin className="size-3 text-red-500" />
                                Alamat Lengkap Pelanggan
                            </Label>
                            <Input
                                id="customer_address"
                                value={data.customer_address}
                                onChange={(e) => setData('customer_address', e.target.value)}
                                placeholder="Contoh: Jl. Kereta Kencana 2 Sektor 12 Blok 2... atau Jl. Pemuda No. 45"
                                className="mt-1.5 bg-white dark:bg-slate-900"
                            />
                            {errors.customer_address && <p className="text-xs text-red-500 mt-1">{errors.customer_address}</p>}
                        </div>
                    </div>

                    {/* SECTION 3: Unit & Perangkat */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/30 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 dark:border-slate-800/60">
                            <Wrench className="size-4 text-red-600 dark:text-red-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                3. Unit & Perangkat
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="unit_model" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Model Unit *
                                </Label>
                                <Input
                                    id="unit_model"
                                    value={data.unit_model}
                                    onChange={(e) => setData('unit_model', e.target.value)}
                                    placeholder="Contoh: AC AH-A5SAY atau Smart TV 55 Inch"
                                    className="mt-1.5 bg-white dark:bg-slate-900"
                                    required
                                />
                                {errors.unit_model && <p className="text-xs text-red-500 mt-1">{errors.unit_model}</p>}
                            </div>

                            <div>
                                <Label htmlFor="serial_number" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    No Seri (Serial Number) *
                                </Label>
                                <Input
                                    id="serial_number"
                                    value={data.serial_number}
                                    onChange={(e) => setData('serial_number', e.target.value)}
                                    placeholder="Contoh: DM-AHA5MU-12"
                                    className="mt-1.5 font-mono bg-white dark:bg-slate-900"
                                    required
                                />
                                {errors.serial_number && <p className="text-xs text-red-500 mt-1">{errors.serial_number}</p>}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Status Pengerjaan & Biaya */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/30 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 dark:border-slate-800/60">
                            <DollarSign className="size-4 text-red-600 dark:text-red-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                4. Status Pengerjaan & Biaya
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Status Pengerjaan: Belum Selesai vs Selesai */}
                            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/80">
                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <Clock className="size-3.5 text-amber-500" />
                                    Status Pengerjaan (Default: Belum Selesai) *
                                </Label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="work_status"
                                            value="belum_selesai"
                                            checked={data.work_status === 'belum_selesai'}
                                            onChange={() => setData('work_status', 'belum_selesai')}
                                            className="size-4 text-amber-600 focus:ring-amber-500"
                                        />
                                        <span className="font-semibold text-amber-700 dark:text-amber-400">Belum Selesai</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="work_status"
                                            value="selesai"
                                            checked={data.work_status === 'selesai'}
                                            onChange={() => setData('work_status', 'selesai')}
                                            className="size-4 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">Selesai</span>
                                    </label>
                                </div>
                            </div>

                            {/* Status Biaya / Garansi */}
                            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/80">
                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                    <DollarSign className="size-3.5 text-red-500" />
                                    Status Biaya / Garansi *
                                </Label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="berbayar"
                                            checked={data.status === 'berbayar'}
                                            onChange={() => {
                                                setData((prev) => ({ ...prev, status: 'berbayar', status_note: '' }));
                                            }}
                                            className="size-4 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="font-medium text-slate-800 dark:text-slate-200">Berbayar</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                        <input
                                            type="radio"
                                            name="status"
                                            value="tidak_berbayar"
                                            checked={data.status === 'tidak_berbayar'}
                                            onChange={() => {
                                                setData((prev) => ({ ...prev, status: 'tidak_berbayar', status_note: 'Garansi' }));
                                            }}
                                            className="size-4 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="font-medium text-slate-800 dark:text-slate-200">Tidak Berbayar</span>
                                    </label>
                                </div>

                                {data.status === 'tidak_berbayar' && (
                                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <Label htmlFor="status_note" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                            Kategori Tidak Berbayar
                                        </Label>
                                        <select
                                            id="status_note"
                                            value={data.status_note}
                                            onChange={(e) => setData('status_note', e.target.value)}
                                            className="mt-1 flex h-8 w-full rounded-md border border-input bg-slate-50 px-2.5 py-1 text-xs shadow-xs focus:ring-2 focus:ring-red-500 dark:bg-slate-800"
                                        >
                                            <option value="Garansi">Garansi</option>
                                            <option value="Free Service">Free Service</option>
                                            <option value="Lainnya">Lainnya</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: Jenis Pengerjaan */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/30 space-y-2.5">
                        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 dark:border-slate-800/60">
                            <FileText className="size-4 text-red-600 dark:text-red-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                5. Jenis Pengerjaan (Pilih Satu atau Lebih)
                            </h3>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                            <WorkTypeSelector
                                selectedValues={data.work_types}
                                otherWorkText={data.other_work_text}
                                onChange={(values, otherText) => {
                                    setData((prev) => ({
                                        ...prev,
                                        work_types: values,
                                        other_work_text: otherText !== undefined ? otherText : prev.other_work_text,
                                    }));
                                }}
                                error={errors.work_types}
                            />
                        </div>
                    </div>

                    {/* SECTION 6: Dokumentasi Foto */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/30 space-y-3">
                        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 dark:border-slate-800/60">
                            <Camera className="size-4 text-red-600 dark:text-red-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                6. Dokumentasi Foto
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* 1. Foto Kunjungan */}
                            <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/90 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <Camera className="size-3.5 text-blue-600" />
                                        1. Foto Kunjungan / Unit Awal
                                    </Label>
                                    {visitPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveVisitPhoto}
                                            className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
                                        >
                                            <Trash2 className="size-3" />
                                            Hapus
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col xs:flex-row items-center gap-3">
                                    {visitPreview ? (
                                        <div className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-xl border border-blue-300 ring-2 ring-blue-500/20">
                                            <img
                                                src={visitPreview}
                                                alt="Preview Kunjungan"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="size-16 sm:size-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                                            <ImagePlus className="size-6 text-slate-300 dark:text-slate-600" />
                                            <span className="text-[9px] mt-0.5 text-slate-400">Belum ada</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1.5 w-full xs:flex-1">
                                        <Button
                                            type="button"
                                            onClick={() => setCameraTarget('visit')}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                                        >
                                            <Camera className="size-3.5" />
                                            <span>Ambil Foto (Kamera)</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => visitFileInputRef.current?.click()}
                                            className="w-full text-xs h-8 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                        >
                                            <Upload className="size-3.5" />
                                            <span>Pilih Galeri / File</span>
                                        </Button>
                                    </div>
                                </div>

                                <input
                                    ref={visitFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleVisitFileChange}
                                    className="hidden"
                                />
                            </div>

                            {/* 2. Foto Selesai */}
                            <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900/90 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                                        2. Foto Selesai / Pengerjaan Beres
                                    </Label>
                                    {completionPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveCompletionPhoto}
                                            className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
                                        >
                                            <Trash2 className="size-3" />
                                            Hapus
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col xs:flex-row items-center gap-3">
                                    {completionPreview ? (
                                        <div className="relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-xl border border-emerald-300 ring-2 ring-emerald-500/20">
                                            <img
                                                src={completionPreview}
                                                alt="Preview Selesai"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="size-16 sm:size-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                                            <ImagePlus className="size-6 text-slate-300 dark:text-slate-600" />
                                            <span className="text-[9px] mt-0.5 text-slate-400">Belum ada</span>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-1.5 w-full xs:flex-1">
                                        <Button
                                            type="button"
                                            onClick={() => setCameraTarget('completion')}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                                        >
                                            <Camera className="size-3.5" />
                                            <span>Ambil Foto (Kamera)</span>
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => completionFileInputRef.current?.click()}
                                            className="w-full text-xs h-8 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                        >
                                            <Upload className="size-3.5" />
                                            <span>Pilih Galeri / File</span>
                                        </Button>
                                    </div>
                                </div>

                                <input
                                    ref={completionFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCompletionFileChange}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 7: Catatan Teknisi */}
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-900/30 space-y-2">
                        <Label htmlFor="notes" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <FileText className="size-3.5 text-red-500" />
                            7. Catatan Teknisi / Keterangan Kerusakan & Perbaikan
                        </Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Catatan kendala unit, detail perbaikan, spare part yang diganti, atau instruksi lanjutan..."
                            rows={3}
                            className="mt-1.5 bg-white dark:bg-slate-900"
                        />
                    </div>

                    <DialogFooter className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing} className="h-9 sm:h-10 px-4 rounded-xl cursor-pointer">
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 text-white min-w-[130px] h-9 sm:h-10 px-4 rounded-xl font-semibold cursor-pointer shadow-sm shadow-red-600/20 active:scale-95 transition-all"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="size-4 animate-spin mr-1.5" />
                                    Menyimpan...
                                </>
                            ) : isEdit ? (
                                'Simpan Perubahan'
                            ) : (
                                'Tambah Tiket'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {/* Modal Scanner / OCR Dokumen Fisik */}
            <DocumentScannerDialog
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onApply={handleApplyScannedDocument}
            />

            {/* Modal Ambil Foto Langsung (Kamera) */}
            <CameraCaptureDialog
                isOpen={Boolean(cameraTarget)}
                onClose={() => setCameraTarget(null)}
                onCapture={handleCameraCapture}
                title={cameraTarget === 'visit' ? 'Ambil Foto Kunjungan / Unit Awal' : 'Ambil Foto Selesai / Pengerjaan Beres'}
            />
        </Dialog>
    );
}
