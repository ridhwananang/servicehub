<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceTicketRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'notif_number' => 'required|string|max:50|unique:service_tickets,notif_number',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:50',
            'customer_address' => 'nullable|string|max:1000',
            'unit_model' => 'required|string|max:255',
            'serial_number' => 'required|string|max:255',
            'service_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'status' => 'required|in:berbayar,tidak_berbayar',
            'status_note' => 'nullable|string|max:100',
            'work_status' => 'nullable|in:belum_selesai,selesai',
            'work_types' => 'required|array|min:1',
            'work_types.*' => 'string|max:100',
            'other_work_text' => 'nullable|string|max:255',
            'mainwork_center' => 'required|string|max:100',
            'start_time' => 'nullable|string|max:20',
            'finish_time' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:2000',
            'visit_photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'visit_photo_url' => 'nullable|string',
            'completion_photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'completion_photo_url' => 'nullable|string',
        ];
    }

    /**
     * Prepare inputs for validation.
     */
    protected function prepareForValidation(): void
    {
        $date = $this->input('deadline') ?: ($this->input('service_date') ?: now()->toDateString());

        $this->merge([
            'deadline' => $this->input('deadline') ?: $date,
            'service_date' => $this->input('service_date') ?: $date,
            'work_status' => $this->input('work_status') ?: 'belum_selesai',
        ]);
    }
}
