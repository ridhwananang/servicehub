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
        Schema::table('service_tickets', function (Blueprint $table) {
            $table->index('service_date', 'idx_service_tickets_service_date');
            $table->index('status', 'idx_service_tickets_status');
            $table->index('mainwork_center', 'idx_service_tickets_mainwork_center');
            $table->index('customer_phone', 'idx_service_tickets_customer_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_tickets', function (Blueprint $table) {
            $table->dropIndex('idx_service_tickets_service_date');
            $table->dropIndex('idx_service_tickets_status');
            $table->dropIndex('idx_service_tickets_mainwork_center');
            $table->dropIndex('idx_service_tickets_customer_phone');
        });
    }
};
