<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesSummaryDetail extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sales_summary_id',
        'payment_method_id',
        'total_amount',
        'total_transactions',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
    ];

    // 🔗 relasi
    public function summary()
    {
        return $this->belongsTo(SalesSummary::class, 'sales_summary_id');
    }

    public function paymentMethod()
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function deleter()
    {
        return $this->belongsTo(User::class, 'deleted_by');
    }
}