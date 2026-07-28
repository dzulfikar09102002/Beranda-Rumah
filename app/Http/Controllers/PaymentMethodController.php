<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentMethodRequest;
use App\Http\Requests\UpdatePaymentMethodRequest;
use App\Models\PaymentMethod;
use App\Services\PaymentMethodService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    public function __construct(
        private PaymentMethodService $service
    ) {}
    public function index()
    {
        $pagination = $this->service->getPaymentMethod();
        return Inertia::render('payment-methods/index', compact('pagination'));
    }
    public function store(StorePaymentMethodRequest $request)
    {
        $this->service->store($request->validated());
        return to_route('payment-methods.index')->with('success', 'Metode pembayaran berhasil diperbarui');
    }
    public function update(UpdatePaymentMethodRequest $request, PaymentMethod $paymentMethod)
    {
        $this->service->update($paymentMethod, $request->validated());
        return to_route('payment-methods.index')->with('success', 'Metode pembayaran berhasil diperbarui');
    }
    public function destroy(PaymentMethod $paymentMethod)
    {
        $this->service->delete($paymentMethod);
        return to_route('payment-methods.index')->with('success', 'Metode pembayaran berhasil dihapus');
    }

    public function restore(int $id)
    {
        $this->service->restore($id);
        return to_route('payment-methods.index')->with('success', 'Metode pembayaran berhasil dipulihkan');
    }

    public function deleted(){
        $onlyTrashed = true;
        $pagination = $this->service->getDeletedMethod();
        return Inertia::render('payment-methods/index', compact('pagination', 'onlyTrashed'));
    }
}
