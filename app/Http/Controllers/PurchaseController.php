<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePurchaseRequest;
use App\Http\Requests\UpdatePurchaseRequest;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Services\PurchaseService;
use Inertia\Inertia;


class PurchaseController extends Controller
{
    public function __construct(
        private PurchaseService $service
    ) {}

    public function index()
    {
        $pagination = $this->service->getProducts(); 
        $categoryOptions = $this->service->getCategoryOptions();
        $supplierOptions = $this->service->getSupplierOptions();
        return Inertia::render('purchases/index', compact('pagination', 'categoryOptions', 'supplierOptions'));
    }
    public function store(StorePurchaseRequest $request)
    {
        $this->service->store($request->validated());
        return to_route('purchases.index')->with('success', 'Metode pembayaran berhasil diperbarui');
    }
    public function generateCode(Request $request)
    {
        $code = $this->service->generateCode(
            productId: $request->product_id,
            year: $request->year,
            expiredDate: $request->expired_date
        );
        return response()->json([
            'code' => $code
        ]);
    }
}
