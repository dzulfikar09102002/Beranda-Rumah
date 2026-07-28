import { Head, Form, Link, usePage } from '@inertiajs/react';
import { useRef, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    createColumnHelper,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';

import DataTable from '@/components/data-table';
import TablePagination from '@/components/table-pagination';
import { Pagination, Stock } from '@/lib/model';
import { useQuery } from '@/hooks/use-query';
import reportsStocks from '@/routes/reportsStocks';

const title = 'Laporan Stok';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title,
        href: reportsStocks.index().url,
    },
];

const columnHelper = createColumnHelper<Stock>();

type TableMeta = {
    onCancel: (id: number) => void;
    onDetail: (id: number) => void;
};

type Props = {
    pagination: Pagination<Stock>;
    total_assets: number;
};

const formatIDR = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
    }).format(value);

export default function Index({ pagination, total_assets }: Props) {
    const { data } = pagination;
    const query = useQuery();
    const search = query.search || '';

    const wrapperRef = useRef<HTMLDivElement>(null);

    const { url } = usePage();
    const isCategoryRoute = url.includes('categories');
    const handleExport = () => {
        const params = new URLSearchParams(window.location.search);

        const exportUrl = isCategoryRoute
            ? `/reports/stocks/categories/export?${params.toString()}`
            : `/reports/stocks/export?${params.toString()}`;

        window.open(exportUrl, '_blank');
    };
    const columns: ColumnDef<Stock, any>[] = isCategoryRoute
        ? [
              {
                  id: 'no',
                  header: 'No',
                  cell: (info) =>
                      (pagination.current_page - 1) * pagination.per_page +
                      info.row.index +
                      1,
              },

              columnHelper.accessor('name', {
                  header: 'Nama Kategori',
              }),

              columnHelper.accessor('stock', {
                  header: () => <div className="text-center">Jumlah Stock</div>,
                  cell: (info) => (
                      <div className="text-center">{info.getValue() ?? 0}</div>
                  ),
              }),
          ]
        : [
              {
                  id: 'no',
                  header: 'No',
                  cell: (info) =>
                      (pagination.current_page - 1) * pagination.per_page +
                      info.row.index +
                      1,
              },

              columnHelper.accessor('name', {
                  header: 'Nama Produk',

                  footer: () => (
                      <div className="text-left font-bold">TOTAL ASET</div>
                  ),
              }),
              columnHelper.accessor('brand', {
                  header: 'Brand',
              }),
              columnHelper.display({
                  id: 'source',
                  header: 'Sumber',
                  cell: (info) => {
                      const source = info.row.original.stock_source;

                      const labels: Record<string, string> = {
                          purchase: 'Pembelian',
                          sale: 'Penjualan',
                          adjustment: 'Penyesuaian',
                          return: 'Retur',
                          transfer: 'Transfer',
                          other: 'Lainnya',
                          damage: 'Barang Rusak',
                          expired: 'Kedaluwarsa',
                          consignment: 'Titipan',
                      };

                      return labels[source ?? ''] ?? '-';
                  },
              }),

              columnHelper.accessor('purchase_price', {
                  header: () => <div>Harga Beli</div>,
                  cell: (info) => <div>{formatIDR(info.getValue())}</div>,
              }),

              columnHelper.accessor('selling_price', {
                  header: () => <div>Harga Jual</div>,
                  cell: (info) => <div>{formatIDR(info.getValue())}</div>,
              }),
              columnHelper.accessor('minimum_stock', {
                  header: () => <div className="text-center">Minimum Stok</div>,
                  cell: (info) => {
                      const value = info.getValue();

                      return (
                          <div className="text-center">
                              {value == null || value === '' ? '-' : value}
                          </div>
                      );
                  },
              }),
              columnHelper.accessor('stock', {
                  header: () => <div className="text-center">Jumlah Stock</div>,
                  cell: (info) => (
                      <div className="text-center">{info.getValue() ?? 0}</div>
                  ),
              }),
              columnHelper.accessor('stock_asset', {
                  header: () => <div className="text-center">Stok Aset</div>,

                  cell: (info) => {
                      const value = Math.max(0, Number(info.getValue() ?? 0));

                      return <div className="text-center">{value}</div>;
                  },
              }),
              columnHelper.accessor(
                  (row) => {
                      const stockAsset = Math.max(
                          0,
                          Number(row.stock_asset ?? 0),
                      );

                      return (row.purchase_price ?? 0) * stockAsset;
                  },
                  {
                      id: 'asset',

                      header: () => (
                          <div className="text-right">Nilai Aset</div>
                      ),

                      cell: (info) => {
                          const value = Number(info.getValue() ?? 0);

                          return (
                              <div className="text-right font-semibold">
                                  {value <= 0 ? '-' : formatIDR(value)}
                              </div>
                          );
                      },

                      footer: () => (
                          <div className="text-right font-bold">
                              {formatIDR(total_assets)}
                          </div>
                      ),
                  },
              ),
          ];
    const table = useReactTable<Stock>({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: {} as TableMeta,
    });

    const totals = data.reduce(
        (acc, item) => {
            acc.total_purchase += Number(item.total_in || 0);
            acc.total_sale += Number(item.total_out || 0);
            acc.stock += Number(item.stock || 0);
            return acc;
        },
        {
            total_purchase: 0,
            total_sale: 0,
            stock: 0,
        },
    );

    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const tableEl = wrapper.querySelector('table');
        if (!tableEl) return;
    }, [totals.total_purchase, totals.total_sale, totals.stock]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <Card>
                <CardHeader>
                    <Form method="GET" className="flex gap-2">
                        <input type="hidden" name="page" value={1} />
                        <Input
                            name="search"
                            defaultValue={search}
                            placeholder="Cari..."
                        />
                        <Button
                            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                            type="submit"
                            variant="secondary"
                        >
                            <Search /> Cari
                        </Button>
                    </Form>
                </CardHeader>

                <CardContent>
                    <Button
                        type="button"
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-green-600 text-white hover:bg-green-700"
                    >
                        <FileSpreadsheet size={16} />
                        Export Excel {isCategoryRoute ? 'Kategori' : 'Produk'}
                    </Button>
                    <br />
                    <Tabs
                        value={isCategoryRoute ? 'category' : 'product'}
                        className="mb-4"
                    >
                        <TabsList>
                            <TabsTrigger value="product" asChild>
                                <Link href={reportsStocks.index().url}>
                                    Per Produk
                                </Link>
                            </TabsTrigger>

                            <TabsTrigger value="category" asChild>
                                <Link href={reportsStocks.byCategories().url}>
                                    Per Kategori
                                </Link>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div ref={wrapperRef}>
                        <DataTable columns={columns} table={table} />
                    </div>

                    <TablePagination pagination={pagination} />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
