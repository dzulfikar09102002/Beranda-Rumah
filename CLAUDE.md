# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Point-of-sale / inventory / bookkeeping app for a retail shop, built on the Laravel 13 + Inertia v3 + React 19 starter kit (Fortify auth, Wayfinder, Tailwind v4, shadcn-style UI). UI text, flash messages and some identifiers are in Indonesian (e.g. `laba-rugi` = profit & loss, `bulan`/`tahun` = month/year).

## Commands

```bash
composer dev            # php artisan serve + queue:listen + vite, concurrently
composer setup          # first-time install (deps, .env, key, migrate, build)
npm run build           # production assets (also regenerates Wayfinder TS)

composer test           # config:clear + pint --test + php artisan test
php artisan test --filter=DashboardTest          # single test class / method
./vendor/bin/pest tests/Feature/DashboardTest.php # single file via Pest

composer lint           # pint (PHP fixer); lint:check for dry run
npm run lint            # eslint --fix;  lint:check for dry run
npm run format          # prettier on resources/; format:check for dry run
npm run types:check     # tsc --noEmit
composer ci:check       # everything CI runs
```

Tests use Pest with in-memory SQLite (`phpunit.xml`); the dev database is MySQL. Test coverage is mostly the starter-kit auth/settings tests.

## Architecture

**Request flow:** `routes/web.php` (all behind `auth` + `verified`) → thin controller in `app/Http/Controllers` → a same-named service in `app/Services` (constructor-injected, e.g. `SellingController` → `SellingService`) → `Inertia::render('<folder>/<page>', ...)` mapping to `resources/js/pages/<folder>/<page>.tsx`. Business logic and queries live in services, not controllers; validation lives in `app/Http/Requests/Store*/Update*Request`. Most CRUD resources also expose `deleted` + `restore` routes backed by `SoftDeletes`, and models track `created_by`/`updated_by`/`deleted_by` user ids.

**Inventory is ledger-based.** There is no stock column on products. Stock is derived by summing `inventory_transactions` (`type` = `in`/`out`, see `app/Enums/InventoryType` & `InventorySource`) with a polymorphic-ish `reference_table` + `reference_id` (`purchase` → `purchases.id`, `sale` → `sale_transaction_details.id`). Any operation that changes stock (purchase, sale, cancel/return, purchase-report edits) must write matching inventory rows and exclude soft-deleted ones (`whereNull('deleted_at')`). `ProductStock` reads a `product_stocks` table/view that has no migration in this repo.

**Sales use FIFO by purchase batch.** `SellingService::store` splits each cart line across `purchases` (same `product_id` + `selling_price`, oldest `purchase_date` first), creating one `SaleTransactionDetail` + one `out` inventory transaction per batch consumed and pro-rating the line discount. A sale is created `pending`; `pay()` finalizes it.

**Cash is ledger-based too.** Payments and purchases also write `CashLedger` rows (`TYPE_*`, `CATEGORY_*`, `REF_*` constants on the model; `cash_flow_type` is `cash` vs `bank` depending on `PaymentMethod.kind`). Reports (`*ReportService`, `LabaRugiService`, `DashboardService`) aggregate from these ledgers, so keep inventory and cash writes inside the same `DB::transaction` as the source record.

Several tables (`settings`, `cash_ledgers`, `cash_reconciliations`, `product_stocks`, …) are not covered by `database/migrations` — check the actual DB schema before assuming columns. `Setting` is a key/value table keyed by `property` (e.g. `BRAND_NAME`, `INVOICE_NOTE`, `EXPIRED_DAY_SPAN`).

**Exports:** PDFs via `barryvdh/laravel-dompdf` using Blade templates in `resources/views/reports/*-pdf.blade.php` (receipt, sales, purchases, laba-rugi); Excel via `maatwebsite/excel` (`app/Exports`).

## Frontend

- Pages in `resources/js/pages`, feature components in `resources/js/components/<feature>`, primitives in `resources/js/components/ui` (shadcn style, `@/` alias → `resources/js`). Tables use `@tanstack/react-table` via `components/data-table.tsx`; charts use Recharts; confirmations use SweetAlert2, toasts use Sonner.
- Layouts are assigned in `resources/js/app.tsx` by page-name prefix (`auth/*`, `settings/*`); app pages wrap themselves in `AppLayout`.
- **Wayfinder:** `resources/js/actions`, `resources/js/routes` and `resources/js/wayfinder` are generated from Laravel routes/controllers by the Vite plugin — don't hand-edit them. Import typed route helpers from `@/routes/...` / `@/actions/...` instead of hard-coding URLs; they regenerate when `npm run dev`/`build` runs after route changes.
- React Compiler is enabled (babel plugin), so manual `useMemo`/`useCallback` is usually unnecessary.
