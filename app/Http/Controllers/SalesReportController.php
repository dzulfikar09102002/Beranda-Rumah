<?php

namespace App\Http\Controllers;
use App\Services\SalesReportService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\models\SaleTransaction;
use Barryvdh\DomPDF\Facade\Pdf;

class SalesReportController extends Controller
{
    public function __construct(
        protected SalesReportService $service
    ) {}

    public function index()
    {
        $result = $this->service->getSalesReport();
        return Inertia::render('reports/sellings/index', [
            'pagination' => $result['data'],
            'total_profit' => $result['total_profit'],
            'total_selling' =>$result['total_selling'],
        ]);
    }

    public function show($id)
    {
        $transaction = SaleTransaction::withTrashed()
            ->with('paymentMethod')
            ->findOrFail($id);

        $pagination = $this->service->getDetailSalesReport($id);
        
        return Inertia::render('reports/sellings/detail', [
            'pagination' => $pagination,
            'transaction' => $transaction,
        ]);
    }

     public function cancel($id)
    {
        $this->service->cancel($id);
    return to_route('reports.sales.index')->with('success', 'Transaksi berhasil dibatalkan');
    }

    public function destroy(SaleTransaction $sale)
    {
        $sale->delete();

        return to_route('reports.sales.index')
            ->with('success', 'Transaksi berhasil dihapus');
    }

     public function restore(int $id)
    {
        $this->service->restore($id);
        return to_route('reports.sales.index')->with('success', 'Transaksi berhasil dipulihkan');
    }

    public function canceled ()
    {
        $pagination = $this->service->getCanceledMethod();
        return Inertia::render('reports/sellings/index', compact('pagination'));

    }
    public function deleted(){
        $onlyTrashed = true;
        $pagination = $this->service->getDeletedMethod();
        return Inertia::render('reports/sellings/index', compact('pagination'));
    }

    public function printSalesReport(Request $request)
    {
        $isDeleted  = $request->boolean('deleted');
        $isCanceled = $request->boolean('canceled');

        $type = $request->type ?? 'month';

        $startDate = $request->start_date;
        $endDate   = $request->end_date;

        if (!$startDate || !$endDate) {
            $startDate = now()->startOfMonth()->toDateString();
            $endDate   = now()->endOfMonth()->toDateString();
        }

        $start = \Carbon\Carbon::parse($startDate);
        $end   = \Carbon\Carbon::parse($endDate);

        $query = SaleTransaction::query()
            ->with([
                'details' => function ($q) {
                    $q->with([
                        'purchase' => function ($q2) {
                            $q2->withTrashed()->with([
                                'product' => fn ($q3) => $q3->withTrashed()
                            ]);
                        },
                        'inventoryTransactions',
                        'returnTransaction',
                    ]);
                }
            ]);

        if ($isCanceled) {
            $query->where('payment_status', 'canceled');
        } elseif ($isDeleted) {
            $query->onlyTrashed();
        } else {
            $query->where('payment_status', '!=', 'canceled');
        }

        $bulan = $request->bulan;
        $tahun = $request->tahun;

        if ($type === 'year') {
            $query->whereYear('transaction_date', $tahun ?? $start->year);
        } 
        elseif ($type === 'month' || $type === 'week') {
        $query->whereMonth('transaction_date', $bulan)
            ->whereYear('transaction_date', $tahun);
            
        } 
        else {
            $query->whereBetween('transaction_date', [
                $start->copy()->startOfDay(),
                $end->copy()->endOfDay()
            ]);
        }

        $transactions = $query
            ->orderBy('transaction_date')
            ->get();

        $transactions->each(function ($item) use ($isCanceled) {
            if ($isCanceled) {
                $return = $item->details
                    ->flatMap(fn ($d) => $d->returnTransaction)
                    ->first();
                $item->reason = $return?->note;
            } else {
                $inventory = $item->details
                    ->flatMap(fn ($d) => $d->inventoryTransactions)
                    ->first();
                $item->reason = $inventory?->note;
            }
        });

        $weeklyTotals = [];

        if ($type === 'week') {
            $transactions = $transactions
                ->sortBy('transaction_date')
                ->groupBy(function ($trx) {
                    return ceil(
                        \Carbon\Carbon::parse($trx->transaction_date)->day / 7
                    );
                });

            foreach ($transactions as $week => $items) {
                $weeklyTotals[$week] = $isDeleted
                    ? (float) $items->sum('total_amount')
                    : (float) $items->sum(fn ($trx) =>
                        (float) ($trx->total_amount - ($trx->change ?? 0))
                    );
            }
        }

        $flat = collect($transactions)->flatten();

        $total = $isDeleted
            ? (float) $flat->sum('total_amount')
            : (float) $flat->sum(fn ($trx) =>
                (float) ($trx->total_amount - ($trx->change ?? 0))
            );

        if ($type === 'year') {
        $periode = $tahun ?? $start->year;

        } elseif ($type === 'month') {
            $periode = \Carbon\Carbon::create($tahun, $bulan, 1)
                ->translatedFormat('F Y');

        } elseif ($type === 'week') {
            $periode = 'Per Minggu - ' .
                \Carbon\Carbon::create($tahun, $bulan, 1)
                ->translatedFormat('F Y');

        } else {
            $periode =
                $start->format('d M Y') .
                ' - ' .
                $end->format('d M Y');
        }

        $title = $isDeleted
            ? 'Laporan Barang Rusak / Expired'
            : ($isCanceled ? 'Laporan Pembatalan' : 'Laporan Penjualan');

        $title .= ' - ' . $periode;

        $pdf = Pdf::loadView(
            'reports.sales-pdf',
            [
                'type'         => $type,
                'transactions' => $transactions,
                'weeklyTotals' => $weeklyTotals,
                'total'        => $total,
                'isCanceled'   => $isCanceled,
                'isDeleted'    => $isDeleted,
                'title'        => $title,
                'periode'      => $periode,
            ]
        )->setPaper('A4', 'landscape');

        return $pdf->stream("laporan-sales-{$startDate}-to-{$endDate}.pdf");
    }
    public function payment(int $id)
    {
        $transaction = $this->service->getSaleTransaction($id);
        $details = $this->service->getTransactionDetails($id);
        $paymentMethods = $this->service->getPaymentMethods();

        return Inertia::render('sellings/payment', compact(
            'transaction',
            'details',
            'paymentMethods'
        ));
    }
}
