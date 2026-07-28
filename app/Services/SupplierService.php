<?php

namespace App\Services;

use App\Models\Supplier;

class SupplierService
{
    public function getSuppliers()
    {
        $search = request('search', '');

        return Supplier::whereLike('name', "%$search%")
            ->paginate(request('per_page', 10))
            ->withQueryString();
    }

    public function getDeletedMethod()
    {
        $search = request('search', '');

        return Supplier::onlyTrashed()
            ->whereLike('name', "%$search%")
            ->paginate(request('per_page', 10))
            ->withQueryString();
    }

    public function store(array $input)
    {
        $user = auth()->user();

        return Supplier::create([
            'name'        => $input['name'],
            'contact'     => $input['contact'],
            'address'     => $input['address'],
            'created_by'  => $user->id,
            'updated_by'  => $user->id,
        ]);
    }

    public function update(Supplier $supplier, array $input)
    {
        return $supplier->update([
            'name'        => $input['name'],
            'contact'     => $input['contact'],
            'address'     => $input['address'],
            'updated_by'  => auth()->user()->id,
        ]);
    }

     public function delete(Supplier $supplier)
    {
        return $supplier->delete();
    }

    public function restore(int $id){
        $supplier = Supplier::withTrashed()->findOrFail($id);
        return $supplier->restore();
    }
}