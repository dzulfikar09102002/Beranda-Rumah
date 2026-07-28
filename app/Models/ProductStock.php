<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductStock extends Model
{
    protected $table = 'product_stocks';

    protected $primaryKey = 'id';

    public $incrementing = false;

    public $timestamps = false;

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price'  => 'decimal:2',
        'total_in'       => 'integer',
        'total_out'      => 'integer',
        'stock'          => 'integer',
    ];

    protected $appends = [
        'minimum_stock',
        'stock_source',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'id', 'id');
    }

    public function inventoryTransactions()
    {
        return $this->hasMany(InventoryTransaction::class, 'product_id', 'id');
    }

    public function firstInTransaction()
    {
        return $this->hasOne(InventoryTransaction::class, 'product_id', 'id')
            ->where('type', 'in')
            ->whereNull('deleted_at')
            ->oldest('created_at')
            ->oldest('id');
    }
    public function getMinimumStockAttribute()
    {
        return $this->product?->minimum_stock;
    }
    public function getStockSourceAttribute()
    {
        $hasConsignmentStock = $this->inventoryTransactions()
            ->whereNull('deleted_at')
            ->where('source', 'consignment')
            ->selectRaw("
                COALESCE(SUM(
                    CASE
                        WHEN type = 'in' THEN quantity
                        WHEN type = 'out' THEN -quantity
                        ELSE 0
                    END
                ), 0) as total
            ")
            ->value('total');

        return $hasConsignmentStock > 0
            ? 'consignment'
            : 'purchase';
    }
}