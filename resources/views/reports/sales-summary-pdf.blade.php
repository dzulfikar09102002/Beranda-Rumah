<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Rekap Penjualan | {{ \Carbon\Carbon::parse($summary->date)->format('d/m/y H:i') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="icon" href="/assets/images/logo-brand2.png" type="image/png">
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=Playfair+Display:wght@700;800&display=swap"
        rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', 'Segoe UI', sans-serif;
            font-size: 2.9mm;
            font-weight: 600;
            color: #000;
            margin: 0;
            padding: 0;
            background-color: #fff;
            width: 48mm;
        }

        .container {
            width: 48mm;
            margin: 0 auto;
            padding: 1.5mm 1mm 1.5mm 0mm;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .text-bold {
            font-weight: 800;
        }

        .uppercase {
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .pb-1 {
            padding-bottom: 0.5mm;
        }

        .pt-1 {
            padding-top: 0.5mm;
        }

        .pb-2 {
            padding-bottom: 1mm;
        }

        .pt-2 {
            padding-top: 1mm;
        }

        .big-font {
            font-size: 1.2em;
        }

        .small-font {
            font-size: 0.88em;
            font-weight: 600;
        }

        .tiny-font {
            font-size: 0.8em;
            font-weight: 600;
        }

        .brd-bottom {
            border-bottom: 0.3mm dashed #000;
        }

        .brd-top {
            border-top: 0.3mm dashed #000;
        }

        .brd-double {
            border-bottom: 0.6mm double #000;
        }

        .logo {
            display: block;
            max-width: 22mm;
            max-height: 12mm;
            margin: 0 auto 1mm auto;
            filter: grayscale(1) contrast(1.4);
        }

        .brand-name {
            font-family: 'Playfair Display', 'Poppins', serif;
            font-weight: 800;
            letter-spacing: 0.3px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
            table-layout: fixed;
        }

        table td {
            vertical-align: top;
            padding: 0.4mm 0;
            font-weight: 600;
            word-wrap: break-word;
            line-height: 1.15;
        }

        .item-name {
            font-weight: 700;
            padding-top: 0.5mm;
        }

        .notice-box {
            font-size: 0.9em;
            font-weight: 600;
            text-align: center;
            margin-top: 1.5mm;
            line-height: 1.3em;
        }

        .thank-you {
            margin-top: 1mm;
            font-size: 1em;
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            font-style: italic;
        }

        .dots {
            letter-spacing: 2px;
        }

        @media print {
            @page {
                size: 48mm auto;
                margin: 0;
            }

            body {
                margin: 0;
            }
        }
    </style>
</head>

<body>
    <div class="container">

        <!-- Header Toko -->
        <img src="/assets/images/logo-brand-full.png" alt="{{ $brand_name }}" class="logo">

        <table>
            <tr>
                <td class="text-center text-bold brand-name big-font uppercase" colspan="2">
                    {{ $brand_name }}
                </td>
            </tr>
            @if($brand_address)
                <tr>
                    <td class="text-center small-font" colspan="2">
                        {{ $brand_address }}
                    </td>
                </tr>
            @endif
            <tr>
                <td class="text-center pb-1 brd-bottom small-font" colspan="2">
                    Telp/WA: {{ $brand_phone }}
                </td>
            </tr>

            <tr>
                <td class="text-center text-bold uppercase pt-1 pb-1 brd-bottom" colspan="2">
                    Rekap Penjualan
                </td>
            </tr>

            <!-- Info Rekap -->
            <tr>
                <td style="width: 32%;" class="pt-1">Dari :</td>
                <td class="text-right pt-1" style="white-space: nowrap;">
                    {{ \Carbon\Carbon::parse($period_start)->format('d/m/y H:i') }}
                </td>
            </tr>
            <tr>
                <td style="width: 32%;">Sampai :</td>
                <td class="text-right" style="white-space: nowrap;">
                    {{ \Carbon\Carbon::parse($summary->date)->format('d/m/y H:i') }}
                </td>
            </tr>
            <tr>
                <td style="width: 32%;" class="pb-1 brd-bottom">Kasir :</td>
                <td class="text-right pb-1 brd-bottom" style="white-space: nowrap;">
                    {{ $summary->creator?->nickname ?? $summary->creator?->name ?? '-' }}
                </td>
            </tr>

            <!-- Rincian per Metode Pembayaran -->
            <tr>
                <td class="text-bold uppercase small-font pt-1" colspan="2">Rincian Pembayaran</td>
            </tr>
            @forelse($grouped as $group)
                <tr>
                    <td colspan="2" class="item-name uppercase">
                        {{ $group['kind'] }}
                    </td>
                </tr>
                @foreach($group['items'] as $item)
                    <tr>
                        <td class="text-left small-font">
                            {{ $item->paymentMethod?->name ?? 'Lainnya' }}
                            <span class="tiny-font">({{ $item->total_transactions }} trx)</span>
                        </td>
                        <td class="text-right">
                            {{ number_format($item->total_amount, 0, ',', '.') }}
                        </td>
                    </tr>
                @endforeach
                @if(count($group['items']) > 1)
                    <tr>
                        <td class="text-left tiny-font" style="font-style: italic;">
                            Subtotal {{ $group['kind'] }}
                        </td>
                        <td class="text-right text-bold">
                            {{ number_format($group['total_amount'], 0, ',', '.') }}
                        </td>
                    </tr>
                @endif
            @empty
                <tr>
                    <td colspan="2" class="text-center small-font">Tidak ada transaksi</td>
                </tr>
            @endforelse

            <!-- Total -->
            <tr>
                <td colspan="2" class="pb-1 brd-bottom"></td>
            </tr>
            <tr>
                <td class="pt-1">Total Transaksi</td>
                <td class="text-right pt-1">{{ $summary->total_transactions }}</td>
            </tr>
            <tr>
                <td colspan="2" class="brd-double"></td>
            </tr>
            <tr>
                <td class="text-bold big-font pt-1">TOTAL</td>
                <td class="text-right text-bold big-font pt-1">
                    Rp {{ number_format($summary->total_sales, 0, ',', '.') }}
                </td>
            </tr>
        </table>

        <div class="notice-box brd-top pt-1">
            Dicetak {{ now()->format('d/m/y H:i') }}
        </div>
        <div class="brd-top" style="margin-top: 5mm;"></div>
        <div style="height: 5mm;"></div>
    </div>

    <script type="text/javascript">
        window.onload = function () {
            window.print();
            setTimeout(function () { window.close(); }, 100);
        }
    </script>
</body>

</html>
