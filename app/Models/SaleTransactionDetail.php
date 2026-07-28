<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SaleTransactionDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sale_transaction_id',
        'purchase_id',
        'code',
        'quantity',
        'purchase_price',
        'selling_price',
        'subtotal',
        'adjustment',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    // Relasi
   public function saleTransaction()
    {
        return $this->belongsTo(SaleTransaction::class)
            ->withTrashed();
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }
    public function inventoryTransactions()
    {
        return $this->hasMany(InventoryTransaction::class, 'reference_id')
            ->where('type', 'out')
            ->where('reference_table', 'sale');
    }
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id')->withTrashed();
    }
    public function returnTransaction()
    {
        return $this->hasMany(InventoryTransaction::class, 'reference_id')
            ->where('type', 'in')
            ->where('reference_table', 'sale');
    }
        // User tracking
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }

}