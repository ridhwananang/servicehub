<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('service_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('notif_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('unit_model');
            $table->string('serial_number');
            $table->string('status'); // berbayar, tidak_berbayar
            $table->string('status_note')->nullable(); // Garansi, Free Service, dsb
            $table->json('work_types'); // array string
            $table->string('other_work_text')->nullable(); // jika memilih Lain-lain
            $table->string('mainwork_center'); // Pulogadung, MOI, Lain-lain
            $table->string('start_time')->nullable(); // cth: 09:00
            $table->string('finish_time')->nullable(); // cth: 11:30
            $table->string('visit_photo')->nullable();
            $table->string('completion_photo')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_tickets');
    }
};
