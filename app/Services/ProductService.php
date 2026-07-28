<?php 

namespace App\Services;

use App\Models\Product;
use App\Models\Category;

class ProductService
{
    public function getProducts()
    {
        $search = request('search', '');
        $category_id = request('category_id', 'all');
        $query = Product::with('category')
            ->where(function ($q) use ($search) {
                $q->whereLike('name', "%$search%");
            });

        if ($category_id !== 'all') {
            $query->where('category_id', $category_id);
        }

        return $query
            ->paginate(request('per_page', 10))
            ->withQueryString();
    }

    public function getCategoryOptions()
    {
        $options = Category::all()->map(function ($category) {
            return [
                'value' => $category->id,
                'label' => $category->name,
            ];
        });

        $options->prepend([
            'value' => 'all',
            'label' => 'Semua kategori',
        ]);

        return $options;
    }

     public function getDeletedMethod()
    {
        $search = request('search', '');

        return Product::onlyTrashed()
            ->whereLike('name', "%$search%")
            ->paginate(request('per_page', 10))
            ->withQueryString();
    }

   public function store(array $data)
    {
        $user = auth()->user();

        $purchasePrice = (float) $data['purchase_price'];
        $sellingPrice  = (float) $data['selling_price'];

        $expiredDate = $data['expired_date'] ?? null;
       
        return Product::create([
            'category_id'    => $data['category_id'],
            'name'           => $data['name'],
            'brand'          => $data['brand'],
            'purchase_price' => $purchasePrice,
            'selling_price'  => $sellingPrice,
            'minimum_stock'  => $data['minimum_stock'],
            'has_expired' => $expiredDate ? true : false,
            'expired_date'   => $expiredDate ?? null,
            'created_by'     => $user->id,
        ]);
    }

    public function update(Product $product, array $input)
    {
        $purchasePrice = (float) $input['purchase_price'];
        $sellingPrice  = (float) $input['selling_price'];
        $expiredDate = $input['expired_date'] ?? null;

        return $product->update([
            'category_id'    => $input['category_id'],
            'name'           => $input['name'],
            'brand'          => $input['brand'],
            'minimum_stock'  => $input['minimum_stock'],
            'purchase_price' => $purchasePrice,
            'selling_price'  => $sellingPrice,
            'has_expired' => $expiredDate ? true : false,
            'expired_date'   => $expiredDate ?? null,
            'updated_by'   => auth()->user()->id,
        ]);
    }

    public function delete(Product $product)
    {
        return $product->delete();
    }

    public function restore(int $id){
        $product = Product::withTrashed()->findOrFail($id);
        return $product->restore();
    }
}