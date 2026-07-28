<?php

namespace App\Services;

use App\Models\CashLedger;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CashLedgerService
{
    public function getDailyReport()
    {
        $date = request('date');
        $date = $date
            ? Carbon::parse($date)->toDateString()
            : now()->toDateString();

        $pagination = CashLedger::query()
            ->with(['sale.details', 'purchase'])
            ->whereDate('transaction_date', $date)
            ->when(request('cash_type'), function ($q) {
                $q->where('cash_flow_type', request('cash_type'));
            })
            ->orderBy('transaction_date')
            ->paginate(request('per_page', 10))
            ->withQueryString();    

        return $pagination;
    }

    public function getOpeningBalance(): float
    {
        $date = request('date');
        $date = $date
            ? Carbon::parse($date)->toDateString()
            : now()->toDateString();
        $date = Carbon::parse($date);
        return (float) CashLedger::query()
            ->whereBetween('transaction_date', [
                $date->copy()->startOfMonth(),
                $date->copy()->subDay()->endOfDay(),
            ])
            ->when(request()->filled('cash_type'), function ($q) {
                $q->where('cash_flow_type', request('cash_type'));
            })
            ->selectRaw("
                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'in' THEN amount
                            WHEN type = 'out' THEN -amount
                            ELSE 0
                        END
                    ),
                0) as balance
            ")
            ->value('balance');
            }

    public function getCashSummary(): array
    {
        $date = request('date');
        $date = $date
            ? Carbon::parse($date)->toDateString()
            : now()->toDateString();

        $date = Carbon::parse($date);

        $result = CashLedger::query()
            ->whereDate('transaction_date', $date)
            ->when(request()->filled('cash_type'), function ($q) {
                $q->where('cash_flow_type', request('cash_type'));
            })
            ->selectRaw("
                COALESCE(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) as total_masuk,
                COALESCE(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) as total_keluar
            ")
            ->first();

        return [
            'total_masuk' => (float) $result->total_masuk,
            'total_keluar' => (float) $result->total_keluar,
        ];
    }

    public function store(array $validated)
    {
        $input = [
            'transaction_date' => $validated['transaction_date'],
            'type'             => $validated['type'],
            'category'         => $validated['category'],
            'amount'           => $validated['amount'],
            'description'      => $validated['description'] ?? null,
            'reference_table'  => $validated['reference_table'] ?? 'manual',
            'reference_id'     => $validated['reference_id'] ?? null,
            'cash_flow_type'   => $validated['cash_flow_type'],
            'created_by'       => auth()->id(),
            'updated_by'       => auth()->id(),
        ];
        CashLedger::create($input);
        return back()->with('success', 'Transaksi berhasil ditambahkan');
    }
}