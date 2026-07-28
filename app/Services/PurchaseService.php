<?php

namespace App\Services;

use App\Enums\InventorySource;
use App\Enums\InventoryType;
use App\Models\CashLedger;
use App\Models\Category;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class PurchaseService
{
    public function getProducts()
    {
        $search = request('search', '');
        $category_id = request('product_category_id', 'all');

        $query = Product::with('category')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%$search%")
                    ->orWhereHas('category', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%$search%");
                    });
                });
            });

        if ($category_id !== 'all') {
            $query->where('category_id', $category_id);
        }

        return $query
            ->orderByDesc('updated_at')
            ->paginate(request('per_page', 20))
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
    public function getSupplierOptions()
    {
        $options = Supplier::all()->map(function ($supplier) {
            return [
                'value' => $supplier->id,
                'label' => $supplier->name,
            ];
        });

        return $options;
    }

    public function store(array $input)
    {
        return DB::transaction(function () use ($input) {

            $items = $input['items'] ?? [];
            $createdPurchases = [];
            $user = auth()->id();
            foreach ($items as $item) {
                if($item['source'] == 'purchase')
                {
                    $total_payment = $item['purchase_price'] * $item['quantity'];
                    $status_payment = 'paid';
                    $payment_type = 'cash';
                }
                else if($item['source'] == 'consignment')
                {
                    $status_payment = 'pending';
                    $payment_type = 'credit';
                    $total_payment = 0;
                }
                else    
                {
                    $status_payment = 'paid';
                    $total_payment = 0;
                    $payment_type = 'free';
                }
                $purchase = Purchase::create([
                    'product_id'      => $item['product_id'],
                    'supplier_id'     => $item['supplier_id'] ?? null,
                    'code'            => $item['code'],
                    'year'            => $item['year'],
                    'quantity'        => $item['quantity'],
                    'purchase_price'  => $item['purchase_price'],
                    'selling_price'   => $item['selling_price'],
                    'purchase_date'   => $item['purchase_date'],
                    'payment_type'    => $payment_type,
                    'total_payment'   => $total_payment,
                    'status_payment'  => $status_payment,
                    'expired_date'    => $item['expired_date'] ?? null,
                    'created_by'      => $user,
                    'updated_by'      => $user,
                ]);
                $product = Product::find($item['product_id']);

                if (!empty($item['expired_date'])) {
                    $product->update([
                        'has_expired' => true,
                        'expired_date' => $item['expired_date'],
                    ]);
                }
                InventoryTransaction::create([
                    'product_id'      => $item['product_id'],
                    'type'            => 'in',
                    'source'          => $item['source'], 
                    'reference_id'    => $purchase->id, 
                    'reference_table' => 'purchase',
                    'quantity'        => $item['quantity'],
                    'purchase_price'  => $item['purchase_price'],
                    'selling_price'   => $item['selling_price'],
                    'note'            => 'Pembelian barang',
                    'created_by'      => $user,
                    'updated_by'      => $user,
                ]);

               if($total_payment > 0)
                {
                    $transactionDate = \Carbon\Carbon::parse($item['purchase_date'])
                    ->setTimeFrom(\Carbon\Carbon::now());
                    CashLedger::create([
                    'transaction_date' => $transactionDate,
                    'type'             => CashLedger::TYPE_OUT,
                    'category'         => CashLedger::CATEGORY_OPERATING,
                    'amount'           => $total_payment,
                    'description'      => 'PEMBELIAN ' . $purchase->product->name,
                    'reference_table'  => CashLedger::REF_PURCHASE,
                    'reference_id'     => $purchase->id,
                    'cash_flow_type'   => 'bank',
                    'created_by'       => $user,
                    'updated_by'       => $user,
                    ]);
                }
                $createdPurchases[] = $purchase;
            }

            return $createdPurchases;
        });
    }
    
    public function generateCode(int $productId, int $year, ?string $expiredDate): string
    {
        $product = Product::findOrFail($productId);
        if (!$product->has_expired) {
            $existing = Purchase::where('product_id', $productId)->first();

            if ($existing) {
                return $existing->code;
            }
        } else {
            $existing = Purchase::where('product_id', $productId)
                ->whereDate('expired_date', $expiredDate)
                ->first();

            if ($existing) {
                return $existing->code;
            }
        }
        $shortYear = substr($year, -2);
        $base = $shortYear . str_pad($productId, 4, '0', STR_PAD_LEFT);

        $lastCode = Purchase::where('product_id', $productId)
            ->where('code', 'like', $base . '%')
            ->orderByDesc('code')
            ->value('code');

        if (!$lastCode) {
            $sequence = '00001';
        } else {
            $lastSequence = (int) substr($lastCode, -5);
            $sequence = str_pad($lastSequence + 1, 5, '0', STR_PAD_LEFT);
        }

        return $base . $sequence;
    }
}