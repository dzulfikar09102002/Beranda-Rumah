<?php

namespace App\Services;

use App\Models\SalesSummary;
use App\Models\SalesSummaryDetail;
use App\Models\SaleTransaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SalesSummaryService 
{

    public function getSalesSummaryToday()
    {

        $lastSummary = SalesSummary::latest('date')->first();

        $start = $lastSummary
            ? \Carbon\Carbon::parse($lastSummary->date)->addSecond()
            : now()->startOfDay();

        $end = now();

        $pagination = SaleTransaction::with([
            'paymentMethod',
            'purchasingMethod',
            'groupedDetails.purchase.product',
        ])
        ->withSum(
            'details as total_revenue',
            \DB::raw('(quantity * selling_price) - COALESCE(adjustment,0)')
        )
        ->withSum(
            'details as total_cost',
            \DB::raw('quantity * purchase_price')
        )
        ->whereBetween('transaction_date', [$start, $end])
        ->latest('transaction_date')
        ->paginate(request('per_page', 10))
            ->withQueryString();

        $transactions = SaleTransaction::with([
            'groupedDetails',
            'paymentMethod'
        ])
            ->whereBetween('transaction_date', [$start, $end])
            ->get(); 

        $totalTransaksi = $transactions->count();

        $totalItem = $transactions
            ->flatMap(fn ($trx) => $trx->details)
            ->sum('quantity');

        $totalPendapatan = $transactions->sum(function ($trx) {
            return max(0, ($trx->total_amount ?? 0) - ($trx->change ?? 0));
        });

        $totalProfit = $transactions->sum(function ($trx) {

            return $trx->details->sum(function ($detail) {

                $subtotal =
                    (float) ($detail->subtotal ?? 0) -
                    (float) ($detail->adjustment ?? 0);

                $modal =
                    (float) ($detail->purchase_price ?? 0) *
                    (float) ($detail->quantity ?? 0);

                return $subtotal - $modal;
            });
        });

        $byPaymentMethod = $transactions
            ->groupBy(fn ($trx) => $trx->payment_method_id ?? 0)
            ->map(function ($items, $paymentMethodId) {

                $method = $items->first()->paymentMethod;

                return [
                    'payment_method_id' => $paymentMethodId,
                    'payment_method_name' => $method->name ?? 'Lainnya',
                    'payment_method_kind' => $method->kind ?? 'other',

                    'total_transaksi' => $items->count(),

                    'total_nominal' => $items->sum(function ($trx) {
                        return max(0, ($trx->total_amount ?? 0) - ($trx->change ?? 0));
                    }),
                ];
            })
            ->values();

        return collect([
            'start_from' => $start,
            'total_transaksi' => $totalTransaksi,
            'total_item' => $totalItem,
            'total_pendapatan' => $totalPendapatan,
            'by_payment_method' => $byPaymentMethod,
            'pagination' => $pagination,
            'total_profit' => $totalProfit,
        ]);
    }
    public function getHistorySalesSummaries()
    {
        $startDate = request('start_date')
            ? Carbon::createFromFormat('Y-m-d', request('start_date'))
            : now()->subDays(7);

        $endDate = request('end_date')
            ? Carbon::createFromFormat('Y-m-d', request('end_date'))
            : now();

        return SalesSummary::query()
            ->whereBetween('date', [
                $startDate->copy()->startOfDay(),
                $endDate->copy()->endOfDay(),
            ])
            ->latest('date')
            ->paginate(request('per_page', 10))
            ->withQueryString();
    }
    
    public function store(array $data): SalesSummary
    {
        
        return DB::transaction(function () use ($data) {

    $userId = auth()->id();

    $summary = SalesSummary::create([
        'date' => now(),
        'total_sales' => $data['total_sales'],
        'total_transactions' => $data['total_transactions'],
        'created_by' => $userId,
    ]);

    $details = collect($data['details'])
        ->filter(fn ($item) => (int) $item['payment_method_id'] > 0)
        ->map(function ($item) use ($summary, $userId) {
            return [
                'sales_summary_id' => $summary->id,
                'payment_method_id' => $item['payment_method_id'],
                'total_amount' => $item['total_amount'],
                'total_transactions' => $item['total_transactions'],
                'created_by' => $userId,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        })
        ->values()
        ->toArray();

    if (!empty($details)) {
        SalesSummaryDetail::insert($details);
    }

    return $summary->load('details');
});
    }

    public function getDetail($id)
    {
        return SalesSummary::with(['details.paymentMethod'])
            ->findOrFail($id);
    }
}