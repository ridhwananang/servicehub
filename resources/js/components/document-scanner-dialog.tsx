import React, { useState, useRef, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Camera,
    Upload,
    ScanLine,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    FileText,
    Image as ImageIcon,
    SwitchCamera,
    Check,
    ChevronDown,
    ChevronUp,
    Cpu,
    Zap,
} from "lucide-react";
import { toast } from "sonner";
import { createWorker } from "tesseract.js";
import { compressImage } from "@/lib/image-compressor";
import {
    parseRepairDocument,
    type ParsedRepairDocument,
} from "@/lib/document-parser";

interface DocumentScannerDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (data: ParsedRepairDocument, imageFile?: File | null) => void;
}

/**
 * Preprocesses receipt/document image for optimal OCR extraction:
 * 1. Rescales low-resolution images so dot-matrix text characters connect properly.
 * 2. Applies weighted grayscale to cancel colored backgrounds (like green Sharp receipts).
 * 3. Increases text-to-background contrast so characters stand out sharply.
 */
async function preprocessImageToCanvas(file: File): Promise<HTMLCanvasElement> {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement("canvas");

            // Scale to optimal OCR dimensions
            const maxDim = Math.max(img.width, img.height);
            let scale = 1;
            if (maxDim < 1800) {
                scale = 1800 / maxDim;
            } else if (maxDim > 2600) {
                scale = 2600 / maxDim;
            }

            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(canvas);
                return;
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            try {
                const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height,
                );
                const data = imageData.data;

                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    // Weighted grayscale: de-emphasizes green channel to brighten green paper
                    let gray = 0.45 * r + 0.15 * g + 0.4 * b;

                    // High contrast stretch
                    if (gray < 130) {
                        gray = Math.max(0, gray * 0.7); // Darken text
                    } else {
                        gray = Math.min(255, gray * 1.3 + 25); // Whiten background
                    }

                    data[i] = gray;
                    data[i + 1] = gray;
                    data[i + 2] = gray;
                }

                ctx.putImageData(imageData, 0, 0);
            } catch (e) {
                console.warn("Preprocessing canvas warning:", e);
            }

            resolve(canvas);
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            const fallbackCanvas = document.createElement("canvas");
            resolve(fallbackCanvas);
        };

        img.src = url;
    });
}

export function DocumentScannerDialog({
    isOpen,
    onClose,
    onApply,
}: DocumentScannerDialogProps) {
    const [step, setStep] = useState<
        "select" | "camera" | "processing" | "review"
    >("select");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [ocrProgress, setOcrProgress] = useState<number>(0);
    const [ocrStatusText, setOcrStatusText] = useState<string>("");
    const [parsedData, setParsedData] = useState<ParsedRepairDocument | null>(
        null,
    );
    const [showRawText, setShowRawText] = useState<boolean>(false);
    const [setAsVisitPhoto, setSetAsVisitPhoto] = useState<boolean>(true);
    const [scanEngine, setScanEngine] = useState<"ai" | "tesseract">("ai");

    // Camera stream states
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [cameraFacing, setCameraFacing] = useState<"environment" | "user">(
        "environment",
    );
    const [cameraError, setCameraError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset states when closed
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            setStep("select");
            setImageFile(null);
            setImagePreview(null);
            setOcrProgress(0);
            setOcrStatusText("");
            setParsedData(null);
            setCameraError(null);
        }
    }, [isOpen]);

    // Start camera stream
    const startCamera = async (
        facing: "environment" | "user" = "environment",
    ) => {
        setCameraError(null);
        setStep("camera");
        try {
            if (mediaStream) {
                mediaStream.getTracks().forEach((track) => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: facing },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                },
                audio: false,
            });

            setMediaStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (err: any) {
            console.error("Camera access error:", err);
            setCameraError(
                "Tidak dapat mengakses kamera. Pastikan izin kamera aktif atau gunakan tombol Pilih Galeri / File.",
            );
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            setMediaStream(null);
        }
    };

    const handleSwitchCamera = () => {
        const nextFacing =
            cameraFacing === "environment" ? "user" : "environment";
        setCameraFacing(nextFacing);
        startCamera(nextFacing);
    };

    const handleCaptureFromCamera = async () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
                async (blob) => {
                    if (blob) {
                        const file = new File(
                            [blob],
                            `scan-dokumen-${Date.now()}.jpg`,
                            {
                                type: "image/jpeg",
                            },
                        );
                        stopCamera();
                        processDocumentImage(file);
                    }
                },
                "image/jpeg",
                0.95,
            );
        }
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            processDocumentImage(file);
        }
    };

    const processWithAi = async (
        fileToUpload: File,
    ): Promise<ParsedRepairDocument> => {
        setOcrProgress(35);
        setOcrStatusText(
            "Mengirim dan menganalisis dokumen dengan Cloud AI Vision...",
        );

        const formData = new FormData();
        formData.append("document", fileToUpload);

        const csrfToken =
            document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content") || "";

        const response = await fetch("/tickets/scan-document", {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": csrfToken,
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            body: formData,
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
            const message =
                json.message || "Gagal memproses dokumen dengan Cloud AI.";
            const err = new Error(message);
            (err as any).code = json.code;
            throw err;
        }

        return {
            ...json.data,
            provider: json.provider || json.data?.provider || "groq",
        };
    };

    const processWithTesseract = async (
        file: File,
    ): Promise<ParsedRepairDocument> => {
        setOcrProgress(20);
        setOcrStatusText("Mengoptimalkan kontras dokumen untuk OCR...");

        const ocrCanvas = await preprocessImageToCanvas(file);

        setOcrProgress(30);
        setOcrStatusText("Menyiapkan OCR Engine Tesseract...");

        const worker = await createWorker("eng", 1, {
            logger: (m) => {
                if (m.status === "recognizing text") {
                    const prog = Math.round(m.progress * 60) + 30;
                    setOcrProgress(prog);
                    setOcrStatusText(
                        `Mengenali karakter Tesseract... ${Math.round(m.progress * 100)}%`,
                    );
                } else if (m.status === "loading tesseract core") {
                    setOcrProgress(25);
                    setOcrStatusText("Memuat core pengenalan karakter...");
                }
            },
        });

        setOcrProgress(50);
        setOcrStatusText("Mengenali teks dokumen...");

        const res = await worker.recognize(ocrCanvas);
        let recognizedText = res.data.text || "";

        setOcrProgress(80);
        setOcrStatusText("Membaca detail data pelanggan & alamat...");

        // Pass 2: Crop middle customer block (left 65%, y: 26% to 70%)
        // This completely eliminates interference from right-column warranty/payment tables
        try {
            const custCanvas = document.createElement("canvas");
            custCanvas.width = Math.round(ocrCanvas.width * 0.65);
            custCanvas.height = Math.round(ocrCanvas.height * 0.45);
            const custCtx = custCanvas.getContext("2d");
            if (custCtx) {
                custCtx.drawImage(
                    ocrCanvas,
                    0,
                    Math.round(ocrCanvas.height * 0.26),
                    custCanvas.width,
                    custCanvas.height,
                    0,
                    0,
                    custCanvas.width,
                    custCanvas.height,
                );
                const resCust = await worker.recognize(custCanvas);
                const custText = resCust.data.text || "";
                if (custText.trim().length > 10) {
                    recognizedText =
                        custText + "\n\n=== FULL DOC ===\n" + recognizedText;
                }
            }
        } catch (cropErr) {
            console.warn("Customer crop pass warning:", cropErr);
        }

        await worker.terminate();

        const parsed = parseRepairDocument(recognizedText);
        return {
            ...parsed,
            provider: "tesseract",
        };
    };

    const processDocumentImage = async (file: File) => {
        setStep("processing");
        setOcrProgress(10);
        setOcrStatusText("Mengompresi dan mengoptimalkan gambar dokumen...");

        try {
            const compressed = await compressImage(file);
            setImageFile(compressed);
            const previewUrl = URL.createObjectURL(compressed);
            setImagePreview(previewUrl);

            let result: ParsedRepairDocument | null = null;

            if (scanEngine === "ai") {
                try {
                    result = await processWithAi(compressed);
                    const provLabel =
                        result.provider === "groq"
                            ? "Groq AI (Qwen Vision)"
                            : result.provider === "gemini"
                              ? "Gemini AI"
                              : "Cloud AI";
                    toast.success(
                        `Dokumen berhasil dianalisis dengan ${provLabel}!`,
                    );
                } catch (aiErr: any) {
                    console.warn(
                        "AI scan error, fallback to Tesseract:",
                        aiErr,
                    );
                    toast.warning(
                        `AI Server: ${aiErr.message || "Tidak tersedia"}. Beralih otomatis ke Tesseract OCR...`,
                    );
                    setOcrStatusText(
                        "Beralih ke pemindaian lokal Tesseract OCR...",
                    );
                    result = await processWithTesseract(file);
                }
            } else {
                result = await processWithTesseract(file);
            }

            setParsedData(result);
            setOcrProgress(100);
            setOcrStatusText("Selesai! Data berhasil dibaca.");
            setStep("review");
        } catch (err: any) {
            console.error("OCR Processing error:", err);
            toast.error(
                "Gagal mengenali dokumen: " + (err.message || "Error OCR"),
            );
            setOcrStatusText(
                "Gagal mengenali dokumen: " + (err.message || "Error OCR"),
            );
            setStep("select");
        }
    };

    const handleApplyData = () => {
        if (!parsedData) return;
        onApply(parsedData, setAsVisitPhoto ? imageFile : null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[92vh] overflow-y-auto custom-scrollbar p-0 sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl [&>button]:text-white/90 [&>button:hover]:text-white [&>button]:focus:ring-white [&>button]:z-20">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 dark:from-red-950 dark:via-red-900 dark:to-red-950 text-white p-5 pb-5 sm:p-6 sm:pb-6 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-xs font-semibold px-2 py-0.5 text-xs">
                            AI & OCR Scanner
                        </Badge>
                        <span className="text-xs text-red-100 font-medium">
                            Laporan Reparasi SHARP / Umum
                        </span>
                    </div>
                    <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-xs">
                        Scan & Baca Dokumen Servis
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-red-100 mt-1">
                        Foto lembar dokumen pengerjaan fisik atau unggah gambar
                        untuk mengisi data formulir secara otomatis.
                    </DialogDescription>
                </div>

                {/* Body Content based on Step */}
                <div className="p-4 sm:p-6">
                    {/* STEP 1: Select Input Method */}
                    {step === "select" && (
                        <div className="space-y-4 sm:space-y-5">
                            {/* Engine Selection Toggle Card */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`size-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                                            scanEngine === "ai"
                                                ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                                                : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600"
                                        }`}
                                    >
                                        {scanEngine === "ai" ? (
                                            <Sparkles className="size-5" />
                                        ) : (
                                            <Cpu className="size-5" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                                {scanEngine === "ai"
                                                    ? "AI Vision (Groq Qwen 3.8)"
                                                    : "Tesseract OCR (Lokal)"}
                                            </span>
                                            {scanEngine === "ai" && (
                                                <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[10px] px-1.5 py-0 font-medium">
                                                    Akurasi Tinggi & Kilat
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            {scanEngine === "ai"
                                                ? "Ekstraksi AI cerdas super cepat via Groq (otomatis cadangkan ke Tesseract jika offline)"
                                                : "Pemrosesan karakter langsung di browser tanpa koneksi internet"}
                                        </p>
                                    </div>
                                </div>

                                <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/70 dark:border-slate-700/70 shrink-0 self-end sm:self-center">
                                    <button
                                        type="button"
                                        onClick={() => setScanEngine("ai")}
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                            scanEngine === "ai"
                                                ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        Groq AI
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setScanEngine("tesseract")
                                        }
                                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                                            scanEngine === "tesseract"
                                                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200/60 dark:border-slate-700"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        <Cpu className="size-3" />
                                        Tesseract
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Option 1: Kamera Langsung */}
                                <button
                                    type="button"
                                    onClick={() => startCamera("environment")}
                                    className="flex flex-col items-center justify-center gap-3 p-6 sm:p-8 rounded-2xl border-2 border-dashed border-red-300 hover:border-red-600 bg-red-50/50 hover:bg-red-50/90 dark:border-red-800/80 dark:bg-red-950/30 dark:hover:bg-red-950/60 transition-all cursor-pointer group active:scale-[0.98]"
                                >
                                    <div className="size-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-110 transition-transform">
                                        <Camera className="size-7" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-base font-bold text-slate-900 dark:text-white block">
                                            Ambil Foto dengan Kamera
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                                            Arahkan kamera ponsel/laptop
                                            langsung ke lembar kertas
                                        </span>
                                    </div>
                                </button>

                                {/* Option 2: Upload File / Galeri */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="flex flex-col items-center justify-center gap-3 p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50/60 hover:bg-slate-100/80 dark:border-slate-700 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 transition-all cursor-pointer group active:scale-[0.98]"
                                >
                                    <div className="size-14 rounded-2xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                                        <Upload className="size-7" />
                                    </div>
                                    <div className="text-center">
                                        <span className="text-base font-bold text-slate-900 dark:text-white block">
                                            Pilih dari Galeri / File
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                                            Unggah foto JPG, PNG, atau scan
                                            tanda terima reparasi
                                        </span>
                                    </div>
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelected}
                                    className="hidden"
                                />
                            </div>

                            {/* Tips Card */}
                            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 flex items-start gap-2.5">
                                <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                                <div>
                                    <strong className="font-semibold block mb-0.5 text-amber-900 dark:text-amber-200">
                                        Tips Hasil Scan Maksimal:
                                    </strong>
                                    <span>
                                        Pastikan pencahayaan cukup terang, teks
                                        tidak blur, dan seluruh nomor
                                        notifikasi, nama konsumen, model unit,
                                        serta alamat terlihat jelas di dalam
                                        bingkai foto.
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Active Camera Viewfinder */}
                    {step === "camera" && (
                        <div className="space-y-4">
                            {cameraError ? (
                                <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-center text-xs text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300 space-y-3">
                                    <AlertCircle className="size-8 text-red-500 mx-auto" />
                                    <p>{cameraError}</p>
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            className="text-xs border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <Upload className="size-3.5 mr-1" />
                                            Pilih File Gambar
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setStep("select")}
                                            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                        >
                                            Kembali
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="relative aspect-[4/3] sm:aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Document alignment guide overlay */}
                                        <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-red-500/70 rounded-xl pointer-events-none flex flex-col justify-between p-2 sm:p-4">
                                            <span className="text-[10px] font-mono text-white/90 bg-black/70 px-2 py-0.5 rounded self-start backdrop-blur-xs">
                                                Posisikan Lembar Dokumen di
                                                dalam Kotak
                                            </span>
                                            <span className="text-[10px] font-mono text-white/90 bg-black/70 px-2 py-0.5 rounded self-end backdrop-blur-xs">
                                                Laporan Reparasi
                                            </span>
                                        </div>
                                    </div>

                                    {/* Camera Controls */}
                                    <div className="flex items-center justify-between gap-3 pt-1">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                stopCamera();
                                                setStep("select");
                                            }}
                                            className="rounded-xl cursor-pointer border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            Batal
                                        </Button>

                                        <Button
                                            type="button"
                                            onClick={handleCaptureFromCamera}
                                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer active:scale-95"
                                        >
                                            <Camera className="size-4" />
                                            Ambil & Pindai
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleSwitchCamera}
                                            title="Ganti Kamera Depan/Belakang"
                                            aria-label="Ganti Kamera"
                                            className="rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <SwitchCamera className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 3: Processing / Loading OCR */}
                    {step === "processing" && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="relative size-20 rounded-3xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center">
                                <ScanLine className="size-10 text-red-600 dark:text-red-400 animate-pulse" />
                                <Loader2 className="absolute size-22 text-red-600/30 dark:text-red-400/30 animate-spin" />
                            </div>

                            <div className="space-y-1 max-w-sm">
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    Memproses Dokumen...
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {ocrStatusText}
                                </p>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-red-600 to-rose-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${ocrProgress}%` }}
                                />
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                {ocrProgress}%
                            </span>
                        </div>
                    )}

                    {/* STEP 4: Review Extracted Data & Apply */}
                    {step === "review" && parsedData && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <CheckCircle2 className="size-5 text-emerald-600" />
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        Data Berhasil Dibaca dari Dokumen
                                    </span>
                                    {parsedData.provider === "tesseract" ? (
                                        <Badge className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 flex items-center gap-1 font-semibold">
                                            <Cpu className="size-3" />
                                            Tesseract OCR
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] px-2 py-0.5 flex items-center gap-1 font-semibold">
                                            <Sparkles className="size-3" />
                                            {parsedData.provider === "groq"
                                                ? "Groq AI"
                                                : "Gemini AI"}
                                        </Badge>
                                    )}
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setStep("select")}
                                    className="text-xs rounded-lg gap-1 cursor-pointer border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <RefreshCw className="size-3" />
                                    Scan Ulang
                                </Button>
                            </div>

                            {/* Grid: Image Thumbnail + Extracted Form Preview */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
                                {/* Left/Top: Scanned Image Thumbnail */}
                                <div className="lg:col-span-4 space-y-3">
                                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 p-2.5 overflow-hidden">
                                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">
                                            Gambar Dokumen Terpindai:
                                        </span>
                                        {imagePreview && (
                                            <div className="h-44 sm:h-56 lg:h-auto lg:aspect-[3/4] w-full rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-black flex items-center justify-center">
                                                <img
                                                    src={imagePreview}
                                                    alt="Scan Dokumen"
                                                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Option to attach scanned image as Visit Photo */}
                                    <label className="flex items-start gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={setAsVisitPhoto}
                                            onChange={(e) =>
                                                setSetAsVisitPhoto(
                                                    e.target.checked,
                                                )
                                            }
                                            className="size-4 mt-0.5 rounded text-red-600 focus:ring-red-500"
                                        />
                                        <span>
                                            Gunakan foto ini sebagai{" "}
                                            <strong>
                                                Foto Kunjungan / Unit Awal
                                            </strong>{" "}
                                            tiket
                                        </span>
                                    </label>
                                </div>

                                {/* Right/Bottom: Editable Extracted Fields */}
                                <div className="lg:col-span-8 space-y-3 lg:max-h-[55vh] lg:overflow-y-auto lg:custom-scrollbar lg:pr-1">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                No. Notifikasi (Unique)
                                            </Label>
                                            <Input
                                                value={parsedData.notif_number}
                                                onChange={(e) =>
                                                    setParsedData({
                                                        ...parsedData,
                                                        notif_number:
                                                            e.target.value,
                                                    })
                                                }
                                                className="h-8 text-xs font-mono font-bold mt-1 uppercase bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                placeholder="NTF-2026-..."
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                Deadline / Tanggal
                                            </Label>
                                            <Input
                                                type="date"
                                                value={parsedData.deadline}
                                                onChange={(e) =>
                                                    setParsedData({
                                                        ...parsedData,
                                                        deadline:
                                                            e.target.value,
                                                        service_date:
                                                            e.target.value,
                                                    })
                                                }
                                                className="h-8 text-xs mt-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                Nama Pelanggan
                                            </Label>
                                            <Input
                                                value={parsedData.customer_name}
                                                onChange={(e) =>
                                                    setParsedData({
                                                        ...parsedData,
                                                        customer_name:
                                                            e.target.value,
                                                    })
                                                }
                                                className="h-8 text-xs font-semibold mt-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                placeholder="Nama Pelanggan"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                No Handphone / WhatsApp
                                            </Label>
                                            <Input
                                                value={
                                                    parsedData.customer_phone
                                                }
                                                onChange={(e) =>
                                                    setParsedData({
                                                        ...parsedData,
                                                        customer_phone:
                                                            e.target.value,
                                                    })
                                                }
                                                className="h-8 text-xs font-mono mt-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                placeholder="08..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                            Alamat Lengkap
                                        </Label>
                                        <Input
                                            value={parsedData.customer_address}
                                            onChange={(e) =>
                                                setParsedData({
                                                    ...parsedData,
                                                    customer_address:
                                                        e.target.value,
                                                })
                                            }
                                            className="h-8 text-xs mt-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                            placeholder="Alamat pelanggan"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                Model Unit
                                            </Label>
                                            <Input
                                                value={parsedData.unit_model}
                                                onChange={(e) =>
                                                    setParsedData({
                                                        ...parsedData,
                                                        unit_model:
                                                            e.target.value,
                                                    })
                                                }
                                                className="h-8 text-xs mt-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                placeholder="Contoh: AC AH-A5SAY"
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                Nomor Seri (Serial Number)
                                            </Label>
                                            <Input
                                                value={parsedData.serial_number}
                                                onChange={(e) =>
                                                    setParsedData({
                                                        ...parsedData,
                                                        serial_number:
                                                            e.target.value,
                                                    })
                                                }
                                                className="h-8 text-xs font-mono mt-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                                placeholder="SN perangkat"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                Status Biaya
                                            </Label>
                                            <select
                                                value={parsedData.status}
                                                onChange={(e) =>
                                                    setParsedData({
                                                        ...parsedData,
                                                        status: e.target
                                                            .value as
                                                            | "berbayar"
                                                            | "tidak_berbayar",
                                                    })
                                                }
                                                className="mt-1 flex h-8 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-2.5 py-1 text-xs shadow-xs focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer font-medium"
                                            >
                                                <option
                                                    value="berbayar"
                                                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                                >
                                                    Berbayar
                                                </option>
                                                <option
                                                    value="tidak_berbayar"
                                                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                                >
                                                    Tidak Berbayar (Garansi)
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                Jam Pengerjaan
                                            </Label>
                                            <Input
                                                type="time"
                                                value={parsedData.start_time}
                                                onChange={(e) =>
                                                    setParsedData({
                                                        ...parsedData,
                                                        start_time:
                                                            e.target.value,
                                                    })
                                                }
                                                className="h-8 text-xs mt-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                            Catatan Lapangan & Detail Kerusakan
                                        </Label>
                                        <Textarea
                                            value={parsedData.notes}
                                            onChange={(e) =>
                                                setParsedData({
                                                    ...parsedData,
                                                    notes: e.target.value,
                                                })
                                            }
                                            rows={2}
                                            className="text-xs mt-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-red-500 dark:focus:border-red-500"
                                            placeholder="Catatan kerusakan atau perbaikan..."
                                        />
                                    </div>

                                    {/* Toggle Raw OCR / AI text accordion */}
                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowRawText(!showRawText)
                                            }
                                            className="text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-medium"
                                        >
                                            {showRawText ? (
                                                <ChevronUp className="size-3" />
                                            ) : (
                                                <ChevronDown className="size-3" />
                                            )}
                                            {showRawText
                                                ? "Sembunyikan Teks Mentah / Respon Ekstraksi"
                                                : "Lihat Teks Mentah / Respon Ekstraksi"}
                                        </button>
                                        {showRawText && (
                                            <pre className="mt-1.5 p-2.5 bg-slate-100 dark:bg-slate-950 rounded-lg text-[10px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-800">
                                                {parsedData.raw_text}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="rounded-xl cursor-pointer border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </Button>

                                <Button
                                    type="button"
                                    onClick={handleApplyData}
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl gap-2 px-5 py-2 font-bold shadow-lg shadow-red-600/20 cursor-pointer active:scale-95"
                                >
                                    Terapkan ke Formulir
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
