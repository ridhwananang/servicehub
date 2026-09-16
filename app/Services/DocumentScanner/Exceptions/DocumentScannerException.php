<?php

namespace App\Services\DocumentScanner\Exceptions;

use Exception;

class DocumentScannerException extends Exception
{
    public function __construct(
        string $message = 'Gagal memindai dokumen.',
        int $code = 0,
        ?Exception $previous = null,
        public readonly bool $isQuotaError = false,
        public readonly bool $isKeyMissing = false,
    ) {
        parent::__construct($message, $code, $previous);
    }

    public static function keyMissing(): self
    {
        return new self(
            message: 'Kunci API Gemini belum dikonfigurasi pada sistem (GEMINI_API_KEY).',
            code: 400,
            isKeyMissing: true
        );
    }

    public static function quotaExceeded(?string $details = null): self
    {
        return new self(
            message: 'Batas pemanggilan Gemini API (kuota) telah tercapai. ' . ($details ?: 'Silakan coba beberapa saat lagi atau gunakan mode OCR lokal.'),
            code: 429,
            isQuotaError: true
        );
    }

    public static function apiError(string $message, int $code = 500, ?Exception $previous = null): self
    {
        return new self($message, $code, $previous);
    }
}
