<?php 

namespace App\Services;

use App\Models\CashLedger;
use App\Models\InventoryTransaction;
use App\Models\SaleTransaction;
use App\Models\SaleTransactionDetail;
use App\Models\PaymentMethod;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
class SalesReportService
{
    
    public function getSalesReport()
    {
        $search = request('search', '');
        $payment_method_id = request('payment_method_id', 'all');

        $startDate = request('start_date');
        $endDate   = request('end_date');

        $startDate = $startDate
            ? Carbon::parse($startDate)->startOfDay()
            : null;

        $endDate = $endDate
            ? Carbon::parse($endDate)->endOfDay()
            : null;

        $query = SaleTransaction::with(
            'paymentMethod',
            'groupedDetails.purchase.product',
            'purchasingMethod'
        )
        ->withSum(
            'details as total_revenue',
            \DB::raw('(quantity * selling_price) - COALESCE(adjustment,0)')
        )
        ->withSum(
            'details as total_cost',
            \DB::raw('quantity * purchase_price')
        )
        ->when($search, function ($query) use ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('details.purchase.product', function ($product) use ($search) {
                        $product->where('name', 'like', "%{$search}%")
                                ->orWhere('code', 'like', "%{$search}%");
                    });
            });
        })
        ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
            $q->whereBetween('transaction_date', [$startDate, $endDate]);
        })
        ->when($payment_method_id !== 'all', function ($q) use ($payment_method_id) {
            $q->where('payment_method_id', $payment_method_id);
        });

        $profitSummaryQuery = clone $query;

        $totalProfit = $profitSummaryQuery
            ->where('payment_status', 'paid')
            ->get()
            ->sum(fn ($item) => ($item->total_revenue ?? 0) - ($item->total_cost ?? 0));

        $totalSelling = (clone $query)
            ->where('payment_status', 'paid')
            ->get()
            ->sum(fn ($item) => $item->total_revenue ?? 0);

        $data = $query
            ->where('payment_status', '!=', 'canceled')
            ->orderByDesc('transaction_date')
            ->paginate(request('per_page', 10))
            ->withQueryString();

        $data->getCollection()->transform(function ($item) {
            $profit = ($item->total_revenue ?? 0) - ($item->total_cost ?? 0);
            $item->profit = $item->payment_status === 'paid' ? $profit : 0;
            return $item;
        });

        return [
            'data' => $data,
            'total_profit' => $totalProfit,
            'total_selling' => $totalSelling,
        ];
    }

public function getDetailSalesReport(int $id)
{
    $query = SaleTransactionDetail::with([
        'purchase' => function ($q) {
            $q->withTrashed()->with([
                'product' => function ($q2) {
                    $q2->withTrashed();
                },
                'supplier' => function ($q2) {
                    $q2->withTrashed();
                }
            ]);
        },
        'returnTransaction'
    ])
    ->where('sale_transaction_id', $id);

    $data = $query
        ->paginate(request('per_page', 10))
        ->withQueryString();

    $grouped = $data->getCollection()
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

    $data->setCollection($grouped);

    return $data;
}
    public function cancel(int $id)
    {
        return DB::transaction(function () use ($id) {

            $invoice = SaleTransaction::with('details.purchase', 'paymentMethod')->findOrFail($id);

            $reason = request('reason');

            $invoice->update([
                'payment_status' => 'canceled',
                'updated_by'     => auth()->id(),
            ]);

            foreach ($invoice->details as $detail) {

                if (!$detail->purchase) {
                    throw new \Exception("Produk tidak ditemukan untuk detail ID: {$detail->id}");
                }
                InventoryTransaction::create([
                    'product_id'      => $detail->purchase->product_id,
                    'type'            => 'in',
                    'source'          => 'return',
                    'reference_id'    => $detail->id,
                    'reference_table' => 'sale',
                    'quantity'        => $detail->quantity,
                    'purchase_price'  => $detail->purchase->purchase_price ?? 0,
                    'selling_price'   => $detail->selling_price ?? 0,
                    'note'            => $reason
                        ? "Return: {$reason}"
                        : 'Transaksi dibatalkan (return)',
                    'created_by'      => auth()->id(),
                ]);
            }

            $totalPaid = $invoice->total_amount - $invoice->change;
            if ($totalPaid > 0) {
                $cashFlowType = strtolower($invoice->paymentMethod?->kind ?? '') === 'cash'
                ? 'cash'
                : 'bank';
                CashLedger::create([
                    'transaction_date' => $invoice->transaction_date,
                    'type'             => CashLedger::TYPE_OUT,
                    'category'         => CashLedger::CATEGORY_ADJUSTMENT,
                    'amount'           => $totalPaid,
                    'description'      => 'PEMBATALAN PENJUALAN INVOICE' . $invoice->invoice_number,
                    'reference_table'  => CashLedger::REF_SALE,
                    'cash_flow_type'   => $cashFlowType,
                    'reference_id'     => $invoice->id,
                    'created_by'       => auth()->id(),
                    'updated_by'       => auth()->id(),
                ]);
            }
            return true;
        });
    }

    public function getCanceledMethod()
    {
        $search = request('search', '');
        $startDate = request('start_date');
        $endDate   = request('end_date');

        $startDate = $startDate
            ? Carbon::parse($startDate)->startOfDay()
            : null;

        $endDate = $endDate
            ? Carbon::parse($endDate)->endOfDay()
            : null;

        $data = SaleTransaction::with([
                'paymentMethod',
                'groupedDetails' => function ($q) {
                    $q->with([
                        'purchase' => function ($q2) {
                            $q2->withTrashed()->with([
                                'product' => function ($q3) {
                                    $q3->withTrashed();
                                }
                            ]);
                        }
                    ]);
                },
                'details.inventoryTransactions',
                'purchasingMethod'
            ])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('details.purchase.product', function ($product) use ($search) {
                            $product->where('name', 'like', "%{$search}%")
                                    ->orWhere('code', 'like', "%{$search}%");
                        });
                });
            })
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('transaction_date', [$startDate, $endDate]);
            })
            ->where('payment_status', 'canceled')
            ->orderByDesc('transaction_date')
            ->paginate(request('per_page', 10))
            ->withQueryString();

        $data->getCollection()->transform(function ($item) {
            $item->reason = optional(
                $item->details
                    ->flatMap(fn ($d) => $d->inventoryTransactions)
                    ->first()
            )->note;

            return $item;
        });

        return $data;
    }

    public function getDeletedMethod()
    {
        $search = request('search', '');
        $startDate = request('start_date');
        $endDate   = request('end_date');

         $startDate = $startDate
            ? Carbon::parse($startDate)->startOfDay()
            : null;

        $endDate = $endDate
            ? Carbon::parse($endDate)->endOfDay()
            : null;

        $data = SaleTransaction::onlyTrashed()
            ->with([
                'paymentMethod',
                'groupedDetails' => function ($q) {
                    $q->with([
                        'purchase' => function ($q2) {
                            $q2->withTrashed()->with([
                                'product' => function ($q3) {
                                    $q3->withTrashed();
                                }
                            ]);
                        }
                    ]);
                },
                'details.inventoryTransactions',
                'purchasingMethod'
            ])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('invoice_number', 'like', "%{$search}%")
                        ->orWhereHas('details.purchase.product', function ($product) use ($search) {
                            $product->where('name', 'like', "%{$search}%")
                                    ->orWhere('code', 'like', "%{$search}%");
                        });
                });
            })
            ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                $q->whereBetween('transaction_date', [$startDate, $endDate]);
            })
            ->orderByDesc('transaction_date')
            ->paginate(request('per_page', 10))
            ->withQueryString();

        $data->getCollection()->transform(function ($item) {
            $item->reason = optional(
                $item->details
                    ->flatMap(fn ($d) => $d->inventoryTransactions)
                    ->first()
            )->note;

            return $item;
        });

        return $data;
    }

     public function delete(SaleTransaction $salereport)
    {
        return $salereport->delete();
    }

    public function restore(int $id){
        $salereport = SaleTransaction::withTrashed()->findOrFail($id);
        return $salereport->restore();
    }

    public function getSaleTransaction(int $id): SaleTransaction
    {
        return SaleTransaction::where('id', $id)
            ->where('payment_status', 'pending') // hanya bisa dilunasi kalau pending
            ->firstOrFail();
    }

    public function getTransactionDetails(int $id)
    {
        return SaleTransactionDetail::with([
            'purchase.product'
        ])
        ->where('sale_transaction_id', $id)
        ->get();
    }

    public function getPaymentMethods()
    {
        return PaymentMethod::whereRaw('LOWER(kind) != ?', ['cash'])->get();
    }
}