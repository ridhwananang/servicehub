<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by',
        'notif_number',
        'customer_name',
        'customer_phone',
        'customer_address',
        'unit_model',
        'serial_number',
        'service_date',
        'deadline',
        'status',
        'status_note',
        'work_status',
        'work_types',
        'other_work_text',
        'mainwork_center',
        'start_time',
        'finish_time',
        'visit_photo',
        'completion_photo',
        'notes',
    ];

    protected $casts = [
        'work_types' => 'array',
        'service_date' => 'date:Y-m-d',
        'deadline' => 'date:Y-m-d',
    ];

    /**
     * Get the user who created this ticket.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
