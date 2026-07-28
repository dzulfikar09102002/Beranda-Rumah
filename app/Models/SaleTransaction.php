<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SaleTransaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_number',
        'payment_method_id',
        'purchasing_method_id',
        'payment_status',
        'payment_type',
        'total_amount',
        'grand_total',
        'change',
        'transaction_date',
        'created_by',
        'updated_by',
        'deleted_by',
        'deleted_at'
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
    ];

    // Relasi
    public function details()
    {
        return $this->hasMany(SaleTransactionDetail::class);
    }
    public function saleTransactionDetails()
    {
        return $this->hasMany(
            SaleTransactionDetail::class,
            'purchase_id',
            'id'
        );
    }
    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }
    public function purchasingMethod()
    {
        return $this->belongsTo(PurchasingMethod::class);
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

        public function groupedDetails()
    {
        return $this->hasMany(
            SaleTransactionDetail::class,
            'sale_transaction_id'
        )

            ->join(
                'purchases',
                'purchases.id',
                '=',
                'sale_transaction_details.purchase_id'
            )

            ->join(
                'products',
                'products.id',
                '=',
                'purchases.product_id'
            )

            ->selectRaw('
                sale_transaction_details.sale_transaction_id,

                products.id as product_id,
                products.name as product_name,
                products.brand as product_brand,

                sale_transaction_details.purchase_price,
                sale_transaction_details.selling_price,

                MAX(sale_transaction_details.id) as id,
                MAX(sale_transaction_details.code) as code,

                SUM(sale_transaction_details.quantity) as quantity,
                SUM(sale_transaction_details.subtotal) as subtotal,
                SUM(sale_transaction_details.adjustment) as adjustment
            ')

            ->groupBy(
                'sale_transaction_details.sale_transaction_id',

                'products.id',
                'products.name',
                'products.brand',

                'sale_transaction_details.purchase_price',
                'sale_transaction_details.selling_price'
            )
            ->with('purchase.product');
    }
}