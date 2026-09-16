import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, SwitchCamera, Check, RotateCcw, X, AlertCircle } from 'lucide-react';

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
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fileInputFallbackRef = useRef<HTMLInputElement | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // Stop all media stream tracks
    const stopStream = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    // Start video stream
    const startCamera = async () => {
        stopStream();
        setCameraError(null);
        setCapturedPhotoUrl(null);
        setCapturedBlob(null);

        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Fitur kamera browser tidak didukung pada peramban ini.');
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: facingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            });

            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.play().catch(() => {});
            }
        } catch (err: any) {
            console.warn('Gagal membuka kamera langsung:', err);
            setCameraError(
                err.name === 'NotAllowedError'
                    ? 'Izin kamera ditolak. Silakan izinkan akses kamera di peramban Anda atau gunakan opsi tombol "Kamera Bawaan HP" di bawah.'
                    : 'Tidak dapat mengakses kamera secara langsung. Silakan gunakan tombol "Buka Kamera HP" di bawah.'
            );
        }
    };

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopStream();
            setCapturedPhotoUrl(null);
            setCapturedBlob(null);
            setCameraError(null);
        }

        return () => {
            stopStream();
        };
    }, [isOpen, facingMode]);

    // Flip camera (Front / Back)
    const toggleCamera = () => {
        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    };

    // Capture photo snapshot from video to canvas
    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // If front camera, flip horizontally for mirror effect
        if (facingMode === 'user') {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const previewUrl = URL.createObjectURL(blob);
                    setCapturedBlob(blob);
                    setCapturedPhotoUrl(previewUrl);
                    stopStream();
                }
            },
            'image/jpeg',
            0.88
        );
    };

    // Retake photo
    const retakePhoto = () => {
        setCapturedPhotoUrl(null);
        setCapturedBlob(null);
        startCamera();
    };

    // Save and use captured photo
    const savePhoto = () => {
        if (!capturedBlob || !capturedPhotoUrl) return;

        const filename = `foto_${Date.now()}.jpg`;
        const file = new File([capturedBlob], filename, { type: 'image/jpeg' });
        onCapture(file, capturedPhotoUrl);
        stopStream();
        onClose();
    };

    // Fallback file input change (direct native mobile camera)
    const handleFallbackCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            onCapture(file, previewUrl);
            stopStream();
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg p-5 sm:rounded-2xl bg-slate-950 text-white border-slate-800">
                <DialogHeader className="border-b border-slate-800 pb-2.5">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
                            <Camera className="size-4 text-red-400" />
                            {title}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-black flex items-center justify-center border border-slate-800">
                    {/* Live Video Preview */}
                    {!capturedPhotoUrl && !cameraError && (
                        <video
                            ref={videoRef}
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
                            className="h-full w-full object-contain"
                        />
                    )}

                    {/* Camera Error / Fallback Message */}
                    {cameraError && !capturedPhotoUrl && (
                        <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                            <AlertCircle className="size-10 text-amber-400" />
                            <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                            <Button
                                type="button"
                                onClick={() => fileInputFallbackRef.current?.click()}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg px-4 py-2"
                            >
                                <Camera className="size-4 mr-1.5" />
                                Buka Kamera Bawaan HP
                            </Button>
                        </div>
                    )}

                    {/* Hidden canvas for snapshot rendering */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Hidden input for direct camera fallback */}
                    <input
                        ref={fileInputFallbackRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFallbackCapture}
                        className="hidden"
                    />

                    {/* Switch Camera Button overlay (when stream active) */}
                    {!capturedPhotoUrl && !cameraError && (
                        <button
                            type="button"
                            onClick={toggleCamera}
                            title="Ganti Kamera Depan/Belakang"
                            className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                        >
                            <SwitchCamera className="size-4" />
                        </button>
                    )}
                </div>

                {/* Footer Controls */}
                <DialogFooter className="border-t border-slate-800 pt-3 flex flex-row items-center justify-between gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-400 hover:text-white hover:bg-slate-900 text-xs"
                    >
                        Batal
                    </Button>

                    {!capturedPhotoUrl ? (
                        <div className="flex items-center gap-2">
                            {/* Fallback Native Camera Trigger button */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputFallbackRef.current?.click()}
                                className="text-xs border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                                Kamera Bawaan
                            </Button>

                            {/* Shutter Button */}
                            <Button
                                type="button"
                                onClick={takePhoto}
                                disabled={Boolean(cameraError)}
                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 flex items-center gap-1.5"
                            >
                                <Camera className="size-4" />
                                Jepret Foto
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={retakePhoto}
                                className="text-xs border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-1"
                            >
                                <RotateCcw className="size-3.5" />
                                Ulangi
                            </Button>

                            <Button
                                type="button"
                                onClick={savePhoto}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 flex items-center gap-1.5"
                            >
                                <Check className="size-4" />
                                Gunakan Foto Ini
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
