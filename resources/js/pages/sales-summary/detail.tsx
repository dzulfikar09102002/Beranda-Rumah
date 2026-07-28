import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DollarSign, ShoppingCart, WalletCards, FileText } from 'lucide-react';

import { SalesSummary } from '@/lib/model';
import salesSummary from '@/routes/sales-summary';

const title = 'Detail Rekap Penjualan';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'History Rekap Penjualan',
        href: salesSummary.history().url,
    },
    {
        title,
        href: salesSummary.history().url,
    },
];

type Props = {
    summary: SalesSummary;
};

export default function Detail({ summary }: Props) {
    const grouped = Object.values(
        (summary.details ?? []).reduce((acc: any, item: any) => {
            const kind = item.payment_method?.kind || 'lainnya';

            if (!acc[kind]) {
                acc[kind] = {
                    kind,
                    items: [],
                    total: 0,
                };
            }

            acc[kind].items.push(item);
            acc[kind].total += Number(item.total_amount);

            return acc;
        }, {}),
    );

    const formatRupiah = (value: number | string | null | undefined) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(value || 0));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <Card className="p-4">
                <div className="mb-2 space-y-4">
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-muted p-2">
                                <FileText
                                    size={20}
                                    className="text-muted-foreground"
                                />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold">
                                    {title}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Detail rekap berdasarkan metode pembayaran
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="rounded-xl bg-blue-50 p-3">
                                    <ShoppingCart
                                        size={20}
                                        className="text-blue-500"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Transaksi
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {summary.total_transactions}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="rounded-xl bg-emerald-50 p-3">
                                    <DollarSign
                                        size={20}
                                        className="text-emerald-500"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Pendapatan
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {formatRupiah(summary.total_sales)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="space-y-4">
                    {grouped.map((group: any) => (
                        <Card key={group.kind}>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <WalletCards size={16} />
                                    <h3 className="font-semibold uppercase">
                                        {group.kind}
                                    </h3>
                                </div>

                                <span className="text-sm text-muted-foreground">
                                    {formatRupiah(group.total)}
                                </span>
                            </CardHeader>

                            <CardContent className="space-y-2">
                                {group.items.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between text-sm"
                                    >
                                        <div>
                                            {item.payment_method?.name}
                                            <span className="ml-2 text-muted-foreground">
                                                ({item.total_transactions}{' '}
                                                Transaksi)
                                            </span>
                                        </div>

                                        <div className="font-medium">
                                            {formatRupiah(item.total_amount)}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Card>
        </AppLayout>
    );
}
