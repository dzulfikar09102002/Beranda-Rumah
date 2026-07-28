<?php

namespace App\Services;

use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\SaleTransactionDetail;
use App\Models\SaleTransaction;
use App\Models\Purchase;

class DashboardService
{
    public function getExpiredProducts($month, $year)
{
    return Product::query()
        ->whereNotNull('expired_date')
        ->whereMonth('expired_date', $month) 
        ->whereYear('expired_date', $year)   
        ->orderBy('expired_date', 'asc')
        ->limit(5)
        ->get();
}

    public function getBestSellingProducts($month, $year)
    {
        return SaleTransactionDetail::query()
    ->select('purchase_id', DB::raw('SUM(quantity) as total_sold'))
    ->with('purchase.product')
    ->whereHas('saleTransaction', function ($q) use ($month, $year) {
        $q->whereMonth('transaction_date', $month)
          ->whereYear('transaction_date', $year)
          ->where('payment_status', '!=', 'canceled'); 
    })
    ->groupBy('purchase_id')
    ->orderByDesc('total_sold')
    ->limit(5)
    ->get();
    }

    public function getMonthlyIncome($month, $year)
    {
        return SaleTransaction::query()
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year) 
            ->where('payment_status', '=', 'paid')
            ->sum('grand_total');
    }

    public function getMonthlyExpense($month, $year)
    {
        return Purchase::query()
        ->where('status_payment', 'paid')
            ->whereMonth('purchase_date', $month)
            ->whereYear('purchase_date', $year) 
            ->sum('total_payment');
    }

    public function getProfit($month, $year)
    {
        $income = $this->getMonthlyIncome($month, $year); 
        $expense = $this->getMonthlyExpense($month, $year);

        return $income - $expense;
    }

    public function getReceivable($month, $year)
{
    return SaleTransaction::query()
        ->where('payment_status', 'pending')
        ->whereMonth('transaction_date', $month)
        ->whereYear('transaction_date', $year)
        ->selectRaw('SUM(grand_total - total_amount) as total')
        ->value('total') ?? 0;
}

    public function getDailySalesChart($month, $year)
    {
        return SaleTransaction::query()
            ->select(
                DB::raw('DATE(transaction_date) as date'),
                DB::raw('SUM(grand_total) as total')
            )
            ->whereMonth('transaction_date', $month)
            ->whereYear('transaction_date', $year) 
            ->groupBy('date')
            ->orderBy('date')
            ->where('payment_status', '=', 'paid')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'total' => (int) $item->total,
                ];
            });
    }

public function getDebt($month, $year)
{
    return \App\Models\Purchase::query()
        ->where('status_payment', 'pending')
        ->whereMonth('purchase_date', $month)
        ->whereYear('purchase_date', $year)
        ->selectRaw('SUM((purchase_price * quantity) - COALESCE(total_payment, 0)) as total')
        ->value('total') ?? 0;
}
}