<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();

            // Relasi
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('code');
            $table->foreignId('supplier_id')->constrained('suppliers')->onDelete('cascade');

            // Data pembelian
            $table->integer('year'); 
            $table->integer('quantity'); // jumlah stok masuk
            $table->decimal('purchase_price', 15, 2); // harga beli
            $table->decimal('selling_price', 15, 2); // harga beli
            $table->date('purchase_date'); // tanggal beli
            $table->date('expired_date')->nullable(); // tanggal expired

            // Kolom by
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // FK ke users
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('updated_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('deleted_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};