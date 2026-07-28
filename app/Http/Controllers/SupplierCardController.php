<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\SupplierCardService;
use Inertia\Inertia;

class SupplierCardController extends Controller
{
    public function __construct(
        private SupplierCardService $service
    ) {}

    public function index()
    {
        return Inertia::render('supplier-card/index', [

            'pagination' => $this->service->getSupplierCards(),

            'totalMasuk' => $this->service->getTotalMasuk(),

            'totalKeluar' => $this->service->getTotalKeluar(),

            'totalLakuPaid' => $this->service->getTotalLakuPaid(),

            'totalHutang' => $this->service->getTotalHutang(),
        ]);
    }
}