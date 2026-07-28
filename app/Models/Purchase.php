<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Purchase extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_id',
        'supplier_id',
        'code',
        'year',
        'quantity',
        'purchase_price',
        'selling_price',
        'purchase_date',
        'total_payment',
        'status_payment',
        'payment_type',
        'expired_date',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    // Relasi ke product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Relasi ke supplier
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    // Relasi ke user (by)
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

    public function inventoryTransactions()
    {
        return $this->hasMany(
            InventoryTransaction::class,
            'reference_id',
            'id'
        )
        ->where('type', 'in')
        ->where('reference_table', 'purchase');
    }
    public function saleTransactionDetails()
    {
        return $this->hasMany(SaleTransactionDetail::class);
    }
    public function returnTransaction()
    {
        return $this->hasMany(
            InventoryTransaction::class,
            'reference_id',
            'id'
        )
        ->where('type', 'out')
        ->where('reference_table', 'purchase');
    }
}