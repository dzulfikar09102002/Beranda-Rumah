<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdatePurchaseRequest;
use App\Models\Purchase;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Services\PurchasesReportService;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class PurchasesReportController extends Controller
{
    public function __construct(
        private PurchasesReportService $service
    ) {}

    public function index(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year  = $request->input('year', now()->year);

        $pagination = $this->service->getPurchases();
        $supplierOptions = $this->service->getSupplierOptions();
        $total_purchase = $this->service->getTotalPurchase();

        return Inertia::render('reports/purchasing/index', [
            'pagination' => $pagination,
            'onlyTrashed' => false,
            'month' => (int) $month,
            'year' => (int) $year,
            'supplierOptions' => $supplierOptions,
            'total_purchase' => $total_purchase
        ]);
    }

    public function update(UpdatePurchaseRequest $request, Purchase $purchase)
    {
        $this->service->update($purchase, $request->validated());

        return to_route(
            'reports.purchases.index',
            request()->only('search', 'month', 'year', 'page')
        )->with('success', 'Data pembelian berhasil diperbarui');
    }

    public function destroy(Purchase $purchase)
    {
        $this->service->delete($purchase);

        return to_route('reports.purchases.index', request()->only('search', 'month', 'year'))
            ->with('success', 'Data berhasil dihapus');
    }

    public function deleted(Request $request)
    {
        $month = $request->input('month', now()->month);
        $year  = $request->input('year', now()->year);

        $pagination = $this->service->getDeletedMethod();

        return Inertia::render('reports/purchasing/index', [
            'pagination' => $pagination,
            'onlyTrashed' => true,
            'month' => (int) $month,
            'year' => (int) $year,
        ]);
    }

    public function printPurchasesReport(Request $request): Response
    {
        $type = (string) ($request->type ?? 'month');

        $month = (int) ($request->month ?? now()->month);
        $year  = (int) ($request->year ?? now()->year);

        $startDate = $request->start_date;
        $endDate   = $request->end_date;

        $isDeleted = $request->boolean('deleted');

        $query = Purchase::with([
            'product',
            'supplier',
            'inventoryTransactions',
            'returnTransaction',
        ]);

        if ($isDeleted) {
            $query->onlyTrashed();
        }

        if ($type === 'range' && $startDate && $endDate) {
            $query->whereBetween('purchase_date', [$startDate, $endDate]);
        } elseif ($type === 'month' || $type === 'week') {
            $query->whereMonth('purchase_date', $month)
                ->whereYear('purchase_date', $year);
        } elseif ($type === 'year') {
            $query->whereYear('purchase_date', $year);
        }

        $rawTransactions = $query->latest('purchase_date')->get();

        $labels = [
            'purchase'    => 'Produksi',
            'sale'        => 'Penjualan',
            'adjustment'  => 'Penyesuaian',
            'return'      => 'Retur',
            'transfer'    => 'Transfer',
            'other'       => 'Lainnya',
            'damage'      => 'Barang Rusak',
            'expired'     => 'Kedaluwarsa',
            'consignment' => 'Titipan',
        ];

        $rawTransactions->each(function ($item) use ($isDeleted, $labels) {
            if ($isDeleted) {
                $return = $item->returnTransaction?->first();
                $item->reason = $return?->note;
                $item->source_label = $labels[$return?->source] ?? '-';
            } else {
                $inventory = $item->inventoryTransactions?->first();
                $item->reason = $inventory?->note;
                $item->source_label = $labels[$inventory?->source] ?? '-';
            }
        });

        $weeklyTotals = [];

        if ($type === 'week') {
            $groupedTransactions = $rawTransactions
                ->sortBy('purchase_date')
                ->groupBy(function ($trx) {
                    return ceil(Carbon::parse($trx->purchase_date)->day / 7);
                });

            foreach ($groupedTransactions as $week => $items) {
                $weeklyTotals[$week] = $isDeleted
                    ? (float) $items->sum('total_payment')
                    : (float) $items->where('status_payment', '!=', 'canceled')->sum('total_payment');
            }

            $transactionsData = $groupedTransactions;
        } else {
            $transactionsData = $rawTransactions;
        }

        $total = $isDeleted
            ? (float) $rawTransactions->sum('total_payment')
            : (float) $rawTransactions->where('status_payment', '!=', 'canceled')->sum('total_payment');

        $namaBulan = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];

        if ($type === 'range' && $startDate && $endDate) {
            $periode = Carbon::parse($startDate)->format('d M Y') . ' - ' . Carbon::parse($endDate)->format('d M Y');
        } elseif ($type === 'month') {
            $periode = ($namaBulan[$month] ?? '-') . ' ' . $year;
        } elseif ($type === 'week') {
            $periode = 'Per Minggu - ' . ($namaBulan[$month] ?? '-') . ' ' . $year;
        } else {
            $periode = (string) $year;
        }

        $title = $isDeleted
            ? 'Laporan Pembatalan Pembelian - ' . $periode
            : 'Laporan Pembelian - ' . $periode;

        $filename = ($isDeleted ? 'laporan-pembatalan-pembelian' : 'laporan-pembelian');
        if ($type === 'range' && $startDate && $endDate) {
            $filename .= "-{$startDate}-to-{$endDate}.pdf";
        } else {
            $filename .= "-{$month}-{$year}.pdf";
        }

        $pdf = Pdf::loadView(
            'reports.purchase-pdf',
            [
                'transactions' => $transactionsData,
                'weeklyTotals' => $weeklyTotals,
                'total'        => $total,
                'type'         => $type,
                'bulan'        => $month,
                'tahun'        => $year,
                'title'        => $title,
                'isDeleted'    => $isDeleted,
            ]
        )
        ->setPaper('A3', 'landscape')
        ->setOption('isRemoteEnabled', true);

        return $pdf->stream($filename);
    }

    public function pay(Purchase $purchase)
    {
        $this->service->pay($purchase, request()->all());

        return back()->with('success', 'Pembayaran berhasil');
    }
}