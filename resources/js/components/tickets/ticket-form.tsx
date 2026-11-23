import React, { useEffect, useState } from "react";
import { useForm, router, Link } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WorkTypeSelector, WORK_TYPE_OPTIONS } from "@/components/work-type-selector";
import { CameraCaptureDialog } from "@/components/camera-capture-dialog";
import { DocumentScannerDialog } from "@/components/document-scanner-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    Loader2,
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
    ArrowLeft,
    ShieldCheck,
    Eye,
    Save,
    MapPin,
    Phone,
} from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/image-compressor";
import { isMobileDevice } from "@/lib/camera-capture";
import type { ParsedRepairDocument } from "@/lib/document-parser";
import type { ServiceTicket } from "@/types";

interface TicketFormProps {
    initialTicket?: ServiceTicket | null;
    isEdit?: boolean;
}

export function TicketForm({ initialTicket, isEdit = false }: TicketFormProps) {
    const today = new Date().toISOString().split("T")[0];

    const initialDeadline = initialTicket?.deadline
        ? initialTicket.deadline.split("T")[0]
        : initialTicket?.service_date
          ? initialTicket.service_date.split("T")[0]
          : today;

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm({
            notif_number: initialTicket?.notif_number || "",
            deadline: initialDeadline,
            service_date: initialDeadline,
            customer_name: initialTicket?.customer_name || "",
            customer_phone: initialTicket?.customer_phone || "",
            customer_address: initialTicket?.customer_address || "",
            unit_model: initialTicket?.unit_model || "",
            serial_number: initialTicket?.serial_number || "",
            status: initialTicket?.status || "berbayar",
            status_note: initialTicket?.status_note || "",
            work_status: (initialTicket?.work_status || "belum_selesai") as
                | "belum_selesai"
                | "selesai",
            work_types: initialTicket?.work_types || ([] as string[]),
            other_work_text: initialTicket?.other_work_text || "",
            mainwork_center: initialTicket?.mainwork_center || "Pulogadung",
            start_time: initialTicket?.start_time || "",
            finish_time: initialTicket?.finish_time || "",
            visit_photo: null as File | null,
            completion_photo: null as File | null,
            visit_photo_url: initialTicket?.visit_photo || "",
            completion_photo_url: initialTicket?.completion_photo || "",
            notes: initialTicket?.notes || "",
        });

    const [visitPreview, setVisitPreview] = useState<string | null>(
        initialTicket?.visit_photo || null,
    );
    const [completionPreview, setCompletionPreview] = useState<string | null>(
        initialTicket?.completion_photo || null,
    );

    const [cameraTarget, setCameraTarget] = useState<
        "visit" | "completion" | null
    >(null);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [selectedZoomPhoto, setSelectedZoomPhoto] = useState<{
        url: string;
        title: string;
    } | null>(null);
    const visitFileInputRef = React.useRef<HTMLInputElement>(null);
    const completionFileInputRef = React.useRef<HTMLInputElement>(null);
    const visitCameraInputRef = React.useRef<HTMLInputElement>(null);
    const completionCameraInputRef = React.useRef<HTMLInputElement>(null);

    const handleCameraCapture = async (file: File, previewUrl: string) => {
        const compressedFile = await compressImage(file);
        if (cameraTarget === "visit") {
            setData("visit_photo", compressedFile);
            setVisitPreview(previewUrl);
        } else if (cameraTarget === "completion") {
            setData("completion_photo", compressedFile);
            setCompletionPreview(previewUrl);
        }
        setCameraTarget(null);
    };

    const handleRemoveVisitPhoto = () => {
        setData((prev) => ({
            ...prev,
            visit_photo: null,
            visit_photo_url: "",
        }));
        setVisitPreview(null);
        if (visitFileInputRef.current) visitFileInputRef.current.value = "";
    };

    const handleRemoveCompletionPhoto = () => {
        setData((prev) => ({
            ...prev,
            completion_photo: null,
            completion_photo_url: "",
        }));
        setCompletionPreview(null);
        if (completionFileInputRef.current)
            completionFileInputRef.current.value = "";
    };

    const handleVisitFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            e.target.value = "";
            const compressed = await compressImage(file);
            setData("visit_photo", compressed);
            setVisitPreview(URL.createObjectURL(compressed));
        }
    };

    const handleCompletionFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            e.target.value = "";
            const compressed = await compressImage(file);
            setData("completion_photo", compressed);
            setCompletionPreview(URL.createObjectURL(compressed));
        }
    };

    const handleApplyScannedDocument = (
        scanned: ParsedRepairDocument,
        imageFile?: File | null,
    ) => {
        setData((prev) => {
            const next = { ...prev };
            if (scanned.notif_number) next.notif_number = scanned.notif_number;
            if (scanned.deadline) {
                next.deadline = scanned.deadline;
                next.service_date = scanned.deadline;
            }
            if (scanned.customer_name)
                next.customer_name = scanned.customer_name;
            if (scanned.customer_phone)
                next.customer_phone = scanned.customer_phone;
            if (scanned.customer_address)
                next.customer_address = scanned.customer_address;
            if (scanned.unit_model) next.unit_model = scanned.unit_model;
            if (scanned.serial_number)
                next.serial_number = scanned.serial_number;
            if (scanned.status) next.status = scanned.status;
            if (scanned.status_note) next.status_note = scanned.status_note;
            if (scanned.work_status) next.work_status = scanned.work_status;
            if (scanned.work_types && scanned.work_types.length > 0) {
                const validSet = new Set<string>(WORK_TYPE_OPTIONS);
                const matched: string[] = [];
                const extras: string[] = [];

                for (const wt of scanned.work_types) {
                    if (validSet.has(wt)) {
                        if (!matched.includes(wt)) matched.push(wt);
                    } else if (wt.trim()) {
                        extras.push(wt.trim());
                    }
                }

                if (extras.length > 0) {
                    if (!matched.includes('Lain-lain')) matched.push('Lain-lain');
                    next.other_work_text = extras.join(', ');
                }
                next.work_types = matched;
            }
            if (scanned.start_time) next.start_time = scanned.start_time;
            if (scanned.finish_time) next.finish_time = scanned.finish_time;
            if (scanned.notes) {
                next.notes = prev.notes
                    ? `${prev.notes}\n${scanned.notes}`
                    : scanned.notes;
            }
            if (imageFile) {
                next.visit_photo = imageFile;
            }
            return next;
        });

        if (imageFile) {
            setVisitPreview(URL.createObjectURL(imageFile));
        }

        toast.success("Data laporan reparasi berhasil disalin ke formulir!");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && initialTicket) {
            post(`/tickets/${initialTicket.id}?_method=PUT`, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success(
                        `Tiket ${initialTicket.notif_number} berhasil diperbarui`,
                    );
                },
                onError: () => {
                    toast.error(
                        "Gagal memperbarui tiket servis. Periksa isian formulir.",
                    );
                },
            });
        } else {
            post("/tickets", {
                forceFormData: true,
                onSuccess: () => {
                    toast.success("Tiket servis baru berhasil ditambahkan");
                },
                onError: () => {
                    toast.error(
                        "Gagal menambahkan tiket servis. Periksa isian formulir.",
                    );
                },
            });
        }
    };

    const backUrl =
        isEdit && initialTicket ? `/tickets/${initialTicket.id}` : "/dashboard";

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-[#0b0f19] font-sans text-slate-800 antialiased dark:text-slate-100 flex flex-col justify-between">
            {/* Top Navigation Red Header matching Aquos Platinum Branding */}
            <header className="sticky top-0 z-40 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-[#170a0e] dark:via-[#1f0d14] dark:to-[#170a0e] text-white shadow-lg shadow-red-950/20 border-b border-red-500/30 dark:border-red-900/40 backdrop-blur-md">
                <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8 gap-3">
                    {/* Left: Kembali & Context Branding */}
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-white/20 hover:text-white rounded-xl h-9 px-2.5 sm:px-3 shrink-0 border border-white/25 bg-white/10 active:scale-95 transition-all"
                        >
                            <Link
                                href={backUrl}
                                className="flex items-center gap-1.5 text-xs font-semibold"
                            >
                                <ArrowLeft className="size-4 shrink-0" />
                                <span>Kembali</span>
                            </Link>
                        </Button>
                        <div className="h-5 sm:h-6 w-px bg-white/25 hidden xs:block shrink-0" />
                        <div className="flex items-center gap-2 min-w-0">
                            <img
                                src="/icons/logo.png"
                                alt="Aquos"
                                className="h-7 sm:h-8 w-auto object-contain shrink-0 drop-shadow-sm hidden sm:block"
                            />
                            <div className="min-w-0">
                                <h1 className="font-black text-xs xs:text-sm sm:text-base tracking-tight text-white truncate">
                                    {isEdit
                                        ? `Edit Tiket #${initialTicket?.notif_number}`
                                        : "Tambah Notifikasi Tiket Baru"}
                                </h1>
                                <p className="text-[10px] text-red-100/90 hidden xs:block truncate">
                                    Aquos Platinum &bull; Pulogadung &amp; MOI
                                    Mainwork
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Theme Toggle & Quick Save Button */}
                    <div className="flex items-center gap-2 shrink-0">
                        <ThemeToggle className="bg-white/15 hover:bg-white/25 border-white/25 text-white dark:bg-black/35 dark:hover:bg-black/50 dark:border-white/20 h-9 w-9" />

                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-white text-red-700 hover:bg-red-50 dark:bg-white dark:text-red-700 dark:hover:bg-red-50 text-xs font-bold rounded-xl h-9 px-3.5 sm:px-4 shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            {processing ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Save className="size-3.5 shrink-0" />
                            )}
                            <span className="hidden xs:inline">
                                {isEdit ? "Simpan" : "Simpan Tiket"}
                            </span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Form Container */}
            <main className="mx-auto max-w-7xl w-full px-3.5 py-5 sm:px-6 sm:py-7 lg:px-8 flex-1">
                <form
                    id="ticket-form"
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Banner Pindai Dokumen Fisik (OCR) */}
                    <div className="relative overflow-hidden rounded-2xl border border-red-200/90 dark:border-red-900/50 bg-gradient-to-br from-red-500/10 via-rose-500/5 to-white dark:from-red-950/40 dark:via-red-900/20 dark:to-[#111726] p-4 sm:p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start sm:items-center gap-3.5">
                                <div className="size-11 sm:size-12 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30">
                                    <ScanText className="size-6 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                            Pindai Lembar Fisik / Nota Reparasi
                                        </h2>
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-600 text-white shadow-xs">
                                            Otomatis
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                                        Foto nota reparasi fisik untuk mengisi
                                        otomatis nomor notif, nama, telepon,
                                        alamat, tipe unit, hingga serial number.
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                onClick={() => setIsScannerOpen(true)}
                                className="shrink-0 w-full sm:w-auto h-10 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-600/25 active:scale-95 cursor-pointer transition-all flex items-center justify-center gap-2"
                            >
                                <ScanText className="size-4" />
                                <span>Pindai Dokumen</span>
                            </Button>
                        </div>
                    </div>

                    {/* SECTION 1: Informasi Tiket & Waktu */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111726] p-4 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60 flex items-center justify-center shrink-0">
                                    <Calendar className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Data Tiket &amp; Jadwal Pengerjaan
                                </h3>
                            </div>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                                Identitas &amp; Jadwal
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label
                                    htmlFor="notif_number"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                                >
                                    Nomor Notifikasi{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="notif_number"
                                    value={data.notif_number}
                                    onChange={(e) =>
                                        setData("notif_number", e.target.value)
                                    }
                                    placeholder="Contoh: 200847291"
                                    className="font-mono uppercase font-bold text-xs sm:text-sm bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl h-10.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    required
                                />
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    Nomor unik pada lembar fisik laporan / nota
                                    servis.
                                </p>
                                {errors.notif_number && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.notif_number}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label
                                    htmlFor="mainwork_center"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                                >
                                    Mainwork Center{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <select
                                    id="mainwork_center"
                                    value={data.mainwork_center}
                                    onChange={(e) =>
                                        setData(
                                            "mainwork_center",
                                            e.target.value,
                                        )
                                    }
                                    className="flex h-10.5 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-[#0b0f19] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 shadow-2xs hover:border-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
                                    required
                                >
                                    <option value="Pulogadung">
                                        Pulogadung
                                    </option>
                                    <option value="MOI">MOI</option>
                                    <option value="Lain-lain">Lain-lain</option>
                                </select>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                    Cabang pusat servis yang menangani.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div>
                                <Label
                                    htmlFor="deadline"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                                >
                                    Tanggal Batas Waktu (Deadline){" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="deadline"
                                    type="date"
                                    value={data.deadline}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData((prev) => ({
                                            ...prev,
                                            deadline: val,
                                            service_date: val,
                                        }));
                                    }}
                                    className="text-xs sm:text-sm bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl h-10.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    required
                                />
                                {errors.deadline && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.deadline}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label
                                    htmlFor="service_date"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                                >
                                    Tanggal Pengerjaan Fisik
                                </Label>
                                <Input
                                    id="service_date"
                                    type="date"
                                    value={data.service_date}
                                    onChange={(e) =>
                                        setData("service_date", e.target.value)
                                    }
                                    className="text-xs sm:text-sm bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl h-10.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Data Pelanggan & Alamat */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111726] p-4 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60 flex items-center justify-center shrink-0">
                                    <User className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Data Pelanggan &amp; Lokasi
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label
                                    htmlFor="customer_name"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                                >
                                    Nama Lengkap Pelanggan{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="customer_name"
                                    value={data.customer_name}
                                    onChange={(e) =>
                                        setData("customer_name", e.target.value)
                                    }
                                    placeholder="Contoh: Budi Santoso"
                                    className="text-xs sm:text-sm bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl h-10.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    required
                                />
                                {errors.customer_name && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.customer_name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label
                                    htmlFor="customer_phone"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                                >
                                    Nomor Handphone / WhatsApp{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="customer_phone"
                                    value={data.customer_phone}
                                    onChange={(e) =>
                                        setData(
                                            "customer_phone",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Contoh: 08123456789"
                                    className="font-mono text-xs sm:text-sm bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl h-10.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    required
                                />
                                {errors.customer_phone && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.customer_phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label
                                htmlFor="customer_address"
                                className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                            >
                                Alamat Lengkap Domisili / Lokasi Pengerjaan
                            </Label>
                            <Textarea
                                id="customer_address"
                                value={data.customer_address}
                                onChange={(e) =>
                                    setData("customer_address", e.target.value)
                                }
                                placeholder="Jalan, nomor rumah, RT/RW, kelurahan, patokan lokasi..."
                                rows={2}
                                className="bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl text-xs sm:text-sm border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                            />
                            {errors.customer_address && (
                                <p className="text-xs text-red-500 mt-1">
                                    {errors.customer_address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* SECTION 3: Data Unit & Perangkat */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111726] p-4 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60 flex items-center justify-center shrink-0">
                                    <Wrench className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Data Unit &amp; Perangkat Elektronik
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label
                                    htmlFor="unit_model"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                                >
                                    Model / Tipe Unit{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="unit_model"
                                    value={data.unit_model}
                                    onChange={(e) =>
                                        setData("unit_model", e.target.value)
                                    }
                                    placeholder="Contoh: 4T-C50BK1X / SJ-236ND"
                                    className="font-mono uppercase font-bold text-xs sm:text-sm bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl h-10.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    required
                                />
                                {errors.unit_model && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.unit_model}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label
                                    htmlFor="serial_number"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                                >
                                    Nomor Seri (Serial Number){" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="serial_number"
                                    value={data.serial_number}
                                    onChange={(e) =>
                                        setData("serial_number", e.target.value)
                                    }
                                    placeholder="Contoh: 911048291"
                                    className="font-mono uppercase font-bold text-xs sm:text-sm bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl h-10.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                    required
                                />
                                {errors.serial_number && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.serial_number}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Status Garansi & Pengerjaan */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111726] p-4 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60 flex items-center justify-center shrink-0">
                                    <DollarSign className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Status Garansi &amp; Pengerjaan
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                                    Status Biaya / Garansi{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData("status", "berbayar")
                                        }
                                        className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
                                            data.status === "berbayar"
                                                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25 ring-2 ring-blue-500/30"
                                                : "bg-slate-50 dark:bg-[#0b0f19] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                    >
                                        <CheckCircle2 className="size-4 shrink-0" />
                                        <span>Berbayar</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData("status", "tidak_berbayar")
                                        }
                                        className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
                                            data.status === "tidak_berbayar"
                                                ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25 ring-2 ring-amber-500/30"
                                                : "bg-slate-50 dark:bg-[#0b0f19] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                    >
                                        <ShieldCheck className="size-4 shrink-0" />
                                        <span>Garansi</span>
                                    </button>
                                </div>
                                {data.status === "tidak_berbayar" && (
                                    <div className="mt-2.5">
                                        <Input
                                            value={data.status_note}
                                            onChange={(e) =>
                                                setData(
                                                    "status_note",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Keterangan khusus (Garansi Sharp / Klaim Toko)"
                                            className="text-xs bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl h-9.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                                    Status Pengerjaan{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                "work_status",
                                                "belum_selesai",
                                            )
                                        }
                                        className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
                                            data.work_status === "belum_selesai"
                                                ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/25 ring-2 ring-red-500/30"
                                                : "bg-slate-50 dark:bg-[#0b0f19] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                    >
                                        <Clock className="size-4 shrink-0" />
                                        <span>Belum Selesai</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData("work_status", "selesai")
                                        }
                                        className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
                                            data.work_status === "selesai"
                                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/30"
                                                : "bg-slate-50 dark:bg-[#0b0f19] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                    >
                                        <CheckCircle2 className="size-4 shrink-0" />
                                        <span>Selesai</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: Rincian Pekerjaan Servis & Waktu */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111726] p-4 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60 flex items-center justify-center shrink-0">
                                    <Wrench className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Rincian Pekerjaan &amp; Jam Kerja
                                </h3>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b0f19] p-3 sm:p-4">
                            <WorkTypeSelector
                                selectedValues={data.work_types}
                                otherWorkText={data.other_work_text}
                                onChange={(values, otherText) => {
                                    setData((prev) => ({
                                        ...prev,
                                        work_types: values,
                                        other_work_text:
                                            otherText !== undefined
                                                ? otherText
                                                : prev.other_work_text,
                                    }));
                                }}
                                error={errors.work_types}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <Label
                                    htmlFor="start_time"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                                >
                                    Jam Mulai Pengerjaan
                                </Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(e) =>
                                        setData("start_time", e.target.value)
                                    }
                                    className="text-xs sm:text-sm bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl h-10.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor="finish_time"
                                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5"
                                >
                                    Jam Selesai Pengerjaan
                                </Label>
                                <Input
                                    id="finish_time"
                                    type="time"
                                    value={data.finish_time}
                                    onChange={(e) =>
                                        setData("finish_time", e.target.value)
                                    }
                                    className="text-xs sm:text-sm bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl h-10.5 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6: Dokumentasi Foto */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111726] p-4 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60 flex items-center justify-center shrink-0">
                                    <Camera className="size-4" />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    Dokumentasi Foto Lapangan
                                </h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Foto Kunjungan */}
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0b0f19] space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Foto Kunjungan / Unit Awal
                                    </Label>
                                    {visitPreview && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveVisitPhoto}
                                            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                                        >
                                            <Trash2 className="size-3.5" />{" "}
                                            Hapus Foto
                                        </button>
                                    )}
                                </div>

                                {visitPreview ? (
                                    <div
                                        onClick={() =>
                                            setSelectedZoomPhoto({
                                                url: visitPreview,
                                                title: "Foto Kunjungan / Unit Awal",
                                            })
                                        }
                                        className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black cursor-pointer group shadow-xs"
                                        title="Klik untuk memperbesar foto"
                                    >
                                        <img
                                            src={visitPreview}
                                            alt="Foto Kunjungan"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                                            <Eye className="size-4" />
                                            <span>Perbesar Foto</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center space-y-1.5">
                                        <Camera className="size-6 text-slate-400 mx-auto" />
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Belum ada foto kunjungan
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (isMobileDevice()) {
                                                visitCameraInputRef.current?.click();
                                            } else {
                                                setCameraTarget("visit");
                                            }
                                        }}
                                        className="flex-1 rounded-xl text-xs gap-1.5 cursor-pointer h-10 border-slate-300 dark:border-slate-700"
                                    >
                                        <Camera className="size-3.5 text-red-600" />
                                        <span>Buka Kamera</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            visitFileInputRef.current?.click()
                                        }
                                        className="flex-1 rounded-xl text-xs gap-1.5 cursor-pointer h-10 border-slate-300 dark:border-slate-700"
                                    >
                                        <Upload className="size-3.5 text-blue-600" />
                                        <span>Unggah Berkas</span>
                                    </Button>
                                    <input
                                        ref={visitCameraInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handleVisitFileChange}
                                    />
                                    <input
                                        ref={visitFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleVisitFileChange}
                                    />
                                </div>
                            </div>

                            {/* Foto Penyelesaian */}
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0b0f19] space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        Foto Selesai / Pengerjaan Beres
                                    </Label>
                                    {completionPreview && (
                                        <button
                                            type="button"
                                            onClick={
                                                handleRemoveCompletionPhoto
                                            }
                                            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                                        >
                                            <Trash2 className="size-3.5" />{" "}
                                            Hapus Foto
                                        </button>
                                    )}
                                </div>

                                {completionPreview ? (
                                    <div
                                        onClick={() =>
                                            setSelectedZoomPhoto({
                                                url: completionPreview,
                                                title: "Foto Selesai / Pengerjaan Beres",
                                            })
                                        }
                                        className="relative aspect-video rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black cursor-pointer group shadow-xs"
                                        title="Klik untuk memperbesar foto"
                                    >
                                        <img
                                            src={completionPreview}
                                            alt="Foto Selesai"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                                            <Eye className="size-4" />
                                            <span>Perbesar Foto</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center space-y-1.5">
                                        <Camera className="size-6 text-slate-400 mx-auto" />
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Belum ada foto penyelesaian
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            if (isMobileDevice()) {
                                                completionCameraInputRef.current?.click();
                                            } else {
                                                setCameraTarget("completion");
                                            }
                                        }}
                                        className="flex-1 rounded-xl text-xs gap-1.5 cursor-pointer h-10 border-slate-300 dark:border-slate-700"
                                    >
                                        <Camera className="size-3.5 text-red-600" />
                                        <span>Buka Kamera</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            completionFileInputRef.current?.click()
                                        }
                                        className="flex-1 rounded-xl text-xs gap-1.5 cursor-pointer h-10 border-slate-300 dark:border-slate-700"
                                    >
                                        <Upload className="size-3.5 text-blue-600" />
                                        <span>Unggah Berkas</span>
                                    </Button>
                                    <input
                                        ref={completionCameraInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className="hidden"
                                        onChange={handleCompletionFileChange}
                                    />
                                    <input
                                        ref={completionFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleCompletionFileChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 7: Catatan Teknisi */}
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#111726] p-4 sm:p-6 shadow-xs space-y-3">
                        <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="size-8 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60 flex items-center justify-center shrink-0">
                                <FileText className="size-4" />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Catatan Teknisi &amp; Keterangan Perbaikan
                            </h3>
                        </div>
                        <Textarea
                            id="notes"
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            placeholder="Catatan kendala unit, detail perbaikan, spare part yang diganti, atau instruksi lanjutan..."
                            rows={3}
                            className="bg-slate-50/60 dark:bg-[#0b0f19] rounded-xl text-xs sm:text-sm border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        />
                    </div>

                    {/* Anchored Bottom Actions (Not floating/obscuring content) */}
                    <div className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/80 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(backUrl)}
                            disabled={processing}
                            className="w-full sm:w-auto h-11 px-6 rounded-xl border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                            <ArrowLeft className="size-4 mr-1.5" />
                            <span>Batal &amp; Kembali</span>
                        </Button>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto h-11 px-8 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>Menyimpan...</span>
                                    </>
                                ) : isEdit ? (
                                    <>
                                        <Save className="size-4" />
                                        <span>Simpan Perubahan</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="size-4" />
                                        <span>Simpan Tiket Baru</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </main>

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
                title={
                    cameraTarget === "visit"
                        ? "Ambil Foto Kunjungan / Unit Awal"
                        : "Ambil Foto Selesai / Pengerjaan Beres"
                }
            />

            {/* Quick Photo Zoom Dialog */}
            {selectedZoomPhoto && (
                <Dialog
                    open={Boolean(selectedZoomPhoto)}
                    onOpenChange={() => setSelectedZoomPhoto(null)}
                >
                    <DialogContent className="max-w-3xl p-3 bg-black/95 border-zinc-800">
                        <div className="relative flex flex-col items-center">
                            <img
                                src={selectedZoomPhoto.url}
                                alt={selectedZoomPhoto.title}
                                className="max-h-[82vh] w-auto object-contain rounded-xl"
                            />
                            <div className="w-full text-center text-xs text-zinc-300 pt-3 font-semibold">
                                {selectedZoomPhoto.title}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
