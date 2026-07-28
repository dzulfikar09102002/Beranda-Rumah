<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Services\DashboardService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Purchase;
use App\Models\SaleTransactionDetail;

class DashboardController extends Controller
{
    public function __construct(
        private DashboardService $service
    ) {}


    public function index()
    {
        $month = request('month', now()->month);
        $year = request('year', now()->year);
        return Inertia::render('dashboard', [
            'expiredProducts' => $this->service->getExpiredProducts($month, $year),
            'bestSellingProducts' => $this->service->getBestSellingProducts($month, $year),

            'income' => $this->service->getMonthlyIncome($month, $year),
            'expense' => $this->service->getMonthlyExpense($month, $year),
            'profit' => $this->service->getProfit($month, $year),
            'receivable' => $this->service->getReceivable($month, $year),
            'debt' => $this->service->getDebt($month, $year),

            'dailySales' => $this->service->getDailySalesChart($month, $year),

            'month' => (int) $month, 
            'year' => (int) $year,
        ]);
    }

    public function expiredDetail()
    {
        $search = request('search', '');
        $perPage = request('per_page', 10);

        $pagination = Product::query()
            ->with('category')
            ->whereNotNull('expired_date')
            ->when($search, function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('brand', 'like', "%{$search}%");
            })
            ->orderBy('expired_date', 'asc')
            ->paginate($perPage)
            ->withQueryString();

        return inertia('dashboard/expired-detail', [
            'pagination' => $pagination,
        ]);
    }

    public function bestSellingDetail()
    {
        $search = request('search', '');
        $perPage = request('per_page', 10);

        $pagination = SaleTransactionDetail::query()
            ->select('purchase_id', DB::raw('SUM(quantity) as total_sold'))
            ->with('purchase.product.category')
            ->whereHas('saleTransaction', function ($q) {
                $q->whereNull('deleted_at')
                ->where('payment_status', '!=', 'canceled');
            })
            ->when($search, function ($q) use ($search) {
                $q->whereHas('purchase.product', function ($q2) use ($search) {
                    $q2->where('name', 'like', "%{$search}%");
                });
            })
            ->groupBy('purchase_id')
            ->orderByDesc('total_sold')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('dashboard/best-selling-detail', [
            'pagination' => $pagination,
        ]);
    }

}
