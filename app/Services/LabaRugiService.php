<?php 

namespace App\Services;

use App\Models\SaleTransaction;
use App\Models\Purchase;
use App\Models\Product;
use App\Models\Category;

class LabaRugiService
{
public function getLabaRugi(int $bulan, int $tahun)
{
    // Base query
    $queryPendapatan = SaleTransaction::query()
    ->where('payment_type', 'cash')
    ->where('payment_status', '!=', 'canceled')
    ->whereYear('transaction_date', $tahun)
    ->whereRaw('updated_at < DATE_ADD(created_at, INTERVAL 1 DAY)');

    $queryPiutang = SaleTransaction::query()
        ->where(function ($q) {
            $q->where('payment_type', 'credit')
            ->orWhereRaw('updated_at >= DATE_ADD(created_at, INTERVAL 1 DAY)');
        })
        ->where('payment_status', '!=', 'canceled')
        ->whereYear('transaction_date', $tahun);

    $queryPembelian = Purchase::query()
    ->where('payment_type', 'cash')
    ->where('status_payment', '!=', 'canceled')
    ->whereYear('purchase_date', $tahun)
    ->whereRaw('updated_at < DATE_ADD(created_at, INTERVAL 1 DAY)');

    $queryUtang = Purchase::query()
    ->where(function ($q) {
        $q->where('payment_type', 'credit')
          ->orWhereRaw('updated_at >= DATE_ADD(created_at, INTERVAL 1 DAY)');
    })
    ->where('status_payment', '!=', 'canceled')
    ->whereYear('purchase_date', $tahun);

    // Filter bulan
    if ($bulan) {
        $queryPendapatan->whereMonth('transaction_date', $bulan);
        $queryPiutang->whereMonth('transaction_date', $bulan);
        $queryPembelian->whereMonth('purchase_date', $bulan);
        $queryUtang->whereMonth('purchase_date', $bulan);
    }

    // Eksekusi
    $totalPendapatan = (float) $queryPendapatan
        ->where('payment_status', 'paid')
        ->sum('grand_total');

    $totalPendapatanPiutang = (float) $queryPiutang
        ->sum('total_amount');

    $totalPembelian = (float) $queryPembelian
        ->sum('total_payment');

    $totalUtang = (float) $queryUtang
        ->sum('total_payment');

    // Perhitungan laba (tetap sesuai punyamu)
    $laba = $totalPendapatan + $totalPendapatanPiutang - $totalPembelian - $totalUtang;

    return [
        'bulan' => $bulan,
        'tahun' => $tahun,
        'total_pendapatan' => $totalPendapatan,
        'total_pendapatan_piutang' => $totalPendapatanPiutang,
        'total_pembelian' => $totalPembelian,
        'total_utang' => $totalUtang,
        'laba_rugi' => $laba,
    ];
}
    
}