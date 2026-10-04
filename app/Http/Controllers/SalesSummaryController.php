<?php

namespace App\Http\Controllers;

use App\Models\SalesSummary;
use App\Http\Requests\StoreSalesSummaryRequest;
use App\Http\Requests\UpdateSalesSummaryRequest;
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
        $printSummaryId = session('print_summary_id');
        return Inertia::render('sales-summary/index', compact('summary', 'printSummaryId'));
    }

    public function store(StoreSalesSummaryRequest $request)
    {
        $summary = $this->service->store($request->validated());
        return to_route('sales-summary.index')
            ->with('success', 'Rekapan berhasil disimpan')
            ->with('print_summary_id', $summary->id);
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

    public function print($id)
    {
        $data = $this->service->getPrintData($id);

        return view('reports.sales-summary-pdf', $data);
    }
}
