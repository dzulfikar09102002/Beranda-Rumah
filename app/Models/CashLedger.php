<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashLedger extends Model
{
    use SoftDeletes;

    protected $table = 'cash_ledger';

    protected $fillable = [
        'transaction_date',
        'type',
        'category',
        'amount',
        'description',
        'reference_table',
        'reference_id',
        'cash_flow_type',
        'created_by',
        'updated_by',
        'deleted_by',
    ];

    protected $casts = [
        'transaction_date' => 'datetime',
        'amount' => 'decimal:2',
    ];

    // type
    public const TYPE_IN  = 'in';
    public const TYPE_OUT = 'out';

    // category
    public const CATEGORY_OPERATING  = 'operating';
    public const CATEGORY_CAPITAL    = 'capital';
    public const CATEGORY_DRAWING    = 'drawing';
    public const CATEGORY_ADJUSTMENT = 'adjustment';
    public const CATEGORY_FINANCING  = 'financing';

    // reference table
    public const REF_SALE     = 'sale';
    public const REF_PURCHASE = 'purchase';
    public const REF_MANUAL   = 'manual';

    public static function typeOptions(): array
    {
        return [
            self::TYPE_IN => 'Masuk',
            self::TYPE_OUT => 'Keluar',
        ];
    }

    public static function categoryOptions(): array
    {
        return [
            self::CATEGORY_OPERATING  => 'Operasional',
            self::CATEGORY_CAPITAL    => 'Modal',
            self::CATEGORY_DRAWING    => 'Prive/Penarikan',
            self::CATEGORY_ADJUSTMENT => 'Penyesuaian',
            self::CATEGORY_FINANCING  => 'Pendanaan',
        ];
    }

    public function getReferenceAttribute()
    {
        return match ($this->reference_table) {
            self::REF_SALE => $this->sale,
            self::REF_PURCHASE => $this->purchase,
            default => null,
        };
    }
    public function sale()
    {
        return $this->belongsTo(SaleTransaction::class, 'reference_id');
    }

    public function purchase()
    {
        return $this->belongsTo(Purchase::class, 'reference_id');
    }


    public function scopeCashIn($query)
    {
        return $query->where('type', self::TYPE_IN);
    }

    public function scopeCashOut($query)
    {
        return $query->where('type', self::TYPE_OUT);
    }

    public function scopeCapital($query)
    {
        return $query->where(
            'category',
            self::CATEGORY_CAPITAL
        );
    }
}