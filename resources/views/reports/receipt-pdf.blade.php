<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $sale->invoice_number }}</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            font-size: 12px;
            color: #000;
            margin: 0;
            padding: 0;
            background-color: #fff;
        }

        .container {
            width: 100%;
            max-width: 300px;
            margin: 0 auto;
            padding: 10px 12px;
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
            font-weight: bold;
        }

        .uppercase {
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .pb-1 {
            padding-bottom: 4px;
        }

        .pt-1 {
            padding-top: 4px;
        }

        .pb-2 {
            padding-bottom: 8px;
        }

        .pt-2 {
            padding-top: 8px;
        }

        .big-font {
            font-size: 1.2em;
        }

        .small-font {
            font-size: 0.82em;
        }

        .tiny-font {
            font-size: 0.75em;
        }

        .brd-bottom {
            border-bottom: 1px dashed #000;
        }

        .brd-top {
            border-top: 1px dashed #000;
        }

        .brd-double {
            border-bottom: 3px double #000;
        }

        .logo {
            display: block;
            max-width: 130px;
            max-height: 70px;
            margin: 0 auto 6px auto;
            filter: grayscale(1) contrast(1.2);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            border-spacing: 0;
        }

        table td {
            vertical-align: top;
            padding: 1.5px 0;
        }

        .item-name {
            font-weight: bold;
            padding-top: 3px;
        }

        .notice-box {
            font-size: 0.82em;
            text-align: center;
            margin-top: 10px;
            line-height: 1.4em;
        }

        .thank-you {
            margin-top: 8px;
            font-size: 0.95em;
            font-style: italic;
        }

        .dots {
            letter-spacing: 2px;
        }

        @media print {
            @page {
                margin: 0;
                size: auto;
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
                <td class="text-center text-bold big-font uppercase" colspan="2">
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
                <td class="text-center pb-2 brd-bottom small-font" colspan="2">
                    Telp/WA: {{ $brand_phone }}
                </td>
            </tr>

            <!-- Info Transaksi -->
            <tr>
                <td class="text-bold pt-2">No. Invoice</td>
                <td class="text-right text-bold pt-2">{{ $sale->invoice_number }}</td>
            </tr>
            <tr>
                <td>Tanggal</td>
                <td class="text-right">
                    {{ \Carbon\Carbon::parse($sale->transaction_date)->format('d/m/Y H:i') }}
                </td>
            </tr>
            <tr>
                <td class="pb-2 brd-bottom">Kasir</td>
                <td class="text-right pb-2 brd-bottom">{{ $sale->cashier ?? '-' }}</td>
            </tr>

            <!-- Daftar Item -->
            <tr>
                <td colspan="2" class="pt-1"></td>
            </tr>
            @foreach($details as $item)
                <tr>
                    <td colspan="2" class="item-name">
                        {{ $item->purchase?->product?->name ?? 'Produk' }}
                    </td>
                </tr>
                <tr>
                    <td class="text-left small-font">
                        {{ $item->quantity }} <span class="dots">x</span>
                        {{ number_format($item->selling_price, 0, ',', '.') }}
                    </td>
                    <td class="text-right text-bold">
                        {{ number_format($item->subtotal, 0, ',', '.') }}
                    </td>
                </tr>
                @if($item->adjustment > 0)
                    <tr>
                        <td class="text-left tiny-font" style="font-style: italic;">
                            (Diskon)
                        </td>
                        <td class="text-right tiny-font">
                            -{{ number_format($item->adjustment, 0, ',', '.') }}
                        </td>
                    </tr>
                @endif
            @endforeach

            <!-- Total Perhitungan -->
            <tr>
                <td colspan="2" class="pb-2 brd-bottom"></td>
            </tr>
            <tr>
                <td class="pt-1">Total Item</td>
                <td class="text-right pt-1">{{ $details->sum('quantity') }}</td>
            </tr>
            <tr>
                <td colspan="2" class="brd-double"></td>
            </tr>
            <tr>
                <td class="text-bold big-font pt-1">TOTAL</td>
                <td class="text-right text-bold big-font pt-1">
                    Rp {{ number_format($sale->grand_total, 0, ',', '.') }}
                </td>
            </tr>

            <!-- Pembayaran -->
            <tr>
                <td colspan="2" class="pb-2 pt-2 brd-bottom"></td>
            </tr>
            <tr>
                <td class="text-bold uppercase small-font" colspan="2">Pembayaran</td>
            </tr>
            <tr>
                <td>
                    {{ $sale->paymentMethod?->name ?? ucfirst($sale->payment_type ?? 'Tunai') }}
                </td>
                <td class="text-right">
                    Rp {{ number_format($sale->total_amount, 0, ',', '.') }}
                </td>
            </tr>
            @if($sale->change > 0)
                <tr>
                    <td>Kembalian</td>
                    <td class="text-right">
                        Rp {{ number_format($sale->change, 0, ',', '.') }}
                    </td>
                </tr>
            @endif

            <!-- Status -->
            <tr>
                <td colspan="2" class="pb-1 pt-2 brd-bottom"></td>
            </tr>
            <tr>
                <td colspan="2" class="text-center text-bold pt-2 big-font uppercase">
                    {{ $sale->payment_status === 'paid' ? 'LUNAS' : $sale->payment_status }}
                </td>
            </tr>
        </table>

        <!-- Catatan NB & Masa Konsumsi -->
        <div class="notice-box brd-top pt-2">
            @if(!empty($expired_day_span))
                <div class="text-bold expired-notice">
                    * Baik dikonsumsi sebelum
                    {{ \Carbon\Carbon::parse($sale->transaction_date)->addDays((int) $expired_day_span)->format('d/m/Y H:i') }}
                    *
                </div>
            @endif

            @if(!empty($invoice_note))
                <div style="margin-top: 4px;">
                    NB: {{ $invoice_note }}
                </div>
            @endif

            <div class="thank-you">
                Terima kasih sudah mampir ke {{ $brand_name }}☕
            </div>
        </div>
        <div style="height: 40px;"></div>
    </div>

    <script type="text/javascript">
        window.onload = function () {
            window.print();
            setTimeout(function () { window.close(); }, 100);
        }
    </script>
</body>

</html>