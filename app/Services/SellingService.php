<?php

namespace App\Services;

use App\Models\CashLedger;
use App\Models\Category;
use App\Models\InventoryTransaction;
use App\Models\PaymentMethod;
use App\Models\Purchase;
use App\Models\PurchasingMethod;
use App\Models\SaleTransaction;
use App\Models\SaleTransactionDetail;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SellingService
{
    public function getProducts()
    {
        $search = request('search', '');
        $category_id = request('product_category_id', 'all');

        $stock = DB::table('inventory_transactions as it')
            ->selectRaw('
        it.product_id,
        it.selling_price,

        SUM(
            CASE
                WHEN it.type = "in" THEN it.quantity
                WHEN it.type = "out" THEN -it.quantity
                ELSE 0
            END
        ) as total_quantity
    ')
            ->whereNull('it.deleted_at')
            ->groupBy(
                'it.product_id',
                'it.selling_price'
            );

        $query = Purchase::query()

            ->with('product.category')

            ->when($search, function ($query) use ($search) {

                $query->where(function ($q) use ($search) {

                    $q->where('purchases.code', 'like', "%{$search}%")

                        ->orWhereHas('product', function ($q2) use ($search) {

                            $q2->where('name', 'like', "%{$search}%")
                                ->orWhere('brand', 'like', "%{$search}%");
                        });
                });
            })

            ->when($category_id !== 'all', function ($query) use ($category_id) {

                $query->whereHas('product', function ($q) use ($category_id) {

                    $q->where('category_id', $category_id);
                });
            })

            ->leftJoinSub($stock, 'stock', function ($join) {

                $join->on('stock.product_id', '=', 'purchases.product_id')

                    ->on('stock.selling_price', '=', 'purchases.selling_price');
            })

            ->selectRaw('
            MAX(purchases.id) as id,

            purchases.product_id,
            purchases.selling_price,

            MAX(purchases.code) as code,

            COALESCE(MAX(stock.total_quantity), 0) as total_quantity,

            MAX(purchases.purchase_price) as purchase_price,
            MAX(purchases.expired_date) as expired_date,
            MAX(purchases.purchase_date) as purchase_date,
            MAX(purchases.updated_at) as updated_at
        ')

            ->groupBy(
                'purchases.product_id',
                'purchases.selling_price'
            )

            ->orderByRaw('
            CASE
                WHEN COALESCE(MAX(stock.total_quantity), 0) > 0 THEN 0
                ELSE 1
            END
        ')

            ->orderByDesc('updated_at');

        return $query
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

    public function store(array $input)
    {
        return DB::transaction(function () use ($input) {

            $items = $input['items'] ?? [];
            $user = auth()->id();

            $grandTotal = collect($items)->sum(function ($item) {

                $subtotal = $item['quantity'] * $item['selling_price'];
                $discount = $item['discount'] ?? 0;

                return $subtotal - $discount;
            });

            $dateInput = Carbon::parse($input['transaction_date']);
            $now = now();

            $dateTime = $dateInput->isSameDay($now)
                ? $now
                : $dateInput->setTimeFrom($now);

            $sale = SaleTransaction::create([
                'invoice_number' => $this->generateInvoiceNumber($dateInput),
                'payment_status' => 'pending',
                'grand_total' => $grandTotal,
                'payment_type' => 'cash',
                'transaction_date' => $dateTime,
                'created_by' => $user,
                'updated_by' => $user,
            ]);

            foreach ($items as $item) {

                $remainingQty = (int) $item['quantity'];

                $totalQty = (int) $item['quantity'];

                $totalDiscount = (float) ($item['discount'] ?? 0);

                // diskon per qty
                $discountPerQty = $totalQty > 0
                    ? $totalDiscount / $totalQty
                    : 0;

                $purchases = Purchase::query()

                    ->where('product_id', $item['product_id'])

                    ->where('selling_price', $item['selling_price'])

                    ->whereNull('deleted_at')

                    ->orderBy('purchase_date', 'asc')
                    ->orderBy('id', 'asc')

                    ->get();

                foreach ($purchases as $purchase) {

                    $purchaseIn = InventoryTransaction::query()

                        ->where('reference_table', 'purchase')
                        ->where('reference_id', $purchase->id)
                        ->where('type', 'in')

                        ->sum('quantity');

                    $saleReturnIn = InventoryTransaction::query()

                        ->leftJoin(
                            'sale_transaction_details as std',
                            'std.id',
                            '=',
                            'inventory_transactions.reference_id'
                        )

                        ->where('inventory_transactions.reference_table', 'sale')
                        ->where('inventory_transactions.type', 'in')

                        ->where('std.purchase_id', $purchase->id)

                        ->sum('inventory_transactions.quantity');

                    $stockIn = $purchaseIn + $saleReturnIn;

                    // pembatalan purchase
                    $purchaseOut = InventoryTransaction::query()

                        ->where('reference_table', 'purchase')
                        ->where('reference_id', $purchase->id)
                        ->where('type', 'out')

                        ->sum('quantity');

                    // penjualan
                    $saleOut = InventoryTransaction::query()

                        ->leftJoin(
                            'sale_transaction_details as std',
                            'std.id',
                            '=',
                            'inventory_transactions.reference_id'
                        )

                        ->where('inventory_transactions.reference_table', 'sale')
                        ->where('inventory_transactions.type', 'out')

                        ->where('std.purchase_id', $purchase->id)

                        ->sum('inventory_transactions.quantity');

                    $stockOut = $purchaseOut + $saleOut;

                    $availableStock = $stockIn - $stockOut;

                    if ($availableStock <= 0) {
                        continue;
                    }

                    $takenQty = min($remainingQty, $availableStock);

                    $subtotal = $takenQty * $item['selling_price'];

                    $discountAmount = $takenQty * $discountPerQty;

                    $detail = SaleTransactionDetail::create([
                        'sale_transaction_id' => $sale->id,

                        'purchase_id' => $purchase->id,

                        'code' => $purchase->code,

                        'quantity' => $takenQty,

                        'purchase_price' => $purchase->purchase_price,

                        'selling_price' => $item['selling_price'],

                        'subtotal' => $subtotal,

                        'adjustment' => $discountAmount,

                        'created_by' => $user,
                        'updated_by' => $user,
                    ]);

                    InventoryTransaction::create([
                        'product_id' => $item['product_id'],

                        'purchase_id' => $purchase->id,

                        'type' => 'out',

                        'source' => 'sale',

                        'reference_id' => $detail->id,

                        'reference_table' => 'sale',

                        'quantity' => $takenQty,

                        'purchase_price' => $purchase->purchase_price,

                        'selling_price' => $item['selling_price'],

                        'note' => 'Penjualan barang FIFO',

                        'created_by' => $user,
                        'updated_by' => $user,
                    ]);

                    $remainingQty -= $takenQty;

                    if ($remainingQty <= 0) {
                        break;
                    }
                }
            }

            return $sale;
        });
    }

    private function generateInvoiceNumber(?string $date = null): string
    {
        $date = $date ? Carbon::parse($date) : now();

        $dateFormat = $date->format('Ymd');
        $prefix = $dateFormat.'/DWPSBY/';

        $last = SaleTransaction::withTrashed()
            ->whereDate('transaction_date', $date->toDateString())
            ->where('invoice_number', 'like', $prefix.'%')
            ->orderByDesc('id')
            ->value('invoice_number');

        $nextNumber = 1;

        if ($last) {
            $lastSequence = (int) substr($last, -4);
            $nextNumber = $lastSequence + 1;
        }

        $sequence = str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        return $prefix.$sequence;
    }

    public function getTransactionDetails(int $id)
    {
        $data = SaleTransactionDetail::with([
            'purchase.product',
        ])
            ->where('sale_transaction_id', $id)
            ->get();

        return $data
            ->groupBy(function ($item) {

                return implode('-', [
                    $item->purchase?->product?->id,
                    $item->purchase_price,
                    $item->selling_price,
                ]);
            })
            ->map(function ($items) {

                $first = $items->first();

                $first->quantity = $items->sum('quantity');

                $first->subtotal = $items->sum('subtotal');

                $first->adjustment = $items->sum('adjustment');

                return $first;
            })
            ->values();
    }

    public function getSaleTransaction(int $id)
    {
        return SaleTransaction::where('id', $id)
            ->where('payment_status', 'pending')
            ->firstOrFail();
    }

    public function getPaymentMethods()
    {
        return PaymentMethod::whereRaw('LOWER(kind) != ?', ['cash'])->get();
    }

    public function getPurchasingMethod()
    {
        return PurchasingMethod::all();
    }

    public function pay(SaleTransaction $sale, array $input): SaleTransaction
    {
        return DB::transaction(function () use ($sale, $input) {

            $sale = SaleTransaction::whereKey($sale->id)
                ->where('payment_status', 'pending')
                ->lockForUpdate()
                ->firstOrFail();
            $wasPartialPayment = $sale->total_amount > 0;
            $description = $wasPartialPayment
            ? 'PELUNASAN PENJUALAN '.$sale->invoice_number
            : 'PENJUALAN '.$sale->invoice_number;
            $total_amount = $sale->total_amount + $input['paid_amount'];
            $methodId = $input['purchase_method_id'];
            $isCancelMethod = $methodId > 2;
            $isPaid = $total_amount >= $sale->grand_total;
            $paymentType = $sale->payment_type;

            if ($sale->payment_type === 'cash' && ! $isPaid) {
                $paymentType = 'credit';
            }
            $sale->update([
                'payment_method_id' => $input['payment_method_id'] ?? null,
                'total_amount' => $total_amount,
                'change' => $input['change_amount'],
                'purchasing_method_id' => $methodId,
                'payment_type' => $isCancelMethod ? null : $paymentType,
                'payment_status' => $isCancelMethod
                    ? 'canceled'
                    : ($isPaid ? 'paid' : $sale->payment_status),
                'updated_by' => auth()->id(),
            ]);
            if ($isCancelMethod) {
                $sale->update([
                    'deleted_at' => now(),
                    'deleted_by' => auth()->id(),
                ]);
            }
            if ($isCancelMethod) {

                $sourceMap = [
                    4 => 'damage',
                    5 => 'expired',
                    6 => 'other',
                ];

                $newSource = $sourceMap[$methodId] ?? 'other';

                InventoryTransaction::where('source', 'sale')
                    ->whereIn('reference_id', function ($q) use ($sale) {
                        $q->select('id')
                            ->from('sale_transaction_details')
                            ->where('sale_transaction_id', $sale->id);
                    })
                    ->lockForUpdate()
                    ->get()
                    ->each(function ($inventory) use ($newSource, $input) {
                        $inventory->update([
                            'source' => $newSource,
                            'note' => $input['reason'] ?? null,
                            'updated_by' => auth()->id(),
                        ]);
                    });
            }

            if (! $isCancelMethod) {
                $paymentMethod = PaymentMethod::find($input['payment_method_id']);
                $cashFlowType = $paymentMethod && $paymentMethod->kind === 'Cash'
                    ? 'cash'
                    : 'bank';
                CashLedger::create([
                    'transaction_date' => $sale->transaction_date,
                    'type' => CashLedger::TYPE_IN,
                    'category' => CashLedger::CATEGORY_OPERATING,
                    'amount' => $input['paid_amount'] - $input['change_amount'],
                    'description' => $description,
                    'reference_table' => CashLedger::REF_SALE,
                    'cash_flow_type' => $cashFlowType,
                    'reference_id' => $sale->id,
                    'created_by' => auth()->id(),
                    'updated_by' => auth()->id(),
                ]);
            }

            return $sale->fresh();
        });
    }
}
