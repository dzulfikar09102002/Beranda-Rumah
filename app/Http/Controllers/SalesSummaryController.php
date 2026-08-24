<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSalesSummaryRequest;
use App\Models\SalesSummary;
use App\Services\SalesSummaryService;
use Inertia\Inertia;

class SalesSummaryController extends Controller
{
    public function __construct(
        protected SalesSummaryService $service
    ) {}

    public function index()
    {
        $summary = $this->service->getSalesSummaryToday();
        
        // Ambil summary terakhir yang memuat hasil rekapan 3 tabel
        $lastSummary = SalesSummary::with(['cashReconciliation', 'details.paymentMethod'])
            ->latest('date')
            ->first();

        return Inertia::render('sales-summary/index', [
            'summary' => $summary,
            'lastSummary' => $lastSummary,
        ]);
    }

    public function store(StoreSalesSummaryRequest $request)
    {
        $this->service->store($request->validated());
        return to_route('sales-summary.index')->with('success', 'Rekapan kasir berhasil ditutup dan disimpan');
    }

    public function history()
    {
        $pagination = $this->service->getHistorySalesSummaries();
        return Inertia::render('sales-summary/history', compact('pagination'));
    }

    public function detail($id)
    {
        $summary = $this->service->getDetail($id);
        return Inertia::render('sales-summary/detail', compact('summary'));
    }
}