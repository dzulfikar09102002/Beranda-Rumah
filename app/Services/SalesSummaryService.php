<?php

namespace App\Services;

use App\Models\CashReconciliation;
use App\Models\SalesSummary;
use App\Models\SalesSummaryDetail;
use App\Models\SaleTransaction;
use Carbon\Carbon;
use DateTimeInterface;
use Illuminate\Support\Facades\DB;

class SalesSummaryService 
{
    public function getSalesSummaryToday(?DateTimeInterface $customStart = null)
    {
        if ($customStart) {
            $start = $customStart;
        } else {
            $lastSummary = SalesSummary::latest('date')->first();
            $start = $lastSummary
                ? Carbon::parse($lastSummary->date)->addSecond()
                : now()->startOfDay();
        }

        $end = now();

        $validTransactionsQuery = fn () => SaleTransaction::query()
            ->whereBetween('transaction_date', [$start, $end])
            ->whereNotNull('payment_method_id')
            ->where('payment_status', '!=', 'pending');

        $pagination = $validTransactionsQuery()
            ->with([
                'paymentMethod',
                'purchasingMethod',
                'groupedDetails.purchase.product',
            ])
            ->withSum(
                'details as total_revenue',
                DB::raw('(quantity * selling_price) - COALESCE(adjustment,0)')
            )
            ->withSum(
                'details as total_cost',
                DB::raw('quantity * purchase_price')
            )
            ->latest('transaction_date')
            ->paginate(request('per_page', 10))
            ->withQueryString();

        $transactions = $validTransactionsQuery()
            ->with([
                'groupedDetails',
                'paymentMethod'
            ])
            ->get(); 

        $totalTransaksi = $transactions->count();

        $totalItem = $transactions
            ->flatMap(fn ($trx) => $trx->details ?? collect())
            ->sum('quantity');

        $totalPendapatan = $transactions->sum(function ($trx) {
            return max(0, ($trx->total_amount ?? 0) - ($trx->change ?? 0));
        });

        $totalProfit = $transactions->sum(function ($trx) {
            return ($trx->details ?? collect())->sum(function ($detail) {
                $subtotal = (float) ($detail->subtotal ?? 0) - (float) ($detail->adjustment ?? 0);
                $modal = (float) ($detail->purchase_price ?? 0) * (float) ($detail->quantity ?? 0);
                return $subtotal - $modal;
            });
        });

        $byPaymentMethod = $transactions
            ->filter(fn ($trx) => !is_null($trx->paymentMethod))
            ->groupBy('payment_method_id')
            ->map(function ($items, $paymentMethodId) {
                $method = $items->first()->paymentMethod;

                return [
                    'payment_method_id' => $paymentMethodId,
                    'payment_method_name' => $method->name,
                    'payment_method_kind' => $method->kind,
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

        return SalesSummary::with(['cashReconciliation', 'details.paymentMethod'])
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
            
            $lastSummary = SalesSummary::latest('date')->first();
            $startTime = $lastSummary
                ? Carbon::parse($lastSummary->date)->addSecond()
                : now()->startOfDay();

            $summaryData = $this->getSalesSummaryToday($startTime);
            $byPaymentMethod = $summaryData->get('by_payment_method');
            $totalSales = (float) $summaryData->get('total_pendapatan');
            $totalTransactions = (int) $summaryData->get('total_transaksi');

            $summary = SalesSummary::create([
                'date' => now(),
                'total_sales' => $totalSales,
                'total_transactions' => $totalTransactions,
                'created_by' => $userId,
            ]);

            $details = collect($byPaymentMethod)
                ->filter(fn ($item) => (int) $item['payment_method_id'] > 0)
                ->map(function ($item) use ($summary, $userId) {
                    return [
                        'sales_summary_id' => $summary->id,
                        'payment_method_id' => $item['payment_method_id'],
                        'total_amount' => $item['total_nominal'],
                        'total_transactions' => $item['total_transaksi'],
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

            $actualCash = (float) ($data['actual_cash'] ?? 0);
            $startingCash = (float) ($data['starting_cash'] ?? 0);

            $cashPayment = collect($byPaymentMethod)->first(function ($item) {
                return strtolower($item['payment_method_kind'] ?? '') === 'cash';
            });
            $cashSales = (float) ($cashPayment['total_nominal'] ?? 0);

            $expectedCash = $startingCash + $cashSales;
            $difference = $actualCash - $expectedCash;

            $status = 'matched';
            if ($difference < 0) {
                $status = 'shortage';
            } elseif ($difference > 0) {
                $status = 'overage';
            }

            CashReconciliation::create([
                'sales_summary_id' => $summary->id,
                'starting_cash' => $startingCash,
                'expected_cash' => $expectedCash,
                'actual_cash' => $actualCash,
                'difference' => $difference,
                'status' => $status,
                'notes' => null,
                'created_by' => $userId,
            ]);

            return $summary->load(['details.paymentMethod', 'cashReconciliation']);
        });
    }

    public function getDetail($id)
    {
        return SalesSummary::with([
            'details.paymentMethod',
            'cashReconciliation'
        ])->findOrFail($id);
    }
}