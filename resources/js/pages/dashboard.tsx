import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Area, AreaChart, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { Eye, SquareArrowOutUpRight } from 'lucide-react';

import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxList,
    ComboboxItem,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Purchase } from '@/lib/model';
import { Link } from '@inertiajs/react';

type Product = {
    id: number;
    name: string;
    expired_date: string | null;
};

type BestSelling = {
    total_sold: number;
    purchase?: Purchase;
};

type DailySales = {
    date: string;
    total: number;
};

type Props = {
    expiredProducts?: Product[];
    bestSellingProducts?: BestSelling[];

    year?: number;
    month?: number;
    income?: number;
    expense?: number;
    profit?: number;
    debt?: number;
    receivable?: number;

    dailySales?: DailySales[];
};

const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

const formatRupiah = (value: any) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

const monthLabels: Record<number, string> = {
    1: 'Januari',
    2: 'Februari',
    3: 'Maret',
    4: 'April',
    5: 'Mei',
    6: 'Juni',
    7: 'Juli',
    8: 'Agustus',
    9: 'September',
    10: 'Oktober',
    11: 'November',
    12: 'Desember',
};

const year = new Date().getFullYear();

const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({
    expiredProducts = [],
    bestSellingProducts = [],
    income = 0,
    expense = 0,
    profit = 0,
    debt = 0,
    receivable = 0,
    dailySales = [],
    month = new Date().getMonth() + 1,
    year = new Date().getFullYear(),
}: Props) {
    const chartData = Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;

        const total = dailySales
            .filter((d) => new Date(d.date).getDate() === day)
            .reduce((sum, d) => sum + Number(d.total), 0);

        return {
            day,
            total,
        };
    });

    const chartConfig = {
        total: {
            label: 'Penjualan',
            color: 'var(--chart-1)',
        },
    } satisfies ChartConfig;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold">
                        Dashboard - {monthLabels[month]} {year}
                    </h1>

                    <div className="flex gap-2">
                        <Combobox
                            items={months}
                            value={months.find((m) => m.value === month)}
                            onValueChange={(val) => {
                                if (!val) return;

                                router.get(
                                    '/dashboard',
                                    {
                                        month: val.value,
                                        year: year,
                                    },
                                    {
                                        preserveState: true,
                                        replace: true,
                                    },
                                );
                            }}
                        >
                            <ComboboxInput placeholder="Pilih Bulan" />

                            <ComboboxContent>
                                <ComboboxEmpty>Tidak ditemukan</ComboboxEmpty>
                                <ComboboxList>
                                    {(item) => (
                                        <ComboboxItem
                                            key={item.value}
                                            value={item}
                                        >
                                            {item.label}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>

                        <Input
                            type="number"
                            value={year}
                            onChange={(e) =>
                                router.get(
                                    '/dashboard',
                                    {
                                        month: month,
                                        year: Number(e.target.value),
                                    },
                                    {
                                        preserveState: true,
                                        replace: true,
                                    },
                                )
                            }
                            className="w-24"
                            min={2000}
                            max={2100}
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader>Penerimaan</CardHeader>
                        <CardContent>{formatRupiah(income)}</CardContent>
                    </Card>

                    <Card>
                        <CardHeader>Pengeluaran</CardHeader>
                        <CardContent>{formatRupiah(expense)}</CardContent>
                    </Card>

                    <Card>
                        <CardHeader>Laba / Rugi</CardHeader>
                        <CardContent
                            className={
                                profit >= 0 ? 'text-green-500' : 'text-red-500'
                            }
                        >
                            {formatRupiah(profit)}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>Piutang</CardHeader>
                        <CardContent>{formatRupiah(receivable)}</CardContent>
                    </Card>

                    <Card>
                        <CardHeader>Utang</CardHeader>
                        <CardContent
                            className={
                                debt > 0
                                    ? 'font-bold text-red-500'
                                    : 'text-black-500'
                            }
                        >
                            {formatRupiah(debt)}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div>
                            <div className="font-semibold">
                                Penjualan Harian
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Tanggal 1 - 31
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="h-[300px] w-full">
                        <ChartContainer
                            config={chartConfig}
                            className="h-full w-full"
                        >
                            <AreaChart
                                data={chartData}
                                margin={{ left: 12, right: 12 }}
                                className="h-full w-full"
                            >
                                <CartesianGrid vertical={false} />

                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />

                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent indicator="line" />
                                    }
                                />

                                <Area
                                    dataKey="total"
                                    type="monotone"
                                    fill="var(--color-total)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-total)"
                                />
                            </AreaChart>
                        </ChartContainer>
                        {dailySales.length === 0 && (
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Tidak ada transaksi bulan ini
                            </p>
                        )}
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <span>Produk Mendekati Expired</span>

                            <Link href="/dashboard/expired-detail">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-1"
                                >
                                    <SquareArrowOutUpRight size={14} />
                                </Button>
                            </Link>
                        </CardHeader>

                        <CardContent>
                            {expiredProducts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Tidak ada data
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {expiredProducts.map((p) => (
                                        <div
                                            key={p.id}
                                            className="flex justify-between border-b pb-2"
                                        >
                                            <span>{p.name}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {p.expired_date
                                                    ? new Date(
                                                          p.expired_date,
                                                      ).toLocaleDateString(
                                                          'id-ID',
                                                          {
                                                              day: '2-digit',
                                                              month: 'long',
                                                              year: 'numeric',
                                                          },
                                                      )
                                                    : '-'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <span>Produk Terlaris</span>
                            <Link href="/dashboard/best-selling-products">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-1"
                                >
                                    <SquareArrowOutUpRight size={14} />
                                </Button>
                            </Link>
                        </CardHeader>

                        <CardContent>
                            {bestSellingProducts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Tidak ada data
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {bestSellingProducts.map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between border-b pb-2"
                                        >
                                            <span>
                                                {item.purchase?.product?.name ??
                                                    '-'}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {item.total_sold} terjual
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
