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
            $rawContent = (string) ($jsonBody['choices'][0]['message']['content'] ?? '{}');
            $cleanJson = $this->extractJsonString($rawContent);
            $parsedArray = json_decode($cleanJson, true);

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
     * Strip reasoning tags or markdown fences before JSON decoding.
     */
    protected function extractJsonString(string $content): string
    {
        $cleaned = preg_replace('/<think>[\s\S]*?<\/think>/i', '', $content) ?? $content;
        $cleaned = trim($cleaned);
        $cleaned = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $cleaned) ?? $cleaned;
        $cleaned = trim($cleaned);

        if (json_decode($cleaned, true) === null && preg_match('/\{[\s\S]*\}/', $cleaned, $matches)) {
            return $matches[0];
        }

        return $cleaned;
    }

    /**
     * Formulates system instructions for Indonesian electronic repair documents.
     */
    protected function buildSystemPrompt(): string
    {
        return <<<PROMPT
Anda adalah asisten AI profesional untuk sistem Work Order teknisi servis elektronik (Aquos Platinum / Sharp Service Center Indonesia).
Tugas Anda: Analisis foto dokumen atau struk laporan reparasi (work order / nota servis) yang diberikan, lalu ekstrak setiap kolom dengan SANGAT TELITI ke format JSON.

Aturan Penting Pemisahan Kolom:
- Dokumen Laporan Reparasi SHARP sering berbentuk 2 kolom sejajar: kolom KIRI berisi data konsumen (Nama, Alamat, No. Telp) dan kolom KANAN berisi data unit (Model, No. Seri, Tgl Pembelian, Garansi). Jangan mencampurkan teks kolom kiri dan kanan.
- JANGAN PERNAH memasukkan kode model produk (seperti 4T-C85HN7000X, 2T-C32BG1I, LC-..., AH-A5SAY, SJ-..., ES-...) ke dalam `customer_name`. `customer_name` HANYA untuk nama orang/perusahaan.
- Jika terdapat format seperti "- Ibu Hj. Meni Malik - Alamat : Jl. Raya..." atau "Nama ... Alamat : ...", pisahkan: masukkan nama orang ke `customer_name`, dan masukkan HANYA alamat jalan/lokasi ke `customer_address` (hapus kata "Alamat :" dan nama pelanggan dari `customer_address`).

Anda WAJIB mengembalikan sebuah objek JSON valid dengan struktur kunci berikut:
{
  "notif_number": "Nomor notifikasi unik / Nomor WO / No Laporan (contoh: 2026117562, 202456677811, NTF-2026-1234)",
  "customer_name": "Nama lengkap konsumen / pelanggan (nama orang/instansi saja, bukan kode model unit, tanpa label 'Nama:' atau kode konsumen)",
  "customer_phone": "Nomor HP / WhatsApp konsumen (format digit angka bersih, contoh: 081234567890)",
  "customer_address": "Alamat lengkap pengerjaan servis saja (jalan, nomor, blok, RT/RW, kelurahan, kecamatan, kota) tanpa nama pelanggan dan tanpa kata 'Alamat:'",
  "unit_model": "Tipe atau model unit yang diservis (contoh: 4T-C85HN7000X, AH-A5SAY, 4T-C50EJ2X, SJ-X165MG)",
  "serial_number": "Nomor seri unit (SN / No. Seri)",
  "service_date": "Tanggal kunjungan atau tanggal penerimaan dokumen format YYYY-MM-DD (konversi dari DD.MM.YYYY atau DD/MM/YYYY; jika tidak ada kosongkan '')",
  "deadline": "Tanggal batas pengerjaan format YYYY-MM-DD (jika tidak ada samakan dengan service_date; jika tidak ada keduanya kosongkan '')",
  "status": "'berbayar' atau 'tidak_berbayar' (jika garansi, masih garansi, free klaim, gunakan 'tidak_berbayar'; jika habis garansi, bayar ongkos/suku cadang, gunakan 'berbayar')",
  "status_note": "Keterangan singkat status garansi/pembayaran jika tertera (misal: 'Garansi', 'Habis Garansi')",
  "work_status": "'selesai' jika dokumen menunjukkan perbaikan selesai, atau 'belum_selesai'",
  "work_types": ["Pilih dari daftar ini saja jika cocok: 'Install Standart', 'Install Bracket', 'Penjelasan', 'Service Minor', 'Service Mayor', 'Penambahan', 'Lain-lain'"],
  "start_time": "Jam mulai pengerjaan format HH:MM 24 jam (contoh: 09:30; kosongkan '' jika tidak ada)",
  "finish_time": "Jam selesai pengerjaan format HH:MM 24 jam (contoh: 11:00; kosongkan '' jika tidak ada)",
  "notes": "Catatan keluhan, gejala kerusakan, atau tindakan teknisi yang tertulis pada dokumen"
}

Jika ada nilai yang tidak ditemukan pada dokumen, kembalikan string kosong "" atau array kosong []. Jangan mengarang data dan jangan sertakan teks markdown atau penjelasan di luar JSON.
PROMPT;
    }
}
