<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesSummary extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'date',
        'total_sales',
        'total_transactions',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'date' => 'datetime',
        'total_sales' => 'decimal:2',
    ];

    // 🔗 relasi
    public function details()
    {
        return $this->hasMany(SalesSummaryDetail::class);
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