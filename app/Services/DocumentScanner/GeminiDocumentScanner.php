<?php

namespace App\Services\DocumentScanner;

use App\Services\DocumentScanner\Contracts\DocumentScannerInterface;
use App\Services\DocumentScanner\DTOs\ParsedDocumentData;
use App\Services\DocumentScanner\Exceptions\DocumentScannerException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GeminiDocumentScanner implements DocumentScannerInterface
{
    protected ?string $apiKey;
    protected string $model;
    protected int $timeout;

    public function __construct(
        ?string $apiKey = null,
        ?string $model = null,
        ?int $timeout = null
    ) {
        $this->apiKey = $apiKey ?? config('services.gemini.api_key');
        $this->model = $model ?? config('services.gemini.model', 'gemini-2.5-flash');
        $this->timeout = $timeout ?? (int) config('services.gemini.timeout', 30);
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
        $schema = $this->buildResponseSchema();

        $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

        try {
            $response = Http::timeout($this->timeout)
                ->retry(2, 500, throw: false)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                ])
                ->post($endpoint, [
                    'contents' => [
                        [
                            'parts' => [
                                [
                                    'text' => $prompt,
                                ],
                                [
                                    'inline_data' => [
                                        'mime_type' => $mimeType,
                                        'data' => $base64Image,
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1,
                        'response_mime_type' => 'application/json',
                        'response_schema' => $schema,
                    ],
                ]);

            if ($response->status() === 429) {
                Log::warning('Gemini API quota exceeded during document scan', [
                    'response' => $response->json(),
                ]);
                throw DocumentScannerException::quotaExceeded();
            }

            if ($response->failed()) {
                Log::error('Gemini API returned error response', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                $errorMsg = $response->json('error.message') ?? 'Terjadi kesalahan saat memproses gambar dengan Gemini API.';
                throw DocumentScannerException::apiError($errorMsg, $response->status());
            }

            $jsonBody = $response->json();
            $rawContent = $jsonBody['candidates'][0]['content']['parts'][0]['text'] ?? '{}';
            $parsedArray = json_decode($rawContent, true);

            if (!is_array($parsedArray)) {
                Log::error('Gemini API returned non-JSON text despite response_mime_type', [
                    'raw' => $rawContent,
                ]);
                throw DocumentScannerException::apiError('Format respons AI tidak valid.');
            }

            $parsedArray['raw_text'] = $rawContent;

            return ParsedDocumentData::fromArray($parsedArray, provider: 'gemini');

        } catch (DocumentScannerException $e) {
            throw $e;
        } catch (Throwable $e) {
            Log::error('Unexpected exception during Gemini document scan', [
                'error' => $e->getMessage(),
            ]);
            throw DocumentScannerException::apiError('Gagal menghubungkan ke layanan Gemini AI: ' . $e->getMessage(), 500, $e instanceof \Exception ? $e : null);
        }
    }

    /**
     * Formulates system instructions for Indonesian electronic repair documents.
     */
    protected function buildSystemPrompt(): string
    {
        return <<<PROMPT
Anda adalah asisten AI profesional untuk sistem Work Order teknisi servis elektronik (Aquos Platinum / Sharp Service Center Indonesia).
Tugas Anda: Analisis foto dokumen atau struk laporan reparasi (work order / nota servis) yang diberikan, lalu ekstrak data ke format JSON sesuai skema.

Panduan Ekstraksi Data:
1. notif_number: Nomor notifikasi unik / Nomor WO / No Laporan (contoh: 2026117562, NTF-2026-1234, atau format digit unik pada header struk).
2. customer_name: Nama lengkap konsumen / pelanggan (bersihkan dari gelar seperti "BP", "IBU", kode konsumen, atau kata "Nama:").
3. customer_phone: Nomor HP / WhatsApp konsumen (format angka, contoh: 08123456789).
4. customer_address: Alamat lengkap pengerjaan servis (jalan, blok, nomor rumah, kelurahan, kecamatan, kota).
5. unit_model: Tipe atau model unit yang diservis (contoh: AH-A5SAY, 4T-C50EJ2X, SJ-X165MG, dll).
6. serial_number: Nomor seri unit (SN / No. Seri).
7. service_date: Tanggal kunjungan atau tanggal penerimaan dokumen (format YYYY-MM-DD).
8. deadline: Tanggal batas pengerjaan (format YYYY-MM-DD, jika tidak ada samakan dengan service_date).
9. status: Apakah servis ini 'berbayar' atau 'tidak_berbayar' (jika ada indikasi klaim garansi, garansi resmi, free biaya, gunakan 'tidak_berbayar'; jika ada biaya perbaikan, jasa, atau suku cadang, gunakan 'berbayar').
10. status_note: Keterangan tambahan mengenai status pembayaran atau garansi jika ada.
11. work_status: 'selesai' jika dokumen menunjukkan pengerjaan beres, atau 'belum_selesai'.
12. work_types: Daftar jenis pengerjaan (contoh: ["Perbaikan", "Ganti Kompresor", "Install Standart", "Bongkar Pasang", "Cuci AC"]).
13. start_time: Jam mulai pengerjaan jika tertera (format HH:MM, contoh: 09:30).
14. finish_time: Jam selesai pengerjaan jika tertera (format HH:MM, contoh: 11:00).
15. notes: Catatan keluhan, gejala kerusakan, atau tindakan teknisi yang tertulis pada dokumen.

Kembalikan nilai kosong (string kosong "" atau array kosong []) untuk bidang yang tidak ditemukan pada dokumen.
PROMPT;
    }

    /**
     * Response JSON Schema for Gemini structured output.
     */
    protected function buildResponseSchema(): array
    {
        return [
            'type' => 'OBJECT',
            'properties' => [
                'notif_number' => ['type' => 'STRING'],
                'customer_name' => ['type' => 'STRING'],
                'customer_phone' => ['type' => 'STRING'],
                'customer_address' => ['type' => 'STRING'],
                'unit_model' => ['type' => 'STRING'],
                'serial_number' => ['type' => 'STRING'],
                'service_date' => ['type' => 'STRING'],
                'deadline' => ['type' => 'STRING'],
                'status' => [
                    'type' => 'STRING',
                    'enum' => ['berbayar', 'tidak_berbayar'],
                ],
                'status_note' => ['type' => 'STRING'],
                'work_status' => [
                    'type' => 'STRING',
                    'enum' => ['belum_selesai', 'selesai'],
                ],
                'work_types' => [
                    'type' => 'ARRAY',
                    'items' => ['type' => 'STRING'],
                ],
                'start_time' => ['type' => 'STRING'],
                'finish_time' => ['type' => 'STRING'],
                'notes' => ['type' => 'STRING'],
            ],
            'required' => [
                'notif_number',
                'customer_name',
                'status',
            ],
        ];
    }
}
