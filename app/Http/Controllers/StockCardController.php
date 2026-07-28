<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Services\StockCardService;

class StockCardController extends Controller
{
    protected StockCardService $stockCardService;

    public function __construct(StockCardService $stockCardService)
    {
        $this->stockCardService = $stockCardService;
    }

    public function index()
    {
        $result = $this->stockCardService->getStockCard();

        return Inertia::render('stock-cards/index', [
            'pagination' => $result['pagination'],
        ]);
    }
}