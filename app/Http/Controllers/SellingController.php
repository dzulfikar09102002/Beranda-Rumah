<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentMethodRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\StoreSellingRequest;
use App\Http\Requests\UpdateSellingRequest;
use App\Models\SaleTransaction;
use App\Models\Selling;
use Illuminate\Http\Request;
use App\Services\SellingService;
use Inertia\Inertia;

class SellingController extends Controller
{
    public function __construct(
        private SellingService $service
    ) {}

    public function index()
    {
        $pagination = $this->service->getProducts(); 
        $categoryOptions = $this->service->getCategoryOptions();
        return Inertia::render('sellings/index', compact('pagination', 'categoryOptions'));
    }
    public function store(StoreSellingRequest $request)
    {
        $sale = $this->service->store($request->validated());
        return redirect()->route('sellings.payment', $sale->id);
    }

    public function payment(int $id)
    {
        $transaction = $this->service->getSaleTransaction($id);
        $details = $this->service->getTransactionDetails($id);
        $paymentMethods = $this->service->getPaymentMethods();
        $purchasingMethods = $this->service->getPurchasingMethod();
        return Inertia::render('sellings/payment', compact('transaction', 'details', 'paymentMethods','purchasingMethods'));
    }

    public function pay(StorePaymentRequest $request, SaleTransaction $sale)
    {
        $this->service->pay($sale, $request->validated());
        return to_route('sellings.index')->with('success', 'Pembayaran berhasil dipulihkan');
    }

}
