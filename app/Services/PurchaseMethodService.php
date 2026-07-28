<?php

namespace App\Services;

use App\Models\PurchasingMethod;

class PurchaseMethodService{
    public function getPurchaseMethod()
    {
        $search = request('search', '');

        return PurchasingMethod::whereLike('name', "%$search%")
            ->paginate(request('per_page', 10))
            ->withQueryString();
    }

     public function getDeletedMethod()
    {
        $search = request('search', '');

        return PurchasingMethod::onlyTrashed()
            ->whereLike('name', "%$search%")
            ->paginate(request('per_page', 10))
            ->withQueryString();
    }

     public function store(array $input)
    {
        $user = auth()->user();
        return PurchasingMethod::create([
            'name' => $input['name'],
            'created_by' => $user->id,
            'updated_by' => $user->id,
        ]);
    }

    public function update(PurchasingMethod $purchaseMethod, array $input)
    {
        return $purchaseMethod->update([
            'name'         => $input['name'],
            'updated_by'   => auth()->user()->id,
        ]);
    }

    public function delete(PurchasingMethod $purchaseMethod)
    {
        return $purchaseMethod->delete();
    }

    public function restore(int $id){
        $purchaseMethod = PurchasingMethod::withTrashed()->findOrFail($id);
        return $purchaseMethod->restore();
    }
   
}