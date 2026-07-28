<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'brand',
        'has_expired',
        'purchase_price',
        'selling_price',
        'minimum_stock',
        'expired_date',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'has_expired' => 'boolean',
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
        'minimum_stock' => 'integer',
        'expired_date' => 'date',
    ];

    // Relasi ke kategori
    public function stock()
    {
        return $this->hasOne(ProductStock::class, 'id', 'id');
    }
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function saleTransactionDetails()
{
    return $this->hasMany(SaleTransactionDetail::class, 'product_id');
}

    public function inventoryTransactions()
    {
        return $this->hasMany(InventoryTransaction::class, 'product_id');
    }
    // Relasi ke user
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

    public function saleDetails()
    {
        return $this->hasMany(SaleTransactionDetail::class, 'product_id');
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

}