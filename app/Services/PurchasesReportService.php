<?php

namespace App\Services;

use App\Models\CashLedger;
use App\Models\InventoryTransaction;
use App\Models\Product;
use App\Models\Purchase;
use App\Models\SaleTransactionDetail;
use App\Models\Supplier;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PurchasesReportService
{
    public function getPurchases()
    {
        $search = request('search', '');
        $startDate = request('start_date');
        $endDate   = request('end_date');

        return Purchase::with(['product', 'supplier', 'inventoryTransactions'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('purchases.code', 'like', "%{$search}%")
                        ->orWhereHas('product', function ($q2) use ($search) {
                            $q2->where('name', 'like', "%{$search}%");
                        })
                        ->orWhereHas('supplier', function ($q2) use ($search) {
                            $q2->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('purchase_date', [$startDate, $endDate]);
            })

            ->orderByRaw("
                CASE 
                    WHEN status_payment = 'canceled' THEN 1
                    ELSE 0
                END
            ")
            ->orderByDesc('updated_at')
            ->orderByDesc('created_at')
            ->where('status_payment', '!=', 'canceled')
            ->paginate(request('per_page', 10))
            ->withQueryString();
    }

    public function getTotalPurchase(): float
    {
        $startDate = request('start_date');
        $endDate   = request('end_date');

        return (float) Purchase::query()
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('purchase_date', [$startDate, $endDate]);
            })
            ->where('status_payment', '!=', 'canceled')
            ->sum('total_payment');
    }
    public function getDeletedMethod()
    {
        $search = request('search', '');

        $startDate = request('start_date');
        $endDate   = request('end_date');

        return Purchase::onlyTrashed()
            ->with(['product', 'supplier', 'inventoryTransactions'])

            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereHas('product', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('supplier', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    });
                });
            })

            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('purchase_date', [$startDate, $endDate]);
            })

            ->paginate(request('per_page', 10))
            ->withQueryString();
    }

    public function delete(Purchase $purchasereport)
{
    DB::transaction(function () use ($purchasereport) {

        $reason = request('reason');
        $transactionDate = Carbon::parse($purchasereport['purchase_date'])
            ->setTimeFrom(now());
        $purchasereport->update([
            'status_payment' => 'canceled',
            'updated_by'     => auth()->id(),
            'deleted_by'     => auth()->id(),
        ]);

        $purchasereport->delete();

        InventoryTransaction::create([
            'product_id'      => $purchasereport->product_id,
            'type'            => 'out',
            'source'          => 'return',
            'reference_id'    => $purchasereport->id,
            'reference_table' => 'purchase',
            'quantity'        => $purchasereport->quantity,
            'purchase_price'  => $purchasereport->purchase_price ?? 0,
            'selling_price'   => $purchasereport->selling_price ?? 0,
            'note'            => $reason ?: 'Purchase dibatalkan',
            'created_by'      => auth()->id(),
        ]);

            CashLedger::create([
                'transaction_date' => $transactionDate,
                'type' => CashLedger::TYPE_IN, 
                'category' => CashLedger::CATEGORY_ADJUSTMENT,
                'amount' => $purchasereport->total_payment,
                'description' => 'PEMBATALAN PEMBELIAN ' . $purchasereport->product->name,
                'reference_table' => CashLedger::REF_PURCHASE,
                'reference_id' => $purchasereport->id,
                'created_by' => auth()->id(),
                'updated_by' => auth()->id(),
            ]);
    });

    return back();
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
    public function getRemaining(int $purchaseId): int
    {
        $saleDetailIds = SaleTransactionDetail::where(
            'purchase_id',
            $purchaseId
        )->pluck('id');

        return (int) InventoryTransaction::where(function ($q) use ($purchaseId, $saleDetailIds) {

            $q->where(function ($q) use ($purchaseId) {
                $q->where('reference_table','purchase')
                ->where('reference_id',$purchaseId);
            });

            if ($saleDetailIds->isNotEmpty()) {
                $q->orWhere(function ($q) use ($saleDetailIds) {
                    $q->where('reference_table','sale')
                    ->whereIn('reference_id',$saleDetailIds);
                });
            }

        })
        ->whereNull('deleted_at')
        ->selectRaw("
            COALESCE(SUM(
                CASE
                    WHEN type='in' THEN quantity
                    WHEN type='out' THEN -quantity
                END
            ),0) as remaining
        ")
        ->value('remaining');
    }
    public function update(Purchase $purchase, array $item)
    {
        return DB::transaction(function () use ($purchase, $item) {

            $user = auth()->id();

            $hasTransaction = SaleTransactionDetail::where(
                'purchase_id',
                $purchase->id
            )->exists();
            $oldSource = InventoryTransaction::where('reference_table', 'purchase')
                ->where('reference_id', $purchase->id)
                ->where('type', 'in')
                ->value('source');

            $oldPurchasePrice = $purchase->purchase_price;
            $oldSellingPrice  = $purchase->selling_price;

            $newPurchasePrice = $item['purchase_price'];
            $newSellingPrice  = $item['selling_price'];

            $qty = $item['quantity'] ?? $purchase->quantity;

            $priceChanged =
                $oldPurchasePrice != $newPurchasePrice ||
                $oldSellingPrice != $newSellingPrice;

            if ($item['source'] == 'purchase') {
                $total_payment = $newPurchasePrice * $qty;
                $status_payment = 'paid';
                $payment_type = 'cash';
            } elseif ($item['source'] == 'consignment') {
                $total_payment = 0;
                $status_payment = 'pending';
                $payment_type = 'credit';
            } else {
                $total_payment = 0;
                $status_payment = 'paid';
                $payment_type = 'free';
            }

            if (!$hasTransaction) {

                $purchase->update([
                    'supplier_id'     => $item['supplier_id'] ?? null,
                    'code'            => $item['code'],
                    'year'            => $item['year'],
                    'quantity'        => $qty,
                    'purchase_price'  => $newPurchasePrice,
                    'selling_price'   => $newSellingPrice,
                    'purchase_date'   => $item['purchase_date'],
                    'expired_date'    => $item['expired_date'] ?? null,
                    'updated_by'      => $user,
                ]);

                InventoryTransaction::where('reference_table','purchase')
                    ->where('reference_id',$purchase->id)
                    ->where('type','in')
                    ->update([
                        'source'         => $item['source'],
                        'quantity'       => $qty,
                        'purchase_price' => $newPurchasePrice,
                        'selling_price'  => $newSellingPrice,
                        'updated_by'     => $user,
                        'updated_at'     => now(),
                    ]);
            } else {

                $remaining = $this->getRemaining($purchase->id);

                if ($priceChanged && $remaining > 0) {
                    InventoryTransaction::create([
                        'product_id'       => $purchase->product_id,
                        'type'             => 'out',
                        'source'           => 'adjustment',
                        'reference_table'  => 'purchase',
                        'reference_id'     => $purchase->id,
                        'quantity'         => $remaining,
                        'purchase_price'   => $oldPurchasePrice,
                        'selling_price'    => $oldSellingPrice,
                        'note'             => 'Cost revaluation out',
                        'created_by'       => $user,
                    ]);

                    InventoryTransaction::create([
                        'product_id'       => $purchase->product_id,
                        'type'             => 'in',
                        'source'           => 'adjustment',
                        'reference_table'  => 'purchase',
                        'reference_id'     => $purchase->id,
                        'quantity'         => $remaining,
                        'purchase_price'   => $newPurchasePrice,
                        'selling_price'    => $newSellingPrice,
                        'note'             => 'Cost revaluation in',
                        'created_by'       => $user,
                    ]);
                }

                InventoryTransaction::where('reference_table','purchase')
                    ->where('reference_id',$purchase->id)
                    ->where('type','in')
                    ->update([
                        'source'     => $item['source'],
                        'updated_by' => $user,
                        'updated_at' => now(),
                    ]);

                $purchase->update([
                    'supplier_id'     => $item['supplier_id'] ?? null,
                    'code'            => $item['code'],
                    'year'            => $item['year'],
                    'purchase_price'  => $newPurchasePrice,
                    'selling_price'   => $newSellingPrice,
                    'purchase_date'   => $item['purchase_date'],
                    'expired_date'    => $item['expired_date'] ?? null,
                    'updated_by'      => $user,
                ]);
            }

            $product = Product::find($purchase->product_id);
            $latestPurchase = Purchase::where('product_id', $purchase->product_id)
                ->latest('purchase_date')
                ->latest('id')
                ->first();

            if ($product && $latestPurchase) {
                $product->update([
                    'purchase_price' => $latestPurchase->purchase_price,
                    'selling_price'  => $latestPurchase->selling_price,
                    'has_expired'    => !empty($item['expired_date']),
                    'expired_date'   => $item['expired_date'] ?? null,
                ]);
            }

            $oldTotal = $oldPurchasePrice * $purchase->quantity;
            $newTotal = $newPurchasePrice * $qty;
            $diff = $newTotal - $oldTotal;
            $transactionDate = Carbon::parse($item['purchase_date'])
            ->setTimeFrom(now());
            if ($diff < 0) {
                CashLedger::create([
                    'transaction_date' => $transactionDate,
                    'type' => CashLedger::TYPE_IN,
                    'category' => CashLedger::CATEGORY_ADJUSTMENT,
                    'amount' => abs($diff),
                    'description' => 'PENGEMBALIAN MODAL ' . $purchase->product->name,
                    'reference_table' => CashLedger::REF_PURCHASE,
                    'reference_id' => $purchase->id,
                    'created_by' => $user,
                    'updated_by' => $user,
                ]);
            } elseif ($diff > 0) {
                CashLedger::create([
                    'transaction_date' => $transactionDate,
                    'type' => CashLedger::TYPE_OUT,
                    'category' => CashLedger::CATEGORY_ADJUSTMENT,
                    'amount' => $diff,
                    'description' => 'TAMBAHAN MODAL ' . $purchase->product->name,
                    'reference_table' => CashLedger::REF_PURCHASE,
                    'reference_id' => $purchase->id,
                    'created_by' => $user,
                    'updated_by' => $user,
                ]);
            }

            $newSource = $item['source'];
            $sourceAmount = $newPurchasePrice * $qty;

            if ($oldSource !== $newSource) {

                $oldIsPurchase = $oldSource === 'purchase';
                $newIsPurchase = $newSource === 'purchase';

                if ($oldSource !== $newSource) {

                    if ($oldIsPurchase && !$newIsPurchase) {
                        CashLedger::create([
                            'transaction_date' => $transactionDate,
                            'type' => CashLedger::TYPE_IN,
                            'category' => CashLedger::CATEGORY_ADJUSTMENT,
                            'amount' => $sourceAmount,
                            'description' => 'KOREKSI MODAL PERUBAHAN SUMBER '.$purchase->product->name,
                            'reference_table' => CashLedger::REF_PURCHASE,
                            'reference_id' => $purchase->id,
                            'created_by' => $user,
                            'updated_by' => $user,
                        ]);
                    }

                    if (!$oldIsPurchase && $newIsPurchase) {
                        CashLedger::create([
                            'transaction_date' => $transactionDate,
                            'type' => CashLedger::TYPE_OUT,
                            'category' => CashLedger::CATEGORY_ADJUSTMENT,
                            'amount' => $sourceAmount,
                            'description' => 'TAMBAHAN MODAL PERUBAHAN SUMBER '.$purchase->product->name,
                            'reference_table' => CashLedger::REF_PURCHASE,
                            'reference_id' => $purchase->id,
                            'created_by' => $user,
                            'updated_by' => $user,
                        ]);
                    }
                }
            }

            $purchase->update([
                'total_payment'  => $total_payment,
                'status_payment' => $status_payment,
                'payment_type'   => $payment_type,
            ]);

            return back();
        });
    }

    public function pay(Purchase $purchase, array $input): Purchase
    {
        return DB::transaction(function () use ($purchase, $input) {
            
            $purchase = Purchase::whereKey($purchase->id)
            ->where('status_payment', '!=', 'paid')
            ->lockForUpdate()
            ->firstOrFail();
            
            $transactionDate = Carbon::parse($purchase['purchase_date'])
                ->setTimeFrom(now());
            $orderTotal = $purchase->purchase_price * $purchase->quantity;

            $payAmount = (float) ($input['total_payment'] ?? 0);

            $alreadyPaid = (float) ($purchase->total_payment ?? 0);

            $wasPartialPayment = $alreadyPaid > 0;

            $newPaid = $alreadyPaid + $payAmount;

            if ($newPaid > $orderTotal) {
                $newPaid = $orderTotal;
            }

            $remaining = $orderTotal - $newPaid;

            $purchase->update([
                'total_payment'   => $newPaid,
                'status_payment'  => $remaining == 0 ? 'paid' : 'pending',
                'updated_by'      => auth()->id(),
            ]);

            if ($payAmount > 0) {

                $description = $wasPartialPayment
                    ? 'PELUNASAN UTANG ' . $purchase->product->name
                    : 'PEMBAYARAN UTANG ' . $purchase->product->name;

                CashLedger::create([
                    'transaction_date' => $transactionDate,
                    'type'             => CashLedger::TYPE_OUT,
                    'category'         => CashLedger::CATEGORY_OPERATING,
                    'amount'           => $payAmount,
                    'description'      => $description,
                    'reference_table'  => CashLedger::REF_PURCHASE,
                    'cash_flow_type'   => 'bank',
                    'reference_id'     => $purchase->id,
                    'created_by'       => auth()->id(),
                    'updated_by'       => auth()->id(),
                ]);
            }

            return $purchase->fresh();
        });
    }
}