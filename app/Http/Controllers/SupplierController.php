<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Models\Supplier;
use Illuminate\Http\Request;
use App\Services\SupplierService;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function __construct(
        private SupplierService $service
    ) {}

    public function index()
    {
        $pagination = $this->service->getSuppliers(); 
        return Inertia::render('suppliers/index', compact('pagination'));
    }
    public function store(StoreSupplierRequest $request)
    {
        $this->service->store($request->validated());
        return to_route('suppliers.index')->with('success', 'Supplier berhasil diperbarui');
    }
    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $this->service->update($supplier, $request->validated());
        return to_route('suppliers.index')->with('success', 'Supplier berhasil diperbarui');
    }
    public function destroy(Supplier $supplier)
    {
        $this->service->delete($supplier);
        return to_route('suppliers.index')->with('success', 'Supplier berhasil dihapus');
    }

    public function restore(int $id)
    {
        $this->service->restore($id);
        return to_route('suppliers.index')->with('success', 'Supplier berhasil dipulihkan');
    }

    public function deleted(){
        $onlyTrashed = true;
        $pagination = $this->service->getDeletedMethod();
        return Inertia::render('suppliers/index', compact('pagination', 'onlyTrashed'));
    }
}
