<?php

use App\Http\Controllers\CashLedgerController;
use App\Http\Controllers\PaymentMethodController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\SalesSummaryController;
use App\Http\Controllers\SellingController;
use App\Http\Controllers\StockCardController;
use App\Http\Controllers\SupplierCardController;
use App\Http\Controllers\SupplierTransactionsController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\SalesReportController;
use App\Http\Controllers\PurchasesReportController;
use App\Http\Controllers\StockReportController;
use App\Http\Controllers\LabaRugiController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PurchaseMethodController;
use App\Exports\StockReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
   Route::get('/dashboard', [DashboardController::class, 'index'])
    ->name('dashboard');
    Route::get('/dashboard/expired-detail', [DashboardController::class, 'expiredDetail']);
    Route::get('/dashboard/best-selling-products', [DashboardController::class, 'bestSellingDetail'])
    ->name('dashboard.best-selling');

    Route::resource('/products', ProductController::class)->except('show');
    Route::get('products/deleted', [ProductController::class, 'deleted'])
        ->name('products.deleted');

    Route::post('products/{id}/restore', [ProductController::class, 'restore'])
        ->name('products.restore');  

    Route::get('sales-summary/history', [SalesSummaryController::class, 'history'])
        ->name('sales-summary.history');
    Route::resource('/sales-summary', SalesSummaryController::class)->except('show');
    Route::get('sales-summary/{id}/detail', [SalesSummaryController::class, 'detail'])
    ->name('sales-summary.detail');

    Route::resource('/payment-methods', PaymentMethodController::class)->except('show');
    Route::get('payment-methods/deleted', [PaymentMethodController::class, 'deleted'])
        ->name('payment-methods.deleted');
    Route::post('payment-methods/{id}/restore', [PaymentMethodController::class, 'restore'])
        ->name('payment-methods.restore'); 

         Route::resource('/purchase-methods', PurchaseMethodController::class)->except('show');
    Route::get('purchase-methods/deleted', [PurchaseMethodController::class, 'deleted'])
        ->name('purchase-methods.deleted');
    Route::post('purchase-methods/{id}/restore', [PurchaseMethodController::class, 'restore'])
        ->name('purchase-methods.restore'); 

    Route::resource('/categories', CategoryController::class)->except(['show']);
    Route::get('/categories/deleted', [CategoryController::class, 'deleted'])
        ->name('categories.deleted');
    Route::post('/categories/{id}/restore', [CategoryController::class, 'restore'])
        ->name('categories.restore');

    Route::resource('/supplier-cards', SupplierCardController::class)->except('show');
    Route::resource('stock-card', StockCardController::class)
    ->only(['index']);

    Route::resource('/suppliers', SupplierController::class)->except('show');
    Route::get('suppliers/deleted', [SupplierController::class, 'deleted'])
    ->name('suppliers.deleted');
    Route::post('suppliers/{id}/restore', [SupplierController::class, 'restore'])
    ->name('suppliers.restore');  

    Route::post('/purchases/generate-code', [PurchaseController::class, 'generateCode']);
    Route::resource('/purchases', PurchaseController::class)->except('show');

    Route::resource('/reports/purchases', PurchasesReportController::class)->except('show')
    ->names('reports.purchases'); 
    Route::get('/reports/purchases/deleted', [PurchasesReportController::class, 'deleted'])
    ->name('reports.purchases.deleted');
    Route::post('/reports/purchases/{id}/restore', [PurchasesReportController::class, 'restore'])
    ->name('reports.purchases.restore');  
    Route::get('/reports/print-purchases-report', [PurchasesReportController::class, 'printPurchasesReport'])
    ->name('purchases-reports.print.pdf');
     Route::post('/reports/purchases/{purchase}/pay', [PurchasesReportController::class, 'pay'])
        ->name('reports.purchases.pay');  

    Route::get('reports/sales/deleted', [SalesReportController::class, 'deleted'])
        ->name('reports.sales.deleted');

    Route::get('reports/sales/canceled', [SalesReportController::class, 'canceled'])
        ->name('reports.sales.canceled');

    Route::post('/reports/sales/{id}/cancel', [SalesReportController::class, 'cancel'])
        ->name('reports.sales.cancel');

    Route::resource('/reports/sales', SalesReportController::class)
        ->names('reports.sales');

    Route::get('/reports/print-sales-report', [SalesReportController::class, 'printSalesReport'])
        ->name('sales-reports.print.pdf');

    Route::resource('cash-ledgers', CashLedgerController::class)
    ->except('show');

    Route::get('/reports/sales/{id}/payment', [SalesReportController::class, 'payment'])
    ->name('reports.sales.payment');

    Route::get('/reports/stocks/export', function () {
        $search = request('search');
        $now = Carbon::now()->format('Y-m-d_H-i-s');

        return Excel::download(
            new StockReportExport($search, false),
            "laporan-stok-produk_{$now}.xlsx"
        );
    })->name('reportsStocks.export');


    Route::get('/reports/stocks/categories/export', function () {
        $search = request('search');
        $now = Carbon::now()->format('Y-m-d_H-i-s');

        return Excel::download(
            new StockReportExport($search, true),
            "laporan-stok-kategori_{$now}.xlsx"
        );
    })->name('reportsStocks.exportByCategories');

    Route::get(
    '/reports/stocks/categories',
    [StockReportController::class, 'byCategories']
    )->name('reportsStocks.byCategories');

    Route::resource('/reports/stocks', StockReportController::class)
    ->names('reportsStocks');

    Route::resource('/sellings', SellingController::class)
    ->names('sellings');

    Route::get('sellings/{sale}/payment', [SellingController::class, 'payment'])->name('sellings.payment');

    Route::post('sellings/{sale}/payment', [SellingController::class, 'pay'])->name('sellings.pay');
    Route::resource('/reports/laba-rugi', LabaRugiController::class)->names('reports.laba-rugi');
        Route::get('/laba-rugi/print', [LabaRugiController::class, 'printLabaRugi'])
        ->name('laba-rugi.print');
    Route::get('/laba-rugi/{bulan?}/{tahun?}', [LabaRugiController::class, 'index'])->name('laba-rugi.index');

    });

require __DIR__.'/settings.php';
