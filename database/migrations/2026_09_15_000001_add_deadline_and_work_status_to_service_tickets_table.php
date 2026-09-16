<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('service_tickets', function (Blueprint $table) {
            $table->date('deadline')->nullable()->after('service_date');
            $table->string('work_status')->default('belum_selesai')->after('status_note');
            $table->index(['work_status', 'deadline']);
        });

        // Backfill existing records: set deadline to service_date if available, work_status to belum_selesai
        DB::table('service_tickets')
            ->whereNull('deadline')
            ->update([
                'deadline' => DB::raw('COALESCE(service_date, CURRENT_DATE)'),
                'work_status' => 'belum_selesai',
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_tickets', function (Blueprint $table) {
            $table->dropIndex(['work_status', 'deadline']);
            $table->dropColumn(['deadline', 'work_status']);
        });
    }
};
