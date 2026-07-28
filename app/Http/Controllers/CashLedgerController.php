<?php

namespace App\Http\Controllers;

use App\Models\CashLedger;
use App\Services\CashLedgerService;
use App\Http\Requests\StoreCashLedgerRequest;
use App\Http\Requests\UpdateCashLedgerRequest;
use Carbon\Carbon;
use Inertia\Inertia;

class CashLedgerController extends Controller
{
    public function __construct(
        protected CashLedgerService $cashLedgerService
    ) {}

    public function index()
    {

        $pagination = $this->cashLedgerService->getDailyReport();
        $openingBalance = $this->cashLedgerService->getOpeningBalance();
        $summary = $this->cashLedgerService->getCashSummary();
        return Inertia::render('cash-ledger/index', compact(
            'pagination',
            'openingBalance',
            'summary'
        ));
    }

    public function store(StoreCashLedgerRequest $request)
    {
        $this->cashLedgerService->store($request->validated());
        return to_route('cash-ledgers.index')
        ->with('success', 'Aktivitas berhasil dicatat');
    }

    public function update(UpdateCashLedgerRequest $request, CashLedger $cashLedger)
    {
        //
    }

    public function destroy(CashLedger $cashLedger)
    {
        //
    }
}