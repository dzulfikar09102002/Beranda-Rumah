<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_transaction_details', function (Blueprint $table) {
            $table->id();

            $table->foreignId('sale_transaction_id')->constrained('sale_transactions')->onDelete('cascade');
            $table->foreignId('purchase_id')->constrained('purchase')->onDelete('restrict');
            $table->string('name');
            $table->integer('quantity');

            $table->decimal('purchase_price', 15, 2);
            $table->decimal('selling_price', 15, 2);

            $table->decimal('subtotal', 15, 2); // quantity * selling_price

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
        Schema::dropIfExists('sale_transaction_details');
    }
};