<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use Inertia\Inertia;

class ProductController extends Controller
{
     public function __construct(
        private ProductService $service
    ) {}
    
    public function index()
    {
        $pagination = $this->service->getProducts();
        $categoryOptions = $this->service->getCategoryOptions();

        return Inertia::render('products/index', compact('pagination', 'categoryOptions'));
    }

    public function store(StoreProductRequest $request)
    {
        $this->service->store($request->validated());
        return to_route('products.index')->with('success', 'Product Baru Berhasil Ditambahkan!');
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        $this->service->update($product, $request->validated());
        return to_route('products.index')->with('success', 'Product berhasil diperbarui');
    }
    public function destroy(Product $product)
    {
        $this->service->delete($product);
        return to_route('products.index')->with('success', 'Product berhasil dihapus');
    }
    public function restore(int $id)
    {
        $this->service->restore($id);
        return to_route('products.index')->with('success', 'Product berhasil dipulihkan');
    }
    public function deleted()
{
    $onlyTrashed = true;
    $pagination = $this->service->getDeletedMethod();
    $categoryOptions = $this->service->getCategoryOptions();
    return Inertia::render('products/index', compact(
        'pagination',
        'onlyTrashed',
        'categoryOptions'
    ));
}

}
