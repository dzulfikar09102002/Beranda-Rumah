<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('sales_summary_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sales_summary_id')
                ->constrained('sales_summaries')
                ->restrictOnDelete();

            $table->foreignId('payment_method_id')
                ->constrained('payment_methods')
                ->restrictOnDelete();

            $table->decimal('total_amount', 15, 2)->default(0);
            $table->integer('total_transactions')->default(0);

            // audit
            $table->foreignId('created_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->restrictOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // unique per summary + payment method
            $table->unique(['sales_summary_id', 'payment_method_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales_summary_details');
    }
};