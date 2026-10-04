<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StoreService
{
    public const array SORTS = ['popular', 'name', 'cheap', 'expensive'];

    public const int PER_PAGE = 12;

    private ?array $bestSellerIds = null;

    public function paginate(
        ?string $search = null,
        ?int $categoryId = null,
        string $sort = 'popular',
        int $perPage = self::PER_PAGE,
    ): LengthAwarePaginator {
        $query = $this->baseQuery();

        if ($search !== null && trim($search) !== '') {
            $term = '%'.trim($search).'%';
            $query->where(fn (Builder $q) => $q
                ->where('products.name', 'like', $term)
                ->orWhere('products.brand', 'like', $term)
                ->orWhere('c.name', 'like', $term));
        }

        if ($categoryId) {
            $query->where('products.category_id', $categoryId);
        }

        // In-stock products always come first.
        $query->orderByRaw('CASE WHEN COALESCE(s.stock, 0) > 0 THEN 0 ELSE 1 END');

        match ($sort) {
            'cheap' => $query->orderBy('products.selling_price'),
            'expensive' => $query->orderByDesc('products.selling_price'),
            'name' => $query->orderBy('products.name'),
            default => $query->orderByDesc('sold')->orderBy('products.name'),
        };

        return $query
            ->orderBy('products.id')
            ->paginate($perPage)
            ->through(fn (Product $product) => $this->present($product));
    }

    public function getFeatured(int $limit = 6): Collection
    {
        return $this->baseQuery()
            ->whereRaw('COALESCE(s.stock, 0) > 0')
            ->orderByDesc('sold')
            ->orderBy('products.name')
            ->limit($limit)
            ->get()
            ->map(fn (Product $product) => $this->present($product));
    }

    public function getMinPrice(): ?float
    {
        $price = $this->baseQuery()
            ->whereRaw('COALESCE(s.stock, 0) > 0')
            ->min('products.selling_price');

        return $price === null ? null : (float) $price;
    }

    public function getCategories(): Collection
    {
        return Category::query()
            ->join('products as p', 'p.category_id', '=', 'categories.id')
            ->whereNull('p.deleted_at')
            ->where('p.selling_price', '>', 0)
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('count')
            ->get(['categories.id', 'categories.name', DB::raw('COUNT(p.id) as count')])
            ->map(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'count' => (int) $category->count,
            ]);
    }

    public function getStore(): array
    {
        $settings = Setting::whereIn('property', [
            SellingService::BRAND_NAME,
            SellingService::BRAND_PHONE,
            'BRAND_ADDRESS',
            'BRAND_LOCATION',
            'BRAND_INVOICE_CODE',
        ])->pluck('value', 'property');

        return [
            'name' => $settings[SellingService::BRAND_NAME] ?? config('app.name'),
            'phone' => $settings[SellingService::BRAND_PHONE] ?? null,
            'whatsapp' => $this->toWhatsappNumber($settings[SellingService::BRAND_PHONE] ?? null),
            'address' => $settings['BRAND_ADDRESS'] ?? null,
            'location' => $settings['BRAND_LOCATION'] ?? null,
            'order_prefix' => $settings['BRAND_INVOICE_CODE'] ?? 'ORD',
        ];
    }

    private function baseQuery(): Builder
    {
        return Product::query()
            ->leftJoin('categories as c', 'c.id', '=', 'products.category_id')
            ->leftJoin('product_stocks as s', 's.id', '=', 'products.id')
            ->leftJoinSub($this->soldQuery(), 'sold', 'sold.product_id', '=', 'products.id')
            ->whereNull('c.deleted_at')
            ->where('products.selling_price', '>', 0)
            ->select([
                'products.id',
                'products.name',
                'products.brand',
                'products.selling_price',
                'products.url_image',
                'products.category_id',
                'c.name as category_name',
                DB::raw('COALESCE(s.stock, 0) as stock'),
                DB::raw('COALESCE(sold.total_sold, 0) as sold'),
            ]);
    }

    private function soldQuery()
    {
        return DB::table('sale_transaction_details as d')
            ->join('purchases as p', 'p.id', '=', 'd.purchase_id')
            ->join('sale_transactions as t', 't.id', '=', 'd.sale_transaction_id')
            ->whereNull('d.deleted_at')
            ->whereNull('t.deleted_at')
            ->where('t.payment_status', '!=', 'canceled')
            ->groupBy('p.product_id')
            ->select('p.product_id', DB::raw('SUM(d.quantity) as total_sold'));
    }

    private function bestSellerIds(): array
    {
        return $this->bestSellerIds ??= $this->soldQuery()
            ->orderByDesc('total_sold')
            ->limit(8)
            ->pluck('p.product_id')
            ->all();
    }

    private function present(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'brand' => $product->brand,
            'price' => (float) $product->selling_price,
            'image' => $product->url_image ?: null,
            'category_id' => $product->category_id,
            'category' => $product->category_name,
            'stock' => max(0, (int) $product->stock),
            'sold' => (int) $product->sold,
            'best_seller' => $product->sold > 0 && in_array($product->id, $this->bestSellerIds()),
        ];
    }

    private function toWhatsappNumber(?string $phone): ?string
    {
        $digits = preg_replace('/\D/', '', (string) $phone);

        if ($digits === '') {
            return null;
        }

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        return str_starts_with($digits, '62') ? $digits : '62'.$digits;
    }
}
