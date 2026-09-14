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
import { Sparkles, Loader2, ImagePlus, MapPin, Calendar, Camera, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { compressImage } from '@/lib/image-compressor';
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
        service_date: today,
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        unit_model: '',
        serial_number: '',
        status: 'berbayar',
        status_note: '',
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
            setData({
                notif_number: ticketToEdit.notif_number,
                service_date: ticketToEdit.service_date ? ticketToEdit.service_date.split('T')[0] : today,
                customer_name: ticketToEdit.customer_name,
                customer_phone: ticketToEdit.customer_phone,
                customer_address: ticketToEdit.customer_address || '',
                unit_model: ticketToEdit.unit_model,
                serial_number: ticketToEdit.serial_number,
                status: ticketToEdit.status,
                status_note: ticketToEdit.status_note || '',
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
            const randSuffix = Math.floor(1000 + Math.random() * 9000);
            setData((prev) => ({
                ...prev,
                notif_number: `NTF-2026-${randSuffix}`,
                service_date: today,
                customer_address: '',
            }));
            setVisitPreview(null);
            setCompletionPreview(null);
        }
        clearErrors();
    }, [ticketToEdit, isOpen]);

    const handleGenerateNotif = () => {
        const randSuffix = Math.floor(1000 + Math.random() * 9000);
        setData('notif_number', `NTF-2026-${randSuffix}`);
    };

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
            <DialogContent className="w-full sm:max-w-4xl max-h-[92vh] overflow-y-auto p-4 sm:p-6 lg:p-7 sm:rounded-2xl">
                <DialogHeader className="border-b pb-3">
                    <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        {isEdit ? 'Edit Notifikasi Tiket' : 'Tambah Notifikasi Tiket Servis Baru'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Notif, Tanggal, & Center */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <Label htmlFor="notif_number" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Notif (Unique) *
                            </Label>
                            <div className="flex gap-1.5 mt-1.5">
                                <Input
                                    id="notif_number"
                                    value={data.notif_number}
                                    onChange={(e) => setData('notif_number', e.target.value)}
                                    placeholder="NTF-2026-XXXX"
                                    className="font-mono uppercase font-semibold text-xs"
                                    required
                                />
                                {!isEdit && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleGenerateNotif}
                                        title="Generate No Notif Baru"
                                        className="shrink-0 size-9"
                                    >
                                        <Sparkles className="size-3.5 text-indigo-600" />
                                    </Button>
                                )}
                            </div>
                            {errors.notif_number && <p className="text-xs text-red-500 mt-1">{errors.notif_number}</p>}
                        </div>

                        <div>
                            <Label htmlFor="service_date" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <Calendar className="size-3 text-slate-400" />
                                Tanggal Pengerjaan *
                            </Label>
                            <Input
                                id="service_date"
                                type="date"
                                value={data.service_date}
                                onChange={(e) => setData('service_date', e.target.value)}
                                className="mt-1.5 text-xs"
                                required
                            />
                            {errors.service_date && <p className="text-xs text-red-500 mt-1">{errors.service_date}</p>}
                        </div>

                        <div>
                            <Label htmlFor="mainwork_center" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Mainwork Center *
                            </Label>
                            <select
                                id="mainwork_center"
                                value={data.mainwork_center}
                                onChange={(e) => setData('mainwork_center', e.target.value)}
                                className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-xs focus:ring-2 focus:ring-indigo-500"
                                required
                            >
                                <option value="Pulogadung">Pulogadung</option>
                                <option value="MOI">MOI</option>
                                <option value="Lain-lain">Lain-lain</option>
                            </select>
                            {errors.mainwork_center && <p className="text-xs text-red-500 mt-1">{errors.mainwork_center}</p>}
                        </div>
                    </div>

                    {/* Customer Info (Name & Phone) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="customer_name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Nama Pelanggan *
                            </Label>
                            <Input
                                id="customer_name"
                                value={data.customer_name}
                                onChange={(e) => setData('customer_name', e.target.value)}
                                placeholder="Contoh: Budi Santoso"
                                className="mt-1.5"
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
                                placeholder="081234567890"
                                className="mt-1.5"
                                required
                            />
                            {errors.customer_phone && <p className="text-xs text-red-500 mt-1">{errors.customer_phone}</p>}
                        </div>
                    </div>

                    {/* Customer Address (Alamat Lengkap) */}
                    <div>
                        <Label htmlFor="customer_address" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <MapPin className="size-3 text-red-500" />
                            Alamat Lengkap Pelanggan
                        </Label>
                        <Input
                            id="customer_address"
                            value={data.customer_address}
                            onChange={(e) => setData('customer_address', e.target.value)}
                            placeholder="Contoh: Jl. Pemuda No. 45, Rawamangun, Pulo Gadung, Jakarta Timur"
                            className="mt-1.5"
                        />
                        {errors.customer_address && <p className="text-xs text-red-500 mt-1">{errors.customer_address}</p>}
                    </div>

                    {/* Unit Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="unit_model" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Model Unit *
                            </Label>
                            <Input
                                id="unit_model"
                                value={data.unit_model}
                                onChange={(e) => setData('unit_model', e.target.value)}
                                placeholder="Contoh: Smart TV 55 Inch OLED"
                                className="mt-1.5"
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
                                placeholder="Contoh: OLED55-88231"
                                className="mt-1.5 font-mono"
                                required
                            />
                            {errors.serial_number && <p className="text-xs text-red-500 mt-1">{errors.serial_number}</p>}
                        </div>
                    </div>

                    {/* Status & Status Detail */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-900/50">
                        <div>
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Status Biaya *
                            </Label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="berbayar"
                                        checked={data.status === 'berbayar'}
                                        onChange={() => {
                                            setData((prev) => ({ ...prev, status: 'berbayar', status_note: '' }));
                                        }}
                                        className="size-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="font-medium text-slate-800 dark:text-slate-200">Berbayar</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="tidak_berbayar"
                                        checked={data.status === 'tidak_berbayar'}
                                        onChange={() => {
                                            setData((prev) => ({ ...prev, status: 'tidak_berbayar', status_note: 'Garansi' }));
                                        }}
                                        className="size-4 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="font-medium text-slate-800 dark:text-slate-200">Tidak Berbayar</span>
                                </label>
                            </div>
                        </div>

                        {data.status === 'tidak_berbayar' && (
                            <div>
                                <Label htmlFor="status_note" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Kategori Tidak Berbayar
                                </Label>
                                <select
                                    id="status_note"
                                    value={data.status_note}
                                    onChange={(e) => setData('status_note', e.target.value)}
                                    className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-xs focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900"
                                >
                                    <option value="Garansi">Garansi</option>
                                    <option value="Free Service">Free Service</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Pilihan Pengerjaan (Multi-Select) */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
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

                    {/* Start - Finish Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start_time" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Jam Mulai (Start)
                            </Label>
                            <Input
                                id="start_time"
                                type="time"
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="finish_time" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                Jam Selesai (Finish)
                            </Label>
                            <Input
                                id="finish_time"
                                type="time"
                                value={data.finish_time}
                                onChange={(e) => setData('finish_time', e.target.value)}
                                className="mt-1.5"
                            />
                        </div>
                    </div>

                    {/* Foto Kunjungan & Selesai (Kamera Langsung & Galeri) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        {/* 1. Foto Kunjungan */}
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-2.5">
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
                                    <div className="relative size-16 sm:size-18 shrink-0 overflow-hidden rounded-xl border border-blue-300 ring-2 ring-blue-500/20">
                                        <img
                                            src={visitPreview}
                                            alt="Preview Kunjungan"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="size-16 sm:size-18 rounded-xl border border-dashed border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                                        <ImagePlus className="size-6 text-slate-300 dark:text-slate-600" />
                                        <span className="text-[9px] mt-0.5 text-slate-400">Belum ada</span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5 w-full xs:flex-1">
                                    <Button
                                        type="button"
                                        onClick={() => setCameraTarget('visit')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs shadow-blue-600/20 cursor-pointer active:scale-95"
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
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50 space-y-2.5">
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
                                    <div className="relative size-16 sm:size-18 shrink-0 overflow-hidden rounded-xl border border-emerald-300 ring-2 ring-emerald-500/20">
                                        <img
                                            src={completionPreview}
                                            alt="Preview Selesai"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="size-16 sm:size-18 rounded-xl border border-dashed border-slate-300 bg-white dark:bg-slate-800 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 shrink-0">
                                        <ImagePlus className="size-6 text-slate-300 dark:text-slate-600" />
                                        <span className="text-[9px] mt-0.5 text-slate-400">Belum ada</span>
                                    </div>
                                )}

                                <div className="flex flex-col gap-1.5 w-full xs:flex-1">
                                    <Button
                                        type="button"
                                        onClick={() => setCameraTarget('completion')}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-xs shadow-emerald-600/20 cursor-pointer active:scale-95"
                                    >
                                        <Camera className="size-3.5" />
                                        <span>Ambil Foto (Kamera)</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => completionFileInputRef.current?.click()}
                                        className="w-full text-xs h-8 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
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

                    {/* Notes */}
                    <div>
                        <Label htmlFor="notes" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Catatan Teknisi / Detail Pengerjaan
                        </Label>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Catatan kendala unit, detail perbaikan, atau instruksi lanjutan..."
                            rows={2}
                            className="mt-1.5"
                        />
                    </div>

                    <DialogFooter className="border-t pt-3 flex items-center justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
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
