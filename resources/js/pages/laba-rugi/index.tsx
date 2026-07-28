import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Printer, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';

type LabaRugiData = {
    bulan: number | null;
    tahun: number;
    total_pendapatan: number;
    total_pendapatan_piutang: number;
    total_pembelian: number;
    laba_rugi: number;
    total_utang: number;
};

type Props = {
    data: LabaRugiData;
};

const namaBulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
];

const formatRupiah = (value: number | string | null | undefined) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const breadcrumbs = [
    {
        title: 'Laporan Laba Rugi',
        href: '/laba-rugi',
    },
];

export default function LabaRugi({ data }: Props) {
    const [bulan, setBulan] = useState<number>(data.bulan ?? 1);
    const [tahun, setTahun] = useState<number>(data.tahun);

    const handleFilter = () => {
        router.get(`/laba-rugi/${bulan}/${tahun}`);
    };
    const bulanOptions = namaBulan.map((nama, i) => ({
        value: String(i + 1),
        label: nama,
    }));
    const handlePrint = (type: 'month' | 'year') => {
        const params = new URLSearchParams({
            type,
            tahun: String(tahun),
        });

        if (type === 'month') {
            params.append('bulan', String(bulan));
        }

        window.open(`/laba-rugi/print?${params.toString()}`, '_blank');
    };

    const totalPendapatan =
        data.total_pendapatan + data.total_pendapatan_piutang;
    const totalPengeluaran = data.total_pembelian + data.total_utang;
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laba Rugi" />

            <div className="flex flex-col gap-4 p-4">
                <Card>
                    <CardContent className="flex flex-wrap items-end gap-4">
                        <div className="flex flex-col">
                            <Field className="min-w-[180px]">
                                <FieldLabel>Bulan</FieldLabel>

                                <Combobox
                                    items={bulanOptions}
                                    value={
                                        bulanOptions.find(
                                            (b) => Number(b.value) === bulan,
                                        ) ?? null
                                    }
                                    onValueChange={(val) => {
                                        if (val) setBulan(Number(val.value));
                                    }}
                                >
                                    <ComboboxInput placeholder="Pilih bulan" />

                                    <ComboboxContent>
                                        <ComboboxEmpty>
                                            Tidak ditemukan
                                        </ComboboxEmpty>
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
                            </Field>
                        </div>

                        <div className="flex flex-col">
                            <Field className="w-[120px]">
                                <FieldLabel>Tahun</FieldLabel>

                                <Input
                                    type="number"
                                    value={tahun}
                                    onChange={(e) =>
                                        setTahun(Number(e.target.value))
                                    }
                                    min={2000}
                                    max={2100}
                                />
                            </Field>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={handleFilter}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                            >
                                <Search size={16} />
                                Filter
                            </Button>

                            <Button
                                onClick={() => handlePrint('month')}
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                <Printer size={16} />
                                Cetak Laporan Bulanan
                            </Button>

                            <Button
                                onClick={() => handlePrint('year')}
                                className="bg-purple-600 text-white hover:bg-purple-700"
                            >
                                <Printer size={16} />
                                Cetak Laporan Tahunan
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* RESULT */}
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle>
                            Laporan Laba Rugi -{' '}
                            {data.bulan
                                ? `${namaBulan[data.bulan - 1]} ${data.tahun}`
                                : `Tahun ${data.tahun}`}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 text-sm">
                        {/* PENDAPATAN */}
                        <div>
                            <h3 className="border-b pb-1 font-semibold">
                                Pendapatan
                            </h3>

                            <div className="mt-2 flex justify-between">
                                <span className="pl-4">
                                    Pendapatan Penjualan
                                </span>
                                <span>
                                    {formatRupiah(data.total_pendapatan)}
                                </span>
                            </div>

                            <div className="flex justify-between">
                                <span className="pl-4">Pendapatan Piutang</span>
                                <span>
                                    {formatRupiah(
                                        data.total_pendapatan_piutang,
                                    )}
                                </span>
                            </div>

                            <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                                <span>Total Pendapatan</span>
                                <span>{formatRupiah(totalPendapatan)}</span>
                            </div>
                        </div>

                        {/* PEMBELIAN */}
                        <div>
                            <h3 className="border-b pb-1 font-semibold">
                                Pengeluaran
                            </h3>

                            <div className="mt-2 flex justify-between">
                                <span className="pl-4">Pembelian</span>
                                <span>
                                    {formatRupiah(data.total_pembelian)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="pl-4">Pelunasan Utang</span>
                                <span>{formatRupiah(data.total_utang)}</span>
                            </div>

                            <div className="mt-2 flex justify-between border-t pt-2 font-semibold">
                                <span>Total Pengeluaran</span>
                                <span>{formatRupiah(totalPengeluaran)}</span>
                            </div>
                        </div>

                        {/* LABA / RUGI */}
                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Laba / Rugi</span>
                                <span
                                    className={
                                        data.laba_rugi >= 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                    }
                                >
                                    {data.laba_rugi < 0
                                        ? `(${formatRupiah(Math.abs(data.laba_rugi))})`
                                        : formatRupiah(data.laba_rugi)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
