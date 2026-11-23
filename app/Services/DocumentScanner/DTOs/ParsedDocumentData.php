<?php

namespace App\Services\DocumentScanner\DTOs;

class ParsedDocumentData
{
    public function __construct(
        public readonly string $notif_number = '',
        public readonly string $customer_name = '',
        public readonly string $customer_phone = '',
        public readonly string $customer_address = '',
        public readonly string $unit_model = '',
        public readonly string $serial_number = '',
        public readonly string $service_date = '',
        public readonly string $deadline = '',
        public readonly string $status = 'berbayar',
        public readonly string $status_note = '',
        public readonly string $work_status = 'belum_selesai',
        public readonly array $work_types = [],
        public readonly string $start_time = '',
        public readonly string $finish_time = '',
        public readonly string $notes = '',
        public readonly string $raw_text = '',
        public readonly string $provider = 'gemini',
    ) {}

    /**
     * Create DTO from raw associative array.
     */
    public static function fromArray(array $data, string $provider = 'gemini'): self
    {
        $notifNumber = trim((string) ($data['notif_number'] ?? ''));
        $customerName = trim((string) ($data['customer_name'] ?? ''));
        $customerAddress = trim((string) ($data['customer_address'] ?? ''));
        $unitModel = trim((string) ($data['unit_model'] ?? ''));
        $serialNumber = trim((string) ($data['serial_number'] ?? ''));
        $customerPhone = self::normalizePhone((string) ($data['customer_phone'] ?? ''));

        // Recover customer name if AI bundled "- <Name> - Alamat : <Address>" into customer_address
        if (preg_match('/^[\-\s]*([^-\n:]{2,80}?)\s*-\s*Alamat\s*[:\-]?\s*(.+)$/is', $customerAddress, $addrMatch)) {
            $extractedName = trim($addrMatch[1], " \t\n\r\0\x0B-:");
            $cleanedAddr = trim($addrMatch[2]);

            if ($extractedName !== '' && ($customerName === '' || self::looksLikeUnitModel($customerName, $unitModel))) {
                $customerName = $extractedName;
            }
            if ($cleanedAddr !== '') {
                $customerAddress = $cleanedAddr;
            }
        } else {
            // Strip leading "Alamat :" prefix if present
            $customerAddress = trim((string) preg_replace('/^Alamat\s*[:\-]\s*/i', '', $customerAddress));
        }

        // Prevent unit model code from remaining in customer_name
        if ($customerName !== '' && self::looksLikeUnitModel($customerName, $unitModel)) {
            if ($unitModel === '') {
                $unitModel = $customerName;
            }
            $customerName = '';
        }

        // Normalize status
        $rawStatus = strtolower(trim((string) ($data['status'] ?? 'berbayar')));
        $status = in_array($rawStatus, ['tidak_berbayar', 'tidak berbayar', 'free', 'gratis', 'garansi', 'warranty', 'claim', 'claim_garansi'], true)
            ? 'tidak_berbayar'
            : 'berbayar';

        // Normalize work types
        $workTypes = [];
        if (isset($data['work_types'])) {
            if (is_array($data['work_types'])) {
                $workTypes = array_values(array_filter(array_map('trim', $data['work_types'])));
            } elseif (is_string($data['work_types'])) {
                $workTypes = array_values(array_filter(array_map('trim', explode(',', $data['work_types']))));
            }
        }

        // Format dates YYYY-MM-DD if present
        $serviceDate = self::normalizeDate((string) ($data['service_date'] ?? ''));
        $deadline = self::normalizeDate((string) ($data['deadline'] ?? ''));
        if ($deadline === '' && $serviceDate !== '') {
            $deadline = $serviceDate;
        }
        if ($serviceDate === '' && $deadline !== '') {
            $serviceDate = $deadline;
        }

        return new self(
            notif_number: $notifNumber,
            customer_name: $customerName,
            customer_phone: $customerPhone,
            customer_address: $customerAddress,
            unit_model: $unitModel,
            serial_number: $serialNumber,
            service_date: $serviceDate,
            deadline: $deadline,
            status: $status,
            status_note: trim((string) ($data['status_note'] ?? '')),
            work_status: trim((string) ($data['work_status'] ?? 'belum_selesai')) === 'selesai' ? 'selesai' : 'belum_selesai',
            work_types: $workTypes,
            start_time: self::normalizeTime((string) ($data['start_time'] ?? '')),
            finish_time: self::normalizeTime((string) ($data['finish_time'] ?? '')),
            notes: trim((string) ($data['notes'] ?? '')),
            raw_text: trim((string) ($data['raw_text'] ?? '')),
            provider: $provider,
        );
    }

    protected static function looksLikeUnitModel(string $value, string $unitModel): bool
    {
        $trimmed = trim($value);
        if ($trimmed === '') {
            return false;
        }
        if ($unitModel !== '' && strcasecmp($trimmed, trim($unitModel)) === 0) {
            return true;
        }

        // Typical Sharp/appliance alphanumeric model codes without spaces (e.g. 4T-C85HN7000X, AH-A5SAY, SJ-X165MG)
        return preg_match('/^(?:[0-9A-Z]{2,4}-[A-Z0-9-]{3,}|[A-Z]{2,4}\d{2,}[A-Z0-9-]*)$/i', $trimmed) === 1
            && preg_match('/\d/', $trimmed) === 1
            && !str_contains($trimmed, ' ');
    }

    protected static function normalizePhone(string $raw): string
    {
        $cleaned = preg_replace('/[^\d+]/', '', trim($raw)) ?? '';
        if ($cleaned === '') {
            return '';
        }
        if (str_starts_with($cleaned, '+62')) {
            $cleaned = '0' . substr($cleaned, 3);
        } elseif (str_starts_with($cleaned, '62') && strlen($cleaned) >= 11) {
            $cleaned = '0' . substr($cleaned, 2);
        }

        return $cleaned;
    }

    protected static function normalizeDate(string $raw): string
    {
        $trimmed = trim($raw);
        if ($trimmed === '' || in_array(strtolower($trimmed), ['-', 'n/a', 'null', 'tidak ada'], true)) {
            return '';
        }
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $trimmed) === 1) {
            return $trimmed;
        }
        // Handle Indonesian DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
        if (preg_match('/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})$/', $trimmed, $m) === 1) {
            $day = (int) $m[1];
            $month = (int) $m[2];
            $year = (int) $m[3];
            if ($year < 100) {
                $year += 2000;
            }
            if ($month >= 1 && $month <= 12 && $day >= 1 && $day <= 31 && checkdate($month, $day, $year)) {
                return sprintf('%04d-%02d-%02d', $year, $month, $day);
            }
        }

        $ts = strtotime($trimmed);

        return $ts !== false ? date('Y-m-d', $ts) : '';
    }

    protected static function normalizeTime(string $raw): string
    {
        $trimmed = trim($raw);
        if (preg_match('/\b([01]?\d|2[0-3])[:\.]([0-5]\d)\b/', $trimmed, $m) === 1) {
            return sprintf('%02d:%02d', (int) $m[1], (int) $m[2]);
        }

        return '';
    }

    /**
     * Convert DTO to array matching frontend ParsedRepairDocument interface.
     */
    public function toArray(): array
    {
        return [
            'notif_number' => $this->notif_number,
            'customer_name' => $this->customer_name,
            'customer_phone' => $this->customer_phone,
            'customer_address' => $this->customer_address,
            'unit_model' => $this->unit_model,
            'serial_number' => $this->serial_number,
            'service_date' => $this->service_date,
            'deadline' => $this->deadline,
            'status' => $this->status,
            'status_note' => $this->status_note,
            'work_status' => $this->work_status,
            'work_types' => $this->work_types,
            'start_time' => $this->start_time,
            'finish_time' => $this->finish_time,
            'notes' => $this->notes,
            'raw_text' => $this->raw_text,
            'provider' => $this->provider,
        ];
    }
}
