<!DOCTYPE html>
<html>
@php
$namaBulan = [
    1=>'Januari',2=>'Februari',3=>'Maret',
    4=>'April',5=>'Mei',6=>'Juni',
    7=>'Juli',8=>'Agustus',9=>'September',
    10=>'Oktober',11=>'November',12=>'Desember'
];

$now = \Carbon\Carbon::now();

$bulanInt = (int) ($bulan ?? $now->month);

$totalPengeluaran = collect($transactions)
    ->flatten(1)
    ->where('status_payment', '!=', 'canceled')
    ->sum(function ($trx) {
        return (float) ($trx->total_payment ?? 0);
    });

$totalPembatalan = $transactions->count();
@endphp

<head>
<meta charset="utf-8">
<title>{{ $title }}</title>
<link rel="icon" href="/assets/images/logo-dharmawanita.png" type="image/png">
<style>
*{margin:0;padding:0;box-sizing:border-box;}

body{
    font-family: DejaVu Sans, sans-serif;
    font-size:11px;
    padding:30px 36px;
}

.header{
    text-align:center;
    margin-bottom:24px;
    padding-bottom:16px;
    border-bottom:2px solid #111;
}

.header h1{
    font-size:16px;
    margin-bottom:6px;
}

.header p{
    font-size:10px;
    color:#555;
}

table{
    width:100%;
    border-collapse:collapse;
}

thead tr{
    background:#111;
    color:#fff;
}

th,td{
    padding:6px 8px;
    font-size:10px;
}

tbody tr:nth-child(even){
    background:#f8f8f8;
}

tfoot tr{
    background:#f0f0f0;
    border-top:2px solid #111;
}

.text-right{text-align:right;}
.text-center{text-align:center;}

.badge{
    padding:2px 7px;
    border-radius:3px;
    font-size:9px;
    font-weight:bold;
}

.paid{background:#dcfce7;color:#14532d;}
.pending{background:#fef9c3;color:#713f12;}
.canceled{background:#fee2e2;color:#7f1d1d;}

.no-data{
    text-align:center;
    padding:16px;
    color:#888;
}
</style>
</head>

<body>

<div class="header">
<h1>
@if($isDeleted)
    {{ $type === 'week'
        ? 'LAPORAN PEMBATALAN PEMBELIAN MINGGUAN'
        : 'LAPORAN PEMBATALAN PEMBELIAN' }}
@else
    {{ $type === 'week'
        ? 'LAPORAN PEMBELIAN MINGGUAN'
        : 'LAPORAN PEMBELIAN' }}
@endif
</h1>
<p>
@if($type==='month' || $type==='week')
Periode: {{ $namaBulan[$bulanInt] }} {{ $tahun }}
@else
Periode: Tahun {{ $tahun }}
@endif
</p>

<p>
Dicetak:
{{ $now->format('d') }}
{{ $namaBulan[$now->month] }}
{{ $now->format('Y') }}
</p>

</div>


<table>

<thead>
<tr>
<th>No</th>
<th>Kode</th>
<th>Produk</th>
<th>Sumber</th>
<th>Supplier</th>
<th>Tanggal</th>

@if(!$isDeleted)
<th class="text-center">Status</th>
@endif

<th class="text-right">Qty</th>
<th class="text-right">Harga</th>
<th class="text-right">Total</th>

@if($isDeleted)
<th>Alasan Pembatalan</th>
@else
<th class="text-right">Pembelian</th>
@endif

</tr>
</thead>


<tbody>

@if($type === 'week')

@php $no=1; @endphp

@forelse($transactions as $week => $items)

<tr>
<td colspan="{{ $isDeleted ? 10 : 11 }}"
style="background:#e5e5e5;font-weight:bold;">
Minggu ke-{{ $week }}
</td>
</tr>

@foreach($items as $trx)

@php
$date=\Carbon\Carbon::parse($trx->purchase_date);
$status=$trx->status_payment ?? 'pending';
$subtotal=$trx->quantity * $trx->purchase_price;
@endphp

<tr>

<td class="text-center">{{ $no++ }}</td>
<td>{{ $trx->code }}</td>
<td>{{ $trx->product->name ?? '-' }}</td>
@if($isDeleted)
<td class="text-center">
    <span class="badge canceled">Dibatalkan</span>
</td>
@else
<td>{{ $trx->source_label }}</td>
@endif
<td>{{ $trx->supplier->name ?? '-' }}</td>

<td class="text-center">
{{ $date->format('d') }}
{{ $namaBulan[$date->month] }}
{{ $date->format('Y') }}
</td>

@if(!$isDeleted)
<td class="text-center">
<span class="badge {{ $status }}">
{{ match($status){
'paid'=>'Lunas',
'pending'=>'Belum Lunas',
'canceled'=>'Dibatalkan',
default=>$status
} }}
</span>
</td>
@endif

<td class="text-right">
{{ $trx->quantity }}
</td>

<td class="text-right">
Rp {{ number_format($trx->purchase_price,0,',','.') }}
</td>

<td class="text-right">
Rp {{ number_format($subtotal,0,',','.') }}
</td>

@if($isDeleted)

<td>
{{ $trx->reason ?? '-' }}
</td>

@else

<td class="text-right">
Rp {{ number_format($trx->total_payment,0,',','.') }}
</td>

@endif

</tr>

@endforeach

<tr>
<td colspan="{{ $isDeleted ? 9 : 10 }}"
class="text-right">
<strong>Subtotal Minggu {{ $week }}</strong>
</td>

<td class="text-right">
<strong>
@if($isDeleted)
{{ $items->count() }} transaksi
@else
Rp {{ number_format($weeklyTotals[$week] ?? 0,0,',','.') }}
@endif
</strong>
</td>
</tr>

@empty

<tr>
<td colspan="{{ $isDeleted ? 10 : 11 }}"
class="no-data">
Tidak ada data
</td>
</tr>

@endforelse


@else

@forelse($transactions as $i=>$trx)

@php
$date=\Carbon\Carbon::parse($trx->purchase_date);
$status=$trx->status_payment ?? 'pending';
$subtotal=$trx->quantity * $trx->purchase_price;
@endphp

<tr>

<td class="text-center">{{ $i+1 }}</td>
<td>{{ $trx->code }}</td>
<td>{{ $trx->product->name ?? '-' }}</td>
@if($isDeleted)
<td class="text-center">
    <span class="badge canceled">Dibatalkan</span>
</td>
@else
<td>{{ $trx->source_label }}</td>
@endif
<td>{{ $trx->supplier->name ?? '-' }}</td>

<td class="text-center">
{{ $date->format('d') }}
{{ $namaBulan[$date->month] }}
{{ $date->format('Y') }}
</td>

@if(!$isDeleted)
<td class="text-center">
<span class="badge {{ $status }}">
{{ match($status){
'paid'=>'Lunas',
'pending'=>'Belum Lunas',
'canceled'=>'Dibatalkan',
default=>$status
} }}
</span>
</td>
@endif

<td class="text-right">
{{ $trx->quantity }}
</td>

<td class="text-right">
Rp {{ number_format($trx->purchase_price,0,',','.') }}
</td>

<td class="text-right">
Rp {{ number_format($subtotal,0,',','.') }}
</td>

@if($isDeleted)
<td>{{ $trx->reason ?? '-' }}</td>
@else
<td class="text-right">
Rp {{ number_format($trx->total_payment,0,',','.') }}
</td>
@endif

</tr>

@empty

<tr>
<td colspan="{{ $isDeleted ? 10 : 11 }}"
class="no-data">
Tidak ada data
</td>
</tr>

@endforelse

@endif

</tbody>


<tfoot>
<tr>
@php

$flat = $type==='week'
? collect($transactions)->flatten()
: $transactions;

$totalPengeluaran = $flat
->where('status_payment','!=','canceled')
->sum(fn($trx)=>(float)($trx->total_payment ?? 0));

$totalPembatalan = $flat->count();

@endphp
@if($isDeleted)

<td colspan="9">
<strong>Total Transaksi Dibatalkan</strong>
</td>

<td class="text-right">
<strong>{{ $totalPembatalan }} transaksi</strong>
</td>

@else

<td colspan="10">
<strong>Total Pembelian</strong>
</td>

<td class="text-right">
<strong>
Rp {{ number_format($totalPengeluaran,0,',','.') }}
</strong>
</td>

@endif

</tr>
</tfoot>

</table>

</body>
</html>