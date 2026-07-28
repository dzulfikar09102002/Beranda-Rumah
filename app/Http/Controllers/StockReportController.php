<?php

namespace App\Http\Controllers;
use App\Services\StocksReportService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockReportController extends Controller
{
     public function __construct(
        protected StocksReportService $service
    ) {}

    public function index()
    {
        $pagination = $this->service->getStockReport();
        $total_assets = $this->service->getAssetsValue();
        return Inertia::render('reports/stocks/index', compact('pagination', 'total_assets'));
    }

    public function byCategories()
    {
        $pagination = $this->service->getStockReportByCategories();
        return Inertia::render('reports/stocks/index', compact('pagination'));
    }

}
