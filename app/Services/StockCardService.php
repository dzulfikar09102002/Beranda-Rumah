<?php

namespace App\Services;

use App\Models\InventoryTransaction;
use App\Models\Product;
use Carbon\Carbon;

class StockCardService
{
    public function getStockCard()
    {
        $search = request('search');

        $startDate = request('start_date');
        $endDate = request('end_date');

        $startDate = $startDate
            ? Carbon::parse($startDate)->startOfDay()
            : null;

        $endDate = $endDate
            ? Carbon::parse($endDate)->endOfDay()
            : null;

        $query = Product::query()
            ->withTrashed()

            ->whereHas('inventoryTransactions')

            ->with([
                'inventoryTransactions' => function ($q) use ($startDate, $endDate) {

                    $q->with([
                        'createdBy',

                        // PURCHASE
                        'purchaseReference' => function ($q) {
                            $q->withTrashed()->with([
                                'supplier' => fn ($s) => $s->withTrashed(),
                                'product' => fn ($p) => $p->withTrashed(),
                            ]);
                        },

                        // SALE
                        'saleReference' => function ($q) {
                            $q->withTrashed()->with([
                                'saleTransaction' => fn ($st) => $st->withTrashed(),
                                'purchase.product' => fn ($p) => $p->withTrashed(),
                                'purchase.supplier' => fn ($s) => $s->withTrashed(),
                            ]);
                        },
                    ])

                    ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                    })

                    ->orderBy('created_at');
                }
            ])

            ->when($search, function ($q) use ($search) {
                $q->where(function ($product) use ($search) {
                    $product->where('name', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%");
                });
            })

            ->orderBy('name');

        $pagination = $query
            ->paginate(request('per_page', 10))
            ->withQueryString();

        $pagination->getCollection()->transform(function ($product) {

            $runningStock = 0;

            $product->inventoryTransactions->transform(function ($item) use (&$runningStock) {

                $qty = (float) $item->quantity;

                if ($item->type === 'in') {
                    $runningStock += $qty;
                } else {
                    $runningStock -= $qty;
                }

                $item->stock_balance = $runningStock;

                return $item;
            });

            return $product;
        });

        return [
            'pagination' => $pagination,
        ];
    }
}