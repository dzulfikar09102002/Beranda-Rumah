<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePurchaseMethodRequest;
use App\Http\Requests\UpdatePurchaseMethodRequest;
use App\Models\PurchasingMethod;
use App\Services\PurchaseMethodService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseMethodController extends Controller
{
    public function __construct(
        private PurchaseMethodService $service
    ) {}
    public function index()
    {
        $pagination = $this->service->getPurchaseMethod();
        return Inertia::render('purchase-methods/index', compact('pagination'));
    }
    public function store(StorePurchaseMethodRequest $request)
    {
        $this->service->store($request->validated());
        return to_route('purchase-methods.index')->with('success', 'Metode pembelian berhasil ditambahkan');
    }
    public function update(UpdatePurchaseMethodRequest $request, PurchasingMethod $purchaseMethod)
    {
        $this->service->update($purchaseMethod, $request->validated());
        return to_route('purchase-methods.index')->with('success', 'Metode pembelian berhasil diperbarui');
    }
    public function destroy(PurchasingMethod $purchaseMethod)
    {
        $this->service->delete($purchaseMethod);
        return to_route('purchase-methods.index')->with('success', 'Metode pembelian berhasil dihapus');
    }

    public function restore(int $id)
    {
        $this->service->restore($id);
        return to_route('purchase-methods.index')->with('success', 'Metode pembelian berhasil dipulihkan');
    }

    public function deleted(){
        $onlyTrashed = true;
        $pagination = $this->service->getDeletedMethod();
        return Inertia::render('purchase-methods/index', compact('pagination', 'onlyTrashed'));
    }
}
