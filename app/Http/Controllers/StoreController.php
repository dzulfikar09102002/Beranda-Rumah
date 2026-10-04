<?php

namespace App\Http\Controllers;

use App\Services\StoreService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function __construct(
        private StoreService $service
    ) {}

    public function index()
    {
        $categories = $this->service->getCategories();

        return Inertia::render('store/index', [
            'store' => $this->service->getStore(),
            'featured' => $this->service->getFeatured(),
            'categories' => $categories,
            'productCount' => $categories->sum('count'),
            'minPrice' => $this->service->getMinPrice(),
            'initialPage' => $this->service->paginate(),
        ]);
    }

    public function products(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'integer'],
            'sort' => ['nullable', Rule::in(StoreService::SORTS)],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        return response()->json($this->service->paginate(
            $validated['search'] ?? null,
            isset($validated['category']) ? (int) $validated['category'] : null,
            $validated['sort'] ?? 'popular',
        ));
    }
}
