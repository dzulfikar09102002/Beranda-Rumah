<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Enums\InventoryType;
use App\Enums\InventorySource;

class InventoryTransaction extends Model
{
    use SoftDeletes;    

    protected $fillable = [
        'product_id',
        'type',
        'source',
        'reference_id', 
        'reference_table',
        'quantity',
        'purchase_price',
        'selling_price',
        'note',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'selling_price' => 'decimal:2',
    ];


    public function product()
    {
        return $this->belongsTo(Product::class);
    }

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

    public function reference()
    {
        return match ($this->source) {
            InventorySource::PURCHASE => $this->belongsTo(Purchase::class, 'reference_id'),
            InventorySource::SALE => $this->belongsTo(SaleTransactionDetail::class, 'reference_id'),
            default => null,
        };
    }

    public function purchaseReference()
    {
        return $this->belongsTo(Purchase::class, 'reference_id')
            ->withTrashed();
    }

    public function saleReference()
    {
        return $this->belongsTo(SaleTransactionDetail::class, 'reference_id')
            ->withTrashed();
    }
    public function isIn(): bool
    {
        return $this->type === InventoryType::IN;
    }

    public function isOut(): bool
    {
        return $this->type === InventoryType::OUT;
    }

    public function totalPurchase(): float
    {
        return (float) ($this->purchase_price ?? 0) * $this->quantity;
    }

    public function totalSelling(): float
    {
        return (float) ($this->selling_price ?? 0) * $this->quantity;
    }

    public function profit(): float
    {
        return $this->totalSelling() - $this->totalPurchase();
    }
}