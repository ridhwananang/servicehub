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
        // Normalize status
        $rawStatus = strtolower(trim((string) ($data['status'] ?? 'berbayar')));
        $status = in_array($rawStatus, ['tidak_berbayar', 'free', 'garansi', 'claim', 'claim_garansi'], true)
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

        // Format date YYYY-MM-DD if present
        $serviceDate = trim((string) ($data['service_date'] ?? ''));
        if ($serviceDate !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $serviceDate) !== 1) {
            $parsedTimestamp = strtotime($serviceDate);
            if ($parsedTimestamp !== false) {
                $serviceDate = date('Y-m-d', $parsedTimestamp);
            }
        }

        $deadline = trim((string) ($data['deadline'] ?? ''));
        if ($deadline === '' && $serviceDate !== '') {
            $deadline = $serviceDate;
        }

        return new self(
            notif_number: trim((string) ($data['notif_number'] ?? '')),
            customer_name: trim((string) ($data['customer_name'] ?? '')),
            customer_phone: trim((string) ($data['customer_phone'] ?? '')),
            customer_address: trim((string) ($data['customer_address'] ?? '')),
            unit_model: trim((string) ($data['unit_model'] ?? '')),
            serial_number: trim((string) ($data['serial_number'] ?? '')),
            service_date: $serviceDate,
            deadline: $deadline,
            status: $status,
            status_note: trim((string) ($data['status_note'] ?? '')),
            work_status: trim((string) ($data['work_status'] ?? 'belum_selesai')) === 'selesai' ? 'selesai' : 'belum_selesai',
            work_types: $workTypes,
            start_time: trim((string) ($data['start_time'] ?? '')),
            finish_time: trim((string) ($data['finish_time'] ?? '')),
            notes: trim((string) ($data['notes'] ?? '')),
            raw_text: trim((string) ($data['raw_text'] ?? '')),
            provider: $provider,
        );
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
