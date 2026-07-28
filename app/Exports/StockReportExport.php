<?php

namespace App\Exports;

use App\Models\ProductStock;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class StockReportExport implements FromCollection, WithHeadings
{
    protected $search;
    protected $byCategory;

    public function __construct($search = null, bool $byCategory = false)
    {
        $this->search = $search;
        $this->byCategory = $byCategory;
    }

    public function collection()
    {
        if ($this->byCategory) {

            $query = DB::table('product_stocks')
                ->select(
                    DB::raw('category_name as name'),
                    DB::raw('SUM(total_in) as total_in'),
                    DB::raw('SUM(total_out) as total_out'),
                    DB::raw('SUM(stock) as stock')
                )
                ->groupBy('category_id', 'category_name');

            if ($this->search) {
                $query->having('category_name', 'like', "%{$this->search}%");
            }

            return $query
                ->orderByDesc('stock')
                ->get();
        }

        $items = ProductStock::query()
            ->with('inventoryTransactions')
            ->when($this->search, function ($q) {
                $q->where('name', 'like', "%{$this->search}%");
            })
            ->orderBy('category_id')
            ->orderBy('name')
            ->get();

        $data = $items->map(function ($item) {

        $stockAsset = max(0, (int) ($item->stock_asset ?? 0));

        return [
            'name' => $item->name ?? '-',

            'brand' => $item->brand ?? '-',

            'stock_source' => match ($item->stock_source ?? null) {
                'purchase' => 'Pembelian',
                'sale' => 'Penjualan',
                'adjustment' => 'Penyesuaian',
                'return' => 'Retur',
                'transfer' => 'Transfer',
                'other' => 'Lainnya',
                'damage' => 'Barang Rusak',
                'expired' => 'Kedaluwarsa',
                'consignment' => 'Titipan',
                default => '-',
            },

            'purchase_price' => (float) ($item->purchase_price ?? 0),

            'selling_price' => (float) ($item->selling_price ?? 0),

            'stock' => (int) ($item->stock ?? 0),

            'stock_asset' => $stockAsset,

            'asset' => ((float) ($item->purchase_price ?? 0)) * $stockAsset,
        ];
    });

        $totalAsset = $data->sum('asset');

        $data->push([
            'name' => 'TOTAL',
            'brand' => '',
            'stock_source' => '',
            'purchase_price' => '',
            'selling_price' => '',
            'stock' => '',
            'stock_asset' => '',
            'asset' => $totalAsset,
        ]);

        return $data;
    }

    public function headings(): array
    {
        if ($this->byCategory) {
            return [
                'Nama Kategori',
                'Stok Masuk',
                'Stok Keluar',
                'Jumlah Stok',
            ];
        }

        return [
            'Nama Produk',
            'Brand',
            'Sumber',
            'Harga Beli',
            'Harga Jual',
            'Jumlah Stok',
            'Stok Asset',
            'Nilai Asset',
        ];
    }
}