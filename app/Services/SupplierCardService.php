<?php

namespace App\Services;

use App\Models\Purchase;
use App\Models\SaleTransactionDetail;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class SupplierCardService
{
    public function getSupplierCards(): LengthAwarePaginator
    {
        $data = $this->queryData();

        $perPage = request('per_page', 10);

        $currentPage = LengthAwarePaginator::resolveCurrentPage();

        $items = $data
            ->slice(($currentPage - 1) * $perPage, $perPage)
            ->values();

        return new LengthAwarePaginator(
            $items,
            $data->count(),
            $perPage,
            $currentPage,
            [
                'path' => request()->url(),
                'query' => request()->query(),
            ]
        );
    }

    public function getTotalMasuk(): float
    {
        return $this->queryData()->sum('total_masuk');
    }

    public function getTotalKeluar(): float
    {
        return $this->queryData()->sum('total_keluar');
    }

    public function getTotalLakuPaid(): float
    {
        return $this->queryData()->sum('total_laku_paid');
    }

    public function getTotalHutang(): float
    {
        return $this->queryData()->sum('total_hutang');
    }
    private function queryData(): Collection
    {
        $search = request('search');

        $source = request('source');

        $paymentStatus = request('payment_status');

        $purchases = Purchase::query()

            ->with([
                'supplier',

                'product',

                'inventoryTransactions',
            ])

            ->whereNull('deleted_at')

            ->when($search, function ($query) use ($search) {

                $query->where(function ($q) use ($search) {

                    $q->where('code', 'like', "%{$search}%")

                        ->orWhereHas('supplier', function ($supplier) use ($search) {

                            $supplier->where(
                                'name',
                                'like',
                                "%{$search}%"
                            );
                        })

                        ->orWhereHas('product', function ($product) use ($search) {

                            $product->where(
                                'name',
                                'like',
                                "%{$search}%"
                            );
                        });
                });
            })

            ->when($source, function ($query) use ($source) {

                $query->whereHas(
                    'inventoryTransactions',
                    function ($q) use ($source) {

                        if ($source === 'other') {

                            $q->whereNotIn('source', [
                                'purchase',
                                'consignment',
                            ]);

                            return;
                        }

                        $q->where('source', $source);
                    }
                );
            })

            ->latest()

            ->get();

        $rows = collect();

        foreach ($purchases as $purchase) {

            $inventory = $purchase->inventoryTransactions->first();

            if (!$inventory) {
                continue;
            }

            $barangMasuk = (float) $inventory->quantity;

            $paidQty = 0;

            $unpaidQty = 0;

            $keluarQty = 0;

            $saleDetails = SaleTransactionDetail::query()

                ->withTrashed()

                ->with('saleTransaction')

                ->where('purchase_id', $purchase->id)

                ->get();

            foreach ($saleDetails as $detail) {

                $sale = $detail->saleTransaction;

                if (!$sale) {
                    continue;
                }

                $qty = (float) $detail->quantity;

                if (
                    $sale->payment_status !== 'canceled'
                    || !is_null($sale->deleted_at)
                ) {
                    $keluarQty += $qty;
                }
                
                if ($sale->payment_status === 'paid') {
                    $paidQty += $qty;
                }

                if ($sale->payment_status === 'pending') {
                    $unpaidQty += $qty;
                }
            }

            if (
                $paymentStatus === 'paid'
                && $paidQty <= 0
            ) {
                continue;
            }

            if (
                in_array($paymentStatus, [
                    'pending',
                    'partial',
                    'unpaid',
                ])
                && $unpaidQty <= 0
            ) {
                continue;
            }

            $purchasePrice = (float) $inventory->purchase_price;

            $rows->push([

                'supplier_id' => $purchase->supplier?->id ?? 0,

                'supplier_name' => $purchase->supplier?->name ?? 'TANPA SUPPLIER',

                'product_id' => $purchase->product?->id,

                'product_name' => $purchase->product?->name,

                'source' => $inventory->source,

                'barang_masuk' => $barangMasuk,

                'barang_keluar' => $keluarQty,

                'laku_paid' => $paidQty,

                'harga_beli' => $purchasePrice,

                'hutang' => $inventory->source === 'consignment'
                    ? ($paidQty * $purchasePrice)
                    : 0,
            ]);
        }

        return $rows

            ->groupBy('supplier_id')

            ->map(function ($supplierItems, $supplierId) {

                $firstSupplier = $supplierItems->first();

                $products = $supplierItems

                    ->groupBy(function ($item) {

                        return implode('|', [

                            $item['product_id'],

                            $item['source'],

                            $item['harga_beli'],
                        ]);
                    })

                    ->map(function ($productItems) {

                        $firstProduct = $productItems->first();

                        return [

                            'product_id' => $firstProduct['product_id'],

                            'product_name' => $firstProduct['product_name'],

                            'source' => $firstProduct['source'],

                            'barang_masuk' => $productItems->sum('barang_masuk'),

                            'barang_keluar' => $productItems->sum('barang_keluar'),

                            'laku_paid' => $productItems->sum('laku_paid'),

                            'harga_beli' => $firstProduct['harga_beli'],

                            'hutang' => $productItems->sum('hutang'),
                        ];
                    })

                    ->sortBy([
                        ['source', 'asc'],
                        ['product_name', 'asc'],
                    ])

                    ->values();

                return [

                    'supplier_id' => $supplierId,

                    'supplier_name' => $firstSupplier['supplier_name'],

                    'total_masuk' => $products->sum('barang_masuk'),

                    'total_keluar' => $products->sum('barang_keluar'),

                    'total_laku_paid' => $products->sum('laku_paid'),

                    'total_hutang' => $products->sum('hutang'),

                    'products' => $products,
                ];
            })

            ->sortByDesc('total_hutang')

            ->values();
    }
}