<!DOCTYPE html>
<html>
@php
$namaBulan = [
    1 => 'Januari', 2 => 'Februari', 3 => 'Maret',
    4 => 'April',   5 => 'Mei',      6 => 'Juni',
    7 => 'Juli',    8 => 'Agustus',  9 => 'September',
    10 => 'Oktober',11 => 'November',12 => 'Desember'
];

$now = \Carbon\Carbon::now();
@endphp

<head>
<meta charset="utf-8">
<title>{{ $title }}</title>
<link rel="icon" href="~/assets/images/logo-dharmawanita.png" type="image/png">

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    font-family: DejaVu Sans, sans-serif;
    font-size: 11px;
    color: #1a1a1a;
    padding: 30px 36px;
}

.header {
    text-align: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #1a1a1a;
}

.header h1 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 6px;
}

.header p {
    font-size: 10px;
    color: #555;
}

table {
    width: 100%;
    border-collapse: collapse;
}

thead tr {
    background-color: #1a1a1a;
    color: #fff;
}

th, td {
    padding: 6px 8px;
    font-size: 10px;
}

tbody tr:nth-child(even) {
    background-color: #f8f8f8;
}

tfoot tr {
    background-color: #f0f0f0;
    border-top: 2px solid #1a1a1a;
}

.text-right { text-align: right; }
.text-center { text-align: center; }

.badge {
    padding: 2px 7px;
    border-radius: 3px;
    font-size: 9px;
    font-weight: bold;
}

.paid { background: #dcfce7; color: #14532d; }
.pending { background: #fef9c3; color: #713f12; }
.canceled { background: #fee2e2; color: #7f1d1d; }

.no-data {
    text-align: center;
    padding: 16px;
    color: #888;
    font-style: italic;
}
</style>
</head>

<body>

<div class="header">
    <h1>
        {{
$isDeleted
    ? 'LAPORAN BARANG KERUGIAN' . ($type === 'week' ? ' MINGGUAN' : '')
    : (
        $isCanceled
            ? 'LAPORAN PEMBATALAN' . ($type === 'week' ? ' MINGGUAN' : '')
            : 'LAPORAN PENJUALAN' . ($type === 'week' ? ' MINGGUAN' : '')
      )
}}
    </h1>

    <p>
@php
    $start = request('start_date');
    $end   = request('end_date');
@endphp

    @if($start && $end)
        Periode:
        {{ \Carbon\Carbon::parse($start)->translatedFormat('d F Y') }}
        -
        {{ \Carbon\Carbon::parse($end)->translatedFormat('d F Y') }}

    @elseif(isset($bulan) && isset($tahun))
        Periode:
        {{ $namaBulan[(int)$bulan] ?? '-' }} {{ $tahun }}

    @else
        Periode:
        {{ $now->translatedFormat('F Y') }}
    @endif
    </p>

    <p>
        Dicetak pada:
        {{ $now->format('d') }}
        {{ $namaBulan[$now->month] }}
        {{ $now->format('Y') }}
    </p>
</div>

<table>
<thead>
<tr>
    <th style="width:5%">No</th>

    @if($isDeleted)
        <th style="text-align: left;">Nama Barang</th>
        <th class="text-center">Jumlah</th>
        <th class="text-center">Tanggal</th>
        <th style="text-align: left;">Alasan</th>
        <th  class="text-right">Kerugian</th>

    @elseif($isCanceled)
        <th style="text-align: left;">Invoice</th>
        <th class="text-center">Status</th>
        <th  class="text-center">Tanggal</th>
        <th style="text-align: left;">Keterangan</th>
        <th  class="text-right">Total</th>

    @else
        <th style="text-align: left;">Invoice</th>
        <th class="text-center">Status</th>
        <th class="text-center">Tanggal</th>
        <th class="text-right">Total</th>
        <th class="text-right">Pembayaran</th>
        <th class="text-right">Kembalian</th>
        <th class="text-right">Laba</th>
    @endif
</tr>
</thead>

<tbody>

@if($type === 'week')

@php $no = 1; @endphp

@forelse($transactions as $week => $items)

<tr>
<td colspan="{{ $isDeleted || $isCanceled ? 6 : 8 }}"
style="background:#e5e5e5;font-weight:bold;">
Minggu ke-{{ $week }}
</td>
</tr>

@foreach($items as $trx)

@php
$date = \Carbon\Carbon::parse($trx->transaction_date);

// HITUNG LABA
$revenue = $trx->details->sum(fn($d) =>
    ($d->quantity * $d->selling_price) - ($d->adjustment ?? 0)
);

$cost = $trx->details->sum(fn($d) =>
    $d->quantity * $d->purchase_price
);

$profit = $trx->payment_status === 'paid'
    ? ($revenue - $cost)
    : 0;
@endphp

<tr>
<td class="text-center">{{ $no++ }}</td>

@if($isDeleted)

<td>
{{
$trx->details
->map(fn($d)=>($d->purchase->product->name ?? '-') . ' ('.$d->quantity.')')
->join(', ')
?: '-'
}}
</td>

<td class="text-center">
{{ $trx->details->sum('quantity') ?: '-' }}
</td>

<td class="text-center">
{{ $date->translatedFormat('d F Y H:i') }}
</td>

<td>{{ $trx->reason ?? '-' }}</td>

<td class="text-right">
Rp {{ number_format($trx->total_amount ?? 0,0,',','.') }}
</td>

@elseif($isCanceled)

<td>{{ $trx->invoice_number }}</td>

<td class="text-center">
<span class="badge canceled">Dibatalkan</span>
</td>

<td class="text-center">
{{ $date->translatedFormat('d F Y H:i') }}
</td>

<td>{{ $trx->reason ?? '-' }}</td>

<td class="text-right">
Rp {{ number_format($trx->grand_total ?? 0,0,',','.') }}
</td>

@else

<td>{{ $trx->invoice_number }}</td>

<td class="text-center">
<span class="badge {{ $trx->payment_status }}">
{{
$trx->payment_status==='paid'
?'Lunas'
:($trx->payment_status==='pending'
?'Belum Lunas'
:'Dibatalkan')
}}
</span>
</td>

<td class="text-center">
{{ $date->translatedFormat('d F Y H:i') }}
</td>

<td class="text-right">
Rp {{ number_format($trx->grand_total ?? 0,0,',','.') }}
</td>

<td class="text-right">
Rp {{ number_format($trx->total_amount ?? 0,0,',','.') }}
</td>

<td class="text-right">
Rp {{ number_format($trx->change ?? 0,0,',','.') }}
</td>

<td class="text-right">
<strong style="color: {{ $profit >= 0 ? '#16a34a' : '#dc2626' }}">
{{ $profit == 0 ? '-' : 'Rp '.number_format($profit,0,',','.') }}
</strong>
</td>


@endif

</tr>

{{-- DETAIL BARANG --}}
@if(!$isDeleted && !$isCanceled)

<tr>
<td></td>

<td colspan="7" style="padding:0 0 6px 0;">
<table style="width:100%; border-collapse: collapse;">
<tbody>

@foreach($trx->details as $detail)

<tr style="background:#fafafa;">

<td style="
    padding:4px 8px 4px 12px;
    border-top:1px solid #e5e5e5;
    font-size:9px;
    color:#444;
">

• {{ $detail->purchase->product->name ?? '-' }}

@if(($detail->purchase->product->brand ?? null))
- {{ $detail->purchase->product->brand }}
@endif

</td>

<td style="
    width:120px;
    text-align:left;
    padding-left:8px;
    border-top:1px solid #e5e5e5;
    font-size:9px;
    color:#444;
">
{{ $detail->quantity }} x
Rp {{ number_format($detail->selling_price ?? 0,0,',','.') }}
</td>

<td style="
    width:120px;
    text-align:left;
    padding-left:8px;
    border-top:1px solid #e5e5e5;
    font-size:9px;
    color:#444;
">
Diskon :
Rp {{ number_format(($detail->adjustment ?? 0),0,',','.') }}
</td>

</tr>

@endforeach

</tbody>
</table>
</td>
</tr>

@endif

@endforeach


<tr>
<td colspan="{{ $isDeleted || $isCanceled ? 5 : 7 }}"
class="text-right">
<strong>Subtotal Minggu {{ $week }}</strong>
</td>

<td class="text-right">
<strong>
@if($isCanceled)
{{ $items->count() }} Transaksi
@else
Rp {{ number_format($weeklyTotals[$week] ?? 0,0,',','.') }}
@endif
</strong>
</td>
</tr>

@empty

<tr>
<td colspan="{{ $isDeleted || $isCanceled ? 6 : 9 }}"
class="no-data">
Tidak ada data
</td>
</tr>

@endforelse

@else

@forelse($transactions as $i=>$trx)

@php
$date = \Carbon\Carbon::parse($trx->transaction_date);

$revenue = $trx->details->sum(fn($d) =>
    ($d->quantity * $d->selling_price) - ($d->adjustment ?? 0)
);

$cost = $trx->details->sum(fn($d) =>
    $d->quantity * $d->purchase_price
);

$profit = $trx->payment_status === 'paid'
    ? ($revenue - $cost)
    : 0;
@endphp

<tr>
<td class="text-center">{{ $i+1 }}</td>

@if($isDeleted)

<td>
{{ $trx->details->map(fn($d)=>($d->purchase->product->name ?? '-') . ' ('.$d->quantity.')')->join(', ') ?: '-' }}
</td>

<td class="text-center">
{{ $trx->details->sum('quantity') ?: '-' }}
</td>

<td class="text-center">
{{ $date->format('d') }}
{{ $namaBulan[(int)$date->format('n')] }}
{{ $date->format('Y H:i') }}
</td>

<td>{{ $trx->reason ?? '-' }}</td>

<td class="text-right">
Rp {{ number_format($trx->total_amount ?? 0,0,',','.') }}
</td>

@elseif($isCanceled)

<td>{{ $trx->invoice_number }}</td>

<td class="text-center">
<span class="badge canceled">Dibatalkan</span>
</td>

<td class="text-center">
{{ $date->format('d') }}
{{ $namaBulan[(int)$date->format('n')] }}
{{ $date->format('Y H:i') }}
</td>

<td>{{ $trx->reason ?? '-' }}</td>

<td class="text-right">
Rp {{ number_format($trx->grand_total ?? 0,0,',','.') }}
</td>

@else

<td>{{ $trx->invoice_number }}</td>

<td class="text-center">
<span class="badge {{ $trx->payment_status }}">
{{ $trx->payment_status==='paid' ? 'Lunas' : 'Belum Lunas' }}
</span>
</td>

<td class="text-center">
{{ $date->format('d') }}
{{ $namaBulan[(int)$date->format('n')] }}
{{ $date->format('Y H:i') }}
</td>

<td class="text-right">
Rp {{ number_format($trx->grand_total ?? 0,0,',','.') }}
</td>

<td class="text-right">
Rp {{ number_format($trx->total_amount ?? 0,0,',','.') }}
</td>

<td class="text-right">
Rp {{ number_format($trx->change ?? 0,0,',','.') }}
</td>

<td class="text-right">
<strong style="color: {{ $profit >= 0 ? '#16a34a' : '#dc2626' }}">
{{ $profit == 0 ? '-' : 'Rp '.number_format($profit,0,',','.') }}
</strong>
</td>

@endif

</tr>

{{-- DETAIL BARANG --}}
@if(!$isDeleted && !$isCanceled)

<tr>
<td></td>

<td colspan="7" style="padding:0 0 6px 0;">
<table style="width:100%; border-collapse: collapse;">
<tbody>

@foreach($trx->details as $detail)

<tr style="background:#fafafa;">

<td style="
    padding:4px 8px 4px 12px;
    border-top:1px solid #e5e5e5;
    font-size:9px;
    color:#444;
">

• {{ $detail->purchase->product->name ?? '-' }}

@if(($detail->purchase->product->brand ?? null))
- {{ $detail->purchase->product->brand }}
@endif

</td>

<td style="
    width:120px;
    text-align:left;
    padding-left:8px;
    border-top:1px solid #e5e5e5;
    font-size:9px;
    color:#444;
">
{{ $detail->quantity }} x
Rp {{ number_format($detail->selling_price ?? 0,0,',','.') }}
</td>

<td style="
    width:120px;
    text-align:left;
    padding-left:8px;
    border-top:1px solid #e5e5e5;
    font-size:9px;
    color:#444;
">
Diskon :
Rp {{ number_format(($detail->adjustment ?? 0),0,',','.') }}
</td>

</tr>

@endforeach

</tbody>
</table>
</td>
</tr>

@endif

</tr>

@empty

<tr>
<td colspan="{{ $isDeleted || $isCanceled ? 6 : 10 }}"
class="no-data">
Tidak ada data
</td>
</tr>

@endforelse

@endif

</tbody>


@php

$flat = $type==='week'
? collect($transactions)->flatten()
: $transactions;

if($isDeleted){
    $totalFinal = $flat->sum('total_amount');
    $labelTotal = 'Total Kerugian';
    $colspan = 5;

}elseif($isCanceled){
    $totalFinal = $flat->count();
    $labelTotal = 'Jumlah Pembatalan';
    $colspan = 5;

}else{

    $totalFinal = $flat
        ->where('payment_status','paid')
        ->sum(fn($trx)=>
            max(
                0,
                ($trx->total_amount ?? 0)-($trx->change ?? 0)
            )
        );

    $labelTotal='Total Penjualan';
    $colspan=7;

}

@endphp


<tfoot>
<tr>
<td colspan="{{ $colspan }}">
<strong>{{ $labelTotal }}</strong>
</td>

<td class="text-right">
<strong>
@if($isCanceled)
{{ $totalFinal }} Transaksi
@else
Rp {{ number_format($totalFinal,0,',','.') }}
@endif
</strong>
</td>
</tr>
@php
$totalProfit = $flat
    ->where('payment_status','paid')
    ->sum(function ($trx) {

        $revenue = $trx->details->sum(fn($d) =>
            ($d->quantity * $d->selling_price) - ($d->adjustment ?? 0)
        );

        $cost = $trx->details->sum(fn($d) =>
            $d->quantity * $d->purchase_price
        );

        return $revenue - $cost;
    });
@endphp

<tr>
<td colspan="{{ $colspan }}">
<strong>Total Laba</strong>
</td>

<td class="text-right">
<strong style="color:#16a34a;">
{{ $totalProfit == 0 ? '-' : 'Rp '.number_format($totalProfit,0,',','.') }}
</strong>
</td>
</tr>
</tfoot>

</table>

</body>
</html>