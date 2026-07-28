<?php

namespace App\Services;

use App\Models\PaymentMethod;

class PaymentMethodService{
    public function getPaymentMethod()
    {
        $search = request('search', '');

        return PaymentMethod::whereLike('name', "%$search%")
            ->paginate(request('per_page', 10))
            ->withQueryString();
    }
    public function getDeletedMethod()
    {
        $search = request('search', '');

        return PaymentMethod::onlyTrashed()
            ->whereLike('name', "%$search%")
            ->paginate(request('per_page', 10))
            ->withQueryString();
    }
    public function store(array $input)
    {
        $user = auth()->user();
        return PaymentMethod::create([
            'name' => $input['name'],
            'kind' => $input['kind'],
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    public function update(PaymentMethod $paymentMethod, array $input)
    {
        return $paymentMethod->update([
            'name'         => $input['name'],
            'kind'         => $input['kind'],
            'updated_by'   => auth()->user()->id,
        ]);
    }

    public function delete(PaymentMethod $paymentMethod)
    {
        return $paymentMethod->delete();
    }

    public function restore(int $id){
        $paymentmethod = PaymentMethod::withTrashed()->findOrFail($id);
        return $paymentmethod->restore();
    }
}