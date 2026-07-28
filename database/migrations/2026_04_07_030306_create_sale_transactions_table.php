<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_transactions', function (Blueprint $table) {
            $table->id();

            $table->string('invoice_number')->unique();

            $table->foreignId('payment_method_id')->constrained('payment_methods')->onDelete('restrict');

            // ENUM status
            $table->enum('payment_status', ['paid', 'pending', 'canceled'])->default('pending');

            $table->decimal('total_amount', 15, 2); // total sebelum diskon dll
            $table->decimal('grand_total', 15, 2);  // total akhir

            $table->dateTime('transaction_date');

            // by
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by');
            $table->unsignedBigInteger('deleted_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // FK user
            $table->foreign('created_by')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('deleted_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_transactions');
    }
};