import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, SwitchCamera, Check, RotateCcw, X, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { captureVisibleVideoFrame } from '@/lib/camera-capture';

interface CameraCaptureDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File, previewUrl: string) => void;
    title?: string;
}

export function CameraCaptureDialog({
    isOpen,
    onClose,
    onCapture,
    title = 'Ambil Foto Langsung',
}: CameraCaptureDialogProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const fileInputFallbackRef = useRef<HTMLInputElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const capturedUrlRef = useRef<string | null>(null);

    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

    // Stop all media stream tracks
    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const clearCapturedPreview = useCallback((revoke = true) => {
        if (revoke && capturedUrlRef.current) {
            URL.revokeObjectURL(capturedUrlRef.current);
        }
        capturedUrlRef.current = null;
        setCapturedPhotoUrl(null);
        setCapturedBlob(null);
    }, []);

    const attachVideoRef = useCallback((node: HTMLVideoElement | null) => {
        videoRef.current = node;
        if (node && streamRef.current && node.srcObject !== streamRef.current) {
            node.srcObject = streamRef.current;
            node.play().catch(() => {});
        }
    }, []);

    // Start video stream
    const startCamera = useCallback(
        async (isCancelled?: () => boolean) => {
            stopStream();
            setCameraError(null);
            clearCapturedPreview();

            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error('Fitur kamera browser tidak didukung pada peramban ini.');
                }

                const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { ideal: facingMode },
                        width: { ideal: isPortrait ? 1080 : 1920 },
                        height: { ideal: isPortrait ? 1920 : 1080 },
                    },
                    audio: false,
                });

                if (isCancelled?.()) {
                    mediaStream.getTracks().forEach((track) => track.stop());
                    return;
                }

                streamRef.current = mediaStream;

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    videoRef.current.play().catch(() => {});
                }
            } catch (err: any) {
                if (isCancelled?.()) return;
                console.warn('Gagal membuka kamera langsung:', err);
                setCameraError(
                    err.name === 'NotAllowedError'
                        ? 'Izin kamera ditolak. Silakan izinkan akses kamera di peramban Anda atau gunakan opsi tombol "Kamera Bawaan HP" di bawah.'
                        : 'Tidak dapat mengakses kamera secara langsung. Silakan gunakan tombol "Buka Kamera Bawaan HP" di bawah.'
                );
            }
        },
        [facingMode, stopStream, clearCapturedPreview]
    );

    useEffect(() => {
        let cancelled = false;

        if (isOpen) {
            startCamera(() => cancelled);
        } else {
            stopStream();
            clearCapturedPreview();
            setCameraError(null);
        }

        return () => {
            cancelled = true;
            stopStream();
        };
    }, [isOpen, startCamera, stopStream, clearCapturedPreview]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsNativeFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const exitFullscreenIfActive = useCallback(async () => {
        if (typeof document !== 'undefined' && document.fullscreenElement) {
            try {
                await document.exitFullscreen();
            } catch {
                // Ignore fullscreen exit errors
            }
        }
    }, []);

    const handleClose = useCallback(async () => {
        stopStream();
        clearCapturedPreview();
        await exitFullscreenIfActive();
        onClose();
    }, [stopStream, clearCapturedPreview, exitFullscreenIfActive, onClose]);

    const toggleNativeFullscreen = async () => {
        if (!containerRef.current || typeof document === 'undefined') return;
        try {
            if (!document.fullscreenElement) {
                await containerRef.current.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch {
            // Browser/device may block programmatic fullscreen; CSS 100dvh still fills viewport
        }
    };

    // Flip camera (Front / Back)
    const toggleCamera = () => {
        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    };

    // Capture photo snapshot matching the exact visible viewport
    const takePhoto = async () => {
        if (!videoRef.current) return;

        const blob = await captureVisibleVideoFrame(videoRef.current, {
            mirror: facingMode === 'user',
            quality: 0.9,
        });

        if (blob) {
            const previewUrl = URL.createObjectURL(blob);
            capturedUrlRef.current = previewUrl;
            setCapturedBlob(blob);
            setCapturedPhotoUrl(previewUrl);
            stopStream();
        }
    };

    // Retake photo
    const retakePhoto = () => {
        startCamera();
    };

    // Save and use captured photo
    const savePhoto = async () => {
        if (!capturedBlob || !capturedPhotoUrl) return;

        const filename = `foto_${Date.now()}.jpg`;
        const file = new File([capturedBlob], filename, { type: 'image/jpeg' });
        const finalPreviewUrl = capturedPhotoUrl;
        clearCapturedPreview(false);
        stopStream();
        await exitFullscreenIfActive();
        onCapture(file, finalPreviewUrl);
        onClose();
    };

    // Fallback file input change (direct native mobile camera)
    const handleFallbackCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            stopStream();
            await exitFullscreenIfActive();
            onCapture(file, previewUrl);
            onClose();
        }
    };

    const canToggleNativeFullscreen =
        typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent
                ref={containerRef}
                className="fixed inset-0 top-0 left-0 translate-x-0 translate-y-0 z-50 flex flex-col w-screen h-dvh max-w-none sm:max-w-none max-h-dvh rounded-none border-0 p-0 gap-0 bg-black text-white shadow-none overflow-hidden [&>button]:hidden"
            >
                <DialogDescription className="sr-only">
                    Tampilan kamera layar penuh untuk mengambil foto dokumentasi servis.
                </DialogDescription>

                {/* Full-Screen Camera Viewport */}
                <div className="relative flex-1 w-full h-full overflow-hidden bg-black flex items-center justify-center">
                    {/* Live Video Preview */}
                    {!capturedPhotoUrl && !cameraError && (
                        <video
                            ref={attachVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`h-full w-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
                        />
                    )}

                    {/* Captured Photo Preview */}
                    {capturedPhotoUrl && (
                        <img
                            src={capturedPhotoUrl}
                            alt="Hasil Foto"
                            className="h-full w-full object-contain bg-black"
                        />
                    )}

                    {/* Camera Error / Fallback Message */}
                    {cameraError && !capturedPhotoUrl && (
                        <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
                            <div className="size-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                                <AlertCircle className="size-8 text-amber-400" />
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed">{cameraError}</p>
                            <Button
                                type="button"
                                onClick={() => fileInputFallbackRef.current?.click()}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold rounded-xl px-5 h-11 cursor-pointer"
                            >
                                <Camera className="size-4 mr-2" />
                                Buka Kamera Bawaan HP
                            </Button>
                        </div>
                    )}

                    {/* Hidden input for direct camera fallback */}
                    <input
                        ref={fileInputFallbackRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFallbackCapture}
                        className="hidden"
                    />

                    {/* Floating Top Bar */}
                    <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                        <div className="flex items-center gap-3 min-w-0">
                            <button
                                type="button"
                                onClick={handleClose}
                                title="Tutup Kamera"
                                aria-label="Tutup Kamera"
                                className="size-10 rounded-full bg-black/55 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer shrink-0"
                            >
                                <X className="size-5" />
                            </button>
                            <DialogTitle className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate drop-shadow-xs">
                                <Camera className="size-4 text-red-400 shrink-0" />
                                <span className="truncate">{title}</span>
                            </DialogTitle>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            {canToggleNativeFullscreen && (
                                <button
                                    type="button"
                                    onClick={toggleNativeFullscreen}
                                    title={isNativeFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                                    aria-label={isNativeFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}
                                    className="size-10 rounded-full bg-black/55 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                                >
                                    {isNativeFullscreen ? (
                                        <Minimize2 className="size-4" />
                                    ) : (
                                        <Maximize2 className="size-4" />
                                    )}
                                </button>
                            )}

                            {!capturedPhotoUrl && !cameraError && (
                                <button
                                    type="button"
                                    onClick={toggleCamera}
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
                    <div className="absolute bottom-0 inset-x-0 z-20 px-4 sm:px-8 pt-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/85 via-black/50 to-transparent">
                        {!capturedPhotoUrl ? (
                            <div className="mx-auto max-w-xl flex items-center justify-between gap-3">
                                {/* Fallback Native Camera Trigger button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputFallbackRef.current?.click()}
                                    className="text-xs rounded-full h-10 px-3.5 sm:px-4 border-white/25 bg-black/55 text-white hover:bg-white/15 hover:text-white backdrop-blur-md cursor-pointer"
                                >
                                    Kamera Bawaan
                                </Button>

                                {/* Native-style Circular Shutter Button */}
                                <button
                                    type="button"
                                    onClick={takePhoto}
                                    disabled={Boolean(cameraError)}
                                    title="Jepret Foto"
                                    aria-label="Jepret Foto"
                                    className="group relative size-18 sm:size-20 rounded-full border-4 border-white bg-white/15 p-1.5 flex items-center justify-center shadow-2xl transition-transform active:scale-90 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                                >
                                    <span className="size-full rounded-full bg-white group-hover:bg-red-500 transition-colors flex items-center justify-center">
                                        <Camera className="size-6 text-slate-900 group-hover:text-white transition-colors" />
                                    </span>
                                </button>

                                {/* Cancel / Close Button */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleClose}
                                    className="text-xs rounded-full h-10 px-4 bg-black/55 border border-white/20 text-white hover:bg-white/15 hover:text-white backdrop-blur-md cursor-pointer"
                                >
                                    Batal
                                </Button>
                            </div>
                        ) : (
                            <div className="mx-auto max-w-md flex items-center justify-center gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={retakePhoto}
                                    className="flex-1 h-11 rounded-full text-xs sm:text-sm font-semibold border-white/25 bg-black/60 text-white hover:bg-white/15 hover:text-white backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <RotateCcw className="size-4" />
                                    Ulangi
                                </Button>

                                <Button
                                    type="button"
                                    onClick={savePhoto}
                                    className="flex-1 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-5 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                                >
                                    <Check className="size-4" />
                                    Gunakan Foto Ini
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
