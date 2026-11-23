import React, { useState, useRef, useEffect, useCallback } from "react";
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
    X,
    Maximize2,
    Minimize2,
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

    // Camera stream states
    const cameraContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const [cameraFacing, setCameraFacing] = useState<"environment" | "user">(
        "environment",
    );
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopCamera = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const attachVideoRef = useCallback((node: HTMLVideoElement | null) => {
        videoRef.current = node;
        if (
            node &&
            mediaStreamRef.current &&
            node.srcObject !== mediaStreamRef.current
        ) {
            node.srcObject = mediaStreamRef.current;
            node.play().catch(() => {});
        }
    }, []);

    const exitFullscreenIfActive = useCallback(async () => {
        if (typeof document !== "undefined" && document.fullscreenElement) {
            try {
                await document.exitFullscreen();
            } catch {
                // Ignore fullscreen exit errors
            }
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsNativeFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
        };
    }, []);

    // Reset states when closed
    useEffect(() => {
        if (!isOpen) {
            stopCamera();
            exitFullscreenIfActive();
            setStep("select");
            setImageFile(null);
            setImagePreview(null);
            setOcrProgress(0);
            setOcrStatusText("");
            setParsedData(null);
            setCameraError(null);
        }

        return () => {
            stopCamera();
        };
    }, [isOpen, stopCamera, exitFullscreenIfActive]);

    // Start camera stream
    const startCamera = async (
        facing: "environment" | "user" = "environment",
    ) => {
        stopCamera();
        setCameraError(null);
        setStep("camera");
        try {
            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error(
                    "Fitur kamera browser tidak didukung pada peramban ini.",
                );
            }

            const isPortrait =
                typeof window !== "undefined" &&
                window.innerHeight > window.innerWidth;
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: facing },
                    width: { ideal: isPortrait ? 1080 : 1920 },
                    height: { ideal: isPortrait ? 1920 : 1080 },
                },
                audio: false,
            });

            mediaStreamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {});
            }
        } catch (err: any) {
            console.error("Camera access error:", err);
            setCameraError(
                "Tidak dapat mengakses kamera. Pastikan izin kamera aktif atau gunakan tombol Pilih Galeri / File.",
            );
        }
    };

    const toggleNativeFullscreen = async () => {
        if (!cameraContainerRef.current || typeof document === "undefined")
            return;
        try {
            if (!document.fullscreenElement) {
                await cameraContainerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch {
            // CSS 100dvh fills device viewport when native fullscreen is blocked
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
            if (cameraFacing === "user") {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
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
                        await exitFullscreenIfActive();
                        processDocumentImage(file);
                    }
                },
                "image/jpeg",
                0.95,
            );
        }
    };

    const handleFileSelected = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            stopCamera();
            await exitFullscreenIfActive();
            processDocumentImage(file);
        }
    };

    const handleClose = async () => {
        stopCamera();
        await exitFullscreenIfActive();
        onClose();
    };

    const processWithAi = async (
        fileToUpload: File,
    ): Promise<ParsedRepairDocument> => {
        setOcrProgress(35);
        setOcrStatusText("Menganalisis dokumen tiket...");

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
                json.message || "Gagal memproses dokumen secara otomatis.";
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
        setOcrStatusText("Mengoptimalkan kontras dokumen...");

        const ocrCanvas = await preprocessImageToCanvas(file);

        setOcrProgress(30);
        setOcrStatusText("Menyiapkan pemindaian dokumen...");

        const worker = await createWorker("eng", 1, {
            logger: (m) => {
                if (m.status === "recognizing text") {
                    const prog = Math.round(m.progress * 60) + 30;
                    setOcrProgress(prog);
                    setOcrStatusText(
                        `Mengenali teks dokumen... ${Math.round(m.progress * 100)}%`,
                    );
                } else if (m.status === "loading tesseract core") {
                    setOcrProgress(25);
                    setOcrStatusText("Memuat modul pengenalan karakter...");
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
            const isOnline =
                typeof navigator !== "undefined" ? navigator.onLine : true;

            if (isOnline) {
                try {
                    result = await processWithAi(compressed);
                    toast.success("Dokumen berhasil dianalisis!");
                } catch (aiErr: any) {
                    console.warn(
                        "Cloud scan failed, fallback to local OCR:",
                        aiErr,
                    );
                    setOcrStatusText(
                        "Beralih ke pemindaian lokal...",
                    );
                    result = await processWithTesseract(file);
                }
            } else {
                setOcrStatusText("Memproses dokumen secara offline...");
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
        handleClose();
    };

    const isCameraStep = step === "camera";
    const canToggleNativeFullscreen =
        typeof document !== "undefined" && Boolean(document.fullscreenEnabled);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                ref={cameraContainerRef}
                className={
                    isCameraStep
                        ? "fixed inset-0 top-0 left-0 translate-x-0 translate-y-0 z-50 flex flex-col w-screen h-dvh max-w-none sm:max-w-none max-h-dvh rounded-none border-0 p-0 gap-0 bg-black text-white shadow-none overflow-hidden [&>button]:hidden"
                        : "max-w-2xl sm:max-w-3xl max-h-[92vh] overflow-y-auto custom-scrollbar p-0 sm:rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl [&>button]:text-white/90 [&>button:hover]:text-white [&>button]:focus:ring-white [&>button]:z-20"
                }
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelected}
                    className="hidden"
                />

                {/* Header (Non-camera steps) */}
                {!isCameraStep && (
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
                )}

                {/* STEP 2: Full-Screen Active Camera Viewfinder */}
                {isCameraStep && (
                    <div className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center">
                        <DialogDescription className="sr-only">
                            Tampilan kamera layar penuh untuk memindai dokumen servis.
                        </DialogDescription>

                        {!cameraError ? (
                            <>
                                <video
                                    ref={attachVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`h-full w-full object-cover ${cameraFacing === "user" ? "-scale-x-100" : ""}`}
                                />

                                {/* Document alignment guide overlay */}
                                <div className="absolute top-20 bottom-28 inset-x-4 sm:inset-x-12 md:inset-x-20 border-2 border-dashed border-red-500/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3 sm:p-5">
                                    <span className="text-[11px] font-mono text-white/95 bg-black/70 px-2.5 py-1 rounded-md self-start backdrop-blur-xs border border-white/10">
                                        Posisikan Lembar Dokumen di dalam Kotak
                                    </span>
                                    <span className="text-[11px] font-mono text-white/95 bg-black/70 px-2.5 py-1 rounded-md self-end backdrop-blur-xs border border-white/10">
                                        Laporan Reparasi
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
                                <div className="size-16 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                                    <AlertCircle className="size-8 text-red-400" />
                                </div>
                                <p className="text-sm text-slate-200 leading-relaxed">
                                    {cameraError}
                                </p>
                                <div className="flex flex-wrap justify-center gap-2.5">
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-5 h-11 cursor-pointer"
                                    >
                                        <Upload className="size-4 mr-2" />
                                        Pilih File Gambar
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={async () => {
                                            stopCamera();
                                            await exitFullscreenIfActive();
                                            setStep("select");
                                        }}
                                        className="text-xs sm:text-sm rounded-xl h-11 px-4 border-white/25 bg-black/55 text-white hover:bg-white/15 hover:text-white cursor-pointer"
                                    >
                                        Kembali
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Floating Top Bar */}
                        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        stopCamera();
                                        await exitFullscreenIfActive();
                                        setStep("select");
                                    }}
                                    title="Kembali"
                                    aria-label="Kembali"
                                    className="size-10 rounded-full bg-black/55 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer shrink-0"
                                >
                                    <X className="size-5" />
                                </button>
                                <DialogTitle className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate drop-shadow-xs">
                                    <ScanLine className="size-4 text-red-400 shrink-0" />
                                    <span className="truncate">
                                        Pindai Dokumen Servis
                                    </span>
                                </DialogTitle>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {canToggleNativeFullscreen && (
                                    <button
                                        type="button"
                                        onClick={toggleNativeFullscreen}
                                        title={
                                            isNativeFullscreen
                                                ? "Keluar Layar Penuh"
                                                : "Layar Penuh"
                                        }
                                        aria-label={
                                            isNativeFullscreen
                                                ? "Keluar Layar Penuh"
                                                : "Layar Penuh"
                                        }
                                        className="size-10 rounded-full bg-black/55 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                                    >
                                        {isNativeFullscreen ? (
                                            <Minimize2 className="size-4" />
                                        ) : (
                                            <Maximize2 className="size-4" />
                                        )}
                                    </button>
                                )}

                                {!cameraError && (
                                    <button
                                        type="button"
                                        onClick={handleSwitchCamera}
                                        title="Ganti Kamera Depan/Belakang"
                                        aria-label="Ganti Kamera Depan/Belakang"
                                        className="size-10 rounded-full bg-black/55 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                                    >
                                        <SwitchCamera className="size-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Floating Bottom Controls */}
                        {!cameraError && (
                            <div className="absolute bottom-0 inset-x-0 z-20 px-4 sm:px-8 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/85 via-black/50 to-transparent">
                                <div className="mx-auto max-w-xl flex items-center justify-between gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="text-xs rounded-full h-10 px-3.5 sm:px-4 border-white/25 bg-black/55 text-white hover:bg-white/15 hover:text-white backdrop-blur-md cursor-pointer"
                                    >
                                        <Upload className="size-3.5 mr-1.5" />
                                        Galeri
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={handleCaptureFromCamera}
                                        title="Ambil & Pindai"
                                        aria-label="Ambil & Pindai"
                                        className="group relative size-18 sm:size-20 rounded-full border-4 border-white bg-white/15 p-1.5 flex items-center justify-center shadow-2xl transition-transform active:scale-90 cursor-pointer"
                                    >
                                        <span className="size-full rounded-full bg-red-600 group-hover:bg-red-500 transition-colors flex items-center justify-center">
                                            <Camera className="size-6 text-white" />
                                        </span>
                                    </button>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={async () => {
                                            stopCamera();
                                            await exitFullscreenIfActive();
                                            setStep("select");
                                        }}
                                        className="text-xs rounded-full h-10 px-4 bg-black/55 border border-white/20 text-white hover:bg-white/15 hover:text-white backdrop-blur-md cursor-pointer"
                                    >
                                        Batal
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Body Content based on Step (Non-camera steps) */}
                {!isCameraStep && (
                    <div className="p-4 sm:p-6">
                        {/* STEP 1: Select Input Method */}
                        {step === "select" && (
                            <div className="space-y-4 sm:space-y-5">
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
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 flex items-center gap-1 font-semibold">
                                        <Sparkles className="size-3" />
                                        Otomatis Terverifikasi
                                    </Badge>
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
                                        onClick={handleClose}
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
                )}
            </DialogContent>
        </Dialog>
    );
}
