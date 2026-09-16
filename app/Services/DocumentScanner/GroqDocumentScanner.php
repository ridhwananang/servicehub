<?php

namespace App\Services\DocumentScanner;

use App\Services\DocumentScanner\Contracts\DocumentScannerInterface;
use App\Services\DocumentScanner\DTOs\ParsedDocumentData;
use App\Services\DocumentScanner\Exceptions\DocumentScannerException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GroqDocumentScanner implements DocumentScannerInterface
{
    protected ?string $apiKey;
    protected string $model;
    protected int $timeout;

    public function __construct(
        ?string $apiKey = null,
        ?string $model = null,
        ?int $timeout = null
    ) {
        $this->apiKey = $apiKey ?? config('services.groq.api_key');
        $this->model = $model ?? config('services.groq.model', 'qwen/qwen3.8-27b');
        $this->timeout = $timeout ?? (int) config('services.groq.timeout', 30);
    }

    /**
     * {@inheritDoc}
     */
    public function scan(UploadedFile $file): ParsedDocumentData
    {
        if (empty($this->apiKey)) {
            throw DocumentScannerException::keyMissing();
        }

        $base64Image = base64_encode($file->get());
        $mimeType = $file->getMimeType() ?: 'image/jpeg';
        $prompt = $this->buildSystemPrompt();

        $endpoint = 'https://api.groq.com/openai/v1/chat/completions';

        try {
            $response = Http::timeout($this->timeout)
                ->retry(2, 500, throw: false)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post($endpoint, [
                    'model' => $this->model,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => [
                                [
                                    'type' => 'text',
                                    'text' => $prompt,
                                ],
                                [
                                    'type' => 'image_url',
                                    'image_url' => [
                                        'url' => "data:{$mimeType};base64,{$base64Image}",
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'response_format' => [
                        'type' => 'json_object',
                    ],
                    'temperature' => 0.1,
                ]);

            if ($response->status() === 429) {
                Log::warning('Groq API quota exceeded during document scan', [
                    'response' => $response->json(),
                ]);
                throw DocumentScannerException::quotaExceeded();
            }

            if ($response->failed()) {
                Log::error('Groq API returned error response', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                $errorMsg = $response->json('error.message') ?? 'Terjadi kesalahan saat memproses gambar dengan Groq API.';
                throw DocumentScannerException::apiError($errorMsg, $response->status());
            }

            $jsonBody = $response->json();
            $rawContent = $jsonBody['choices'][0]['message']['content'] ?? '{}';
            $parsedArray = json_decode($rawContent, true);

            if (!is_array($parsedArray)) {
                Log::error('Groq API returned non-JSON text despite json_object response format', [
                    'raw' => $rawContent,
                ]);
                throw DocumentScannerException::apiError('Format respons AI tidak valid.');
            }

            $parsedArray['raw_text'] = $rawContent;

            return ParsedDocumentData::fromArray($parsedArray, provider: 'groq');

        } catch (DocumentScannerException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Unexpected exception during Groq document scan', [
                'error' => $e->getMessage(),
            ]);
            throw DocumentScannerException::apiError('Gagal menghubungkan ke layanan Groq AI: ' . $e->getMessage(), 500, $e instanceof \Exception ? $e : null);
        }
    }

    /**
     * Formulates system instructions for Indonesian electronic repair documents.
     */
    protected function buildSystemPrompt(): string
    {
        return <<<PROMPT
Anda adalah asisten AI profesional untuk sistem Work Order teknisi servis elektronik (Aquos Platinum / Sharp Service Center Indonesia).
Tugas Anda: Analisis foto dokumen atau struk laporan reparasi (work order / nota servis) yang diberikan, lalu ekstrak data ke format JSON.

Anda WAJIB mengembalikan sebuah objek JSON valid dengan struktur kunci berikut:
{
  "notif_number": "Nomor notifikasi unik / Nomor WO / No Laporan (contoh: 2026117562, NTF-2026-1234, atau digit unik pada header)",
  "customer_name": "Nama lengkap konsumen / pelanggan (bersihkan dari gelar 'BP', 'IBU', dll)",
  "customer_phone": "Nomor HP / WhatsApp konsumen (format angka)",
  "customer_address": "Alamat lengkap pengerjaan servis (jalan, blok, kelurahan, kecamatan, kota)",
  "unit_model": "Tipe atau model unit yang diservis (contoh: AH-A5SAY, 4T-C50EJ2X, SJ-X165MG)",
  "serial_number": "Nomor seri unit (SN / No. Seri)",
  "service_date": "Tanggal kunjungan atau tanggal penerimaan dokumen format YYYY-MM-DD",
  "deadline": "Tanggal batas pengerjaan format YYYY-MM-DD (jika tidak ada samakan dengan service_date)",
  "status": "'berbayar' atau 'tidak_berbayar' (jika garansi, free klaim, gunakan 'tidak_berbayar'; jika ada biaya, gunakan 'berbayar')",
  "status_note": "Keterangan tambahan mengenai status garansi atau pembayaran",
  "work_status": "'selesai' jika dokumen menunjukkan perbaikan selesai, atau 'belum_selesai'",
  "work_types": ["Daftar jenis pekerjaan, contoh: Perbaikan, Cuci AC, Ganti Part"],
  "start_time": "Jam mulai pengerjaan jika tertera format HH:MM (contoh: 09:30)",
  "finish_time": "Jam selesai pengerjaan jika tertera format HH:MM (contoh: 11:00)",
  "notes": "Catatan keluhan, gejala kerusakan, atau tindakan teknisi yang tertulis pada dokumen"
}

Jika ada nilai yang tidak ditemukan pada dokumen, kembalikan string kosong "" atau array kosong []. Jangan sertakan teks markdown atau penjelasan di luar JSON.
PROMPT;
    }
}
