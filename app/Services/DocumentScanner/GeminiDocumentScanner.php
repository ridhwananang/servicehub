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
Tugas Anda: Analisis foto dokumen atau struk laporan reparasi (work order / nota servis) yang diberikan, lalu ekstrak setiap kolom dengan SANGAT TELITI ke format JSON sesuai skema.

Aturan Penting Pemisahan Kolom:
- Dokumen Laporan Reparasi SHARP sering berbentuk 2 kolom sejajar: kolom KIRI berisi data konsumen (Nama, Alamat, No. Telp) dan kolom KANAN berisi data unit (Model, No. Seri, Tgl Pembelian, Garansi). Jangan mencampurkan teks kolom kiri dan kanan.
- JANGAN PERNAH memasukkan kode model produk (seperti 4T-C85HN7000X, 2T-C32BG1I, LC-..., AH-A5SAY, SJ-..., ES-...) ke dalam customer_name. customer_name HANYA untuk nama orang/perusahaan.
- Jika terdapat format seperti "- Ibu Hj. Meni Malik - Alamat : Jl. Raya..." atau "Nama ... Alamat : ...", pisahkan: masukkan nama orang ke customer_name, dan masukkan HANYA alamat jalan/lokasi ke customer_address (hapus kata "Alamat :" dan nama pelanggan dari customer_address).

Panduan Ekstraksi Data:
1. notif_number: Nomor notifikasi unik / Nomor WO / No Laporan (contoh: 2026117562, 202456677811, NTF-2026-1234).
2. customer_name: Nama lengkap konsumen / pelanggan (nama orang/instansi saja, bukan kode model unit, bersihkan dari label "Nama:" atau kode konsumen).
3. customer_phone: Nomor HP / WhatsApp konsumen (format digit angka bersih, contoh: 081234567890).
4. customer_address: Alamat lengkap pengerjaan servis saja (jalan, nomor, blok, RT/RW, kelurahan, kecamatan, kota) tanpa nama pelanggan dan tanpa kata "Alamat:".
5. unit_model: Tipe atau model unit yang diservis (contoh: 4T-C85HN7000X, AH-A5SAY, 4T-C50EJ2X, SJ-X165MG).
6. serial_number: Nomor seri unit (SN / No. Seri).
7. service_date: Tanggal kunjungan atau tanggal penerimaan dokumen format YYYY-MM-DD (konversi dari DD.MM.YYYY atau DD/MM/YYYY; jika tidak ada kosongkan "").
8. deadline: Tanggal batas pengerjaan format YYYY-MM-DD (jika tidak ada samakan dengan service_date; jika tidak ada keduanya kosongkan "").
9. status: Apakah servis ini 'berbayar' atau 'tidak_berbayar' (jika garansi, masih garansi, free klaim, gunakan 'tidak_berbayar'; jika ada biaya atau habis garansi, gunakan 'berbayar').
10. status_note: Keterangan singkat mengenai status pembayaran atau garansi jika ada (misal: 'Garansi', 'Habis Garansi').
11. work_status: 'selesai' jika dokumen menunjukkan pengerjaan beres, atau 'belum_selesai'.
12. work_types: Pilih dari daftar berikut jika cocok: ['Install Standart', 'Install Bracket', 'Penjelasan', 'Service Minor', 'Service Mayor', 'Penambahan', 'Lain-lain'].
13. start_time: Jam mulai pengerjaan jika tertera (format HH:MM 24 jam, contoh: 09:30; kosongkan "" jika tidak ada).
14. finish_time: Jam selesai pengerjaan jika tertera (format HH:MM 24 jam, contoh: 11:00; kosongkan "" jika tidak ada).
15. notes: Catatan keluhan, gejala kerusakan, atau tindakan teknisi yang tertulis pada dokumen.

Kembalikan nilai kosong (string kosong "" atau array kosong []) untuk bidang yang tidak ditemukan pada dokumen. Jangan mengarang data.
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
