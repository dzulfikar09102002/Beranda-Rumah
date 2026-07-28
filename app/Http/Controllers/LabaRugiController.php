<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\LabaRugiService;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\SaleTransaction;
use App\Models\Purchase;
use App\Models\Product;
use App\Models\Category;

class LabaRugiController extends Controller
{
     public function __construct(
        private LabaRugiService $service
    ) {}

    public function index(?int $bulan = null, ?int $tahun = null)
    {
        $bulan = $bulan ?? now()->month;
        $tahun = $tahun ?? now()->year;

        $data = $this->service->getLabaRugi($bulan, $tahun);
        return Inertia::render('laba-rugi/index', compact('data'));
    }

   public function printLabaRugi(Request $request)
    {
        $request->validate([
            'type' => 'required|in:month,year',
            'tahun' => 'required|integer',
            'bulan' => 'nullable|integer|min:1|max:12',
        ]);

        $type  = $request->type;
        $bulan = $request->bulan;
        $tahun = $request->tahun;

        $queryPendapatan = SaleTransaction::query()
            ->where('payment_type', 'cash')
            ->where('payment_status', '!=', 'canceled')
                ->whereRaw('updated_at < DATE_ADD(created_at, INTERVAL 1 DAY)');
            

        $queryPiutang = SaleTransaction::query()
            ->where(function ($q) {
                $q->where('payment_type', 'credit')
                ->orWhereRaw('updated_at >= DATE_ADD(created_at, INTERVAL 1 DAY)');
            })
            ->where('payment_status', '!=', 'canceled');

        $queryPembelian = Purchase::query()
            ->where('payment_type', 'cash')
            ->where('status_payment', '!=', 'canceled')
                ->whereRaw('updated_at < DATE_ADD(created_at, INTERVAL 1 DAY)');

        $queryUtang = Purchase::query()
            ->where(function ($q) {
                $q->where('payment_type', 'credit')
                ->orWhereRaw('updated_at >= DATE_ADD(created_at, INTERVAL 1 DAY)');
            })
            ->where('status_payment', '!=', 'canceled');

        if ($type === 'month') {
            if (!$bulan) {
                abort(400, 'Bulan wajib diisi');
            }

            foreach ([
                [$queryPendapatan, 'transaction_date'],
                [$queryPiutang, 'transaction_date'],
                [$queryPembelian, 'purchase_date'],
                [$queryUtang, 'purchase_date'],
            ] as [$query, $column]) {
                $query->whereMonth($column, $bulan)
                    ->whereYear($column, $tahun);
            }

        } else {
            foreach ([
                [$queryPendapatan, 'transaction_date'],
                [$queryPiutang, 'transaction_date'],
                [$queryPembelian, 'purchase_date'],
                [$queryUtang, 'purchase_date'],
            ] as [$query, $column]) {
                $query->whereYear($column, $tahun);
            }
        }

        $totalPendapatan = (float) $queryPendapatan
            ->where('payment_status', 'paid')
            ->sum('grand_total');

        $totalPendapatanPiutang = (float) $queryPiutang
            ->sum('total_amount');

        $totalPembelian = (float) $queryPembelian
            ->sum('total_payment');

        $totalUtang = (float) $queryUtang
            ->sum('total_payment');

        $laba = $totalPendapatan
            + $totalPendapatanPiutang
            - $totalPembelian
            - $totalUtang;

        $data = [
            'type' => $type,
            'bulan' => $bulan,
            'tahun' => $tahun,
            'total_pendapatan' => $totalPendapatan,
            'total_pendapatan_piutang' => $totalPendapatanPiutang,
            'total_pembelian' => $totalPembelian,
            'total_utang' => $totalUtang,
            'laba_rugi' => $laba,
        ];

        $pdf = Pdf::loadView('reports.laba-rugi-pdf', [
            'data' => $data,
            'type' => $type,
            'bulan' => $bulan,
            'tahun' => $tahun,
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('laporan-laba-rugi.pdf');
    }

}
