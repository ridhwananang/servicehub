<?php

namespace App\Http\Controllers;

use App\Services\DocumentScanner\Contracts\DocumentScannerInterface;
use App\Services\DocumentScanner\Exceptions\DocumentScannerException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ScanDocumentController extends Controller
{
    public function __construct(
        protected DocumentScannerInterface $scanner
    ) {}

    /**
     * Handle document scanning and extraction via Gemini AI.
     */
    public function scan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'document' => [
                'required',
                'file',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:10240', // 10MB max
            ],
        ], [
            'document.required' => 'Foto atau file dokumen fisik wajib diunggah.',
            'document.image' => 'File yang diunggah harus berupa gambar.',
            'document.mimes' => 'Format gambar yang didukung adalah JPEG, JPG, PNG, atau WEBP.',
            'document.max' => 'Ukuran file gambar maksimal 10MB.',
        ]);

        try {
            $parsedData = $this->scanner->scan($validated['document']);

            return response()->json([
                'success' => true,
                'data' => $parsedData->toArray(),
                'provider' => $parsedData->provider,
                'message' => 'Dokumen berhasil dipindai dan dianalisis oleh Gemini AI.',
            ]);

        } catch (DocumentScannerException $e) {
            $status = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'code' => $e->isKeyMissing ? 'KEY_MISSING' : ($e->isQuotaError ? 'QUOTA_EXCEEDED' : 'API_ERROR'),
                'fallback_available' => true,
            ], $status);

        } catch (\Throwable $e) {
            Log::error('ScanDocumentController unexpected error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem saat memproses pemindaian: ' . $e->getMessage(),
                'code' => 'INTERNAL_ERROR',
                'fallback_available' => true,
            ], 500);
        }
    }
}
