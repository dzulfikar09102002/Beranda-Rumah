<!DOCTYPE html>
<html lang="id">
    @php
    $namaBulan = [
        1 => 'Januari',
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
        'Desember'
    ];
@endphp
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/assets/images/logo-dharmawanita.png" type="image/png">
    <title>Laporan Laba Rugi</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 13px;
            color: #1a1a1a;
            background: #fff;
            padding: 40px;
        }

        .header {
            text-align: center;
            margin-bottom: 32px;
            padding-bottom: 20px;
            border-bottom: 3px double #1a1a1a;
        }

        .header .company-name {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 4px;
        }

        .header .report-title {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .header .report-period {
            font-size: 13px;
            color: #555;
        }

        .section {
            margin-bottom: 24px;
        }

        .section-title {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #555;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #ddd;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        table td {
            padding: 7px 4px;
            vertical-align: middle;
        }

        table td:last-child {
            text-align: right;
            font-weight: 500;
        }

        table tr {
            border-bottom: 1px solid #f0f0f0;
        }

        table tr:last-child {
            border-bottom: none;
        }

        .divider {
            border: none;
            border-top: 1px solid #ccc;
            margin: 20px 0;
        }

        .result-box {
            border: 2px solid #1a1a1a;
            border-radius: 4px;
            padding: 14px 16px;
            margin-top: 8px;
        }

        .result-box table td {
            padding: 4px;
            border-bottom: none;
        }

        .result-box .label {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .result-box .amount {
            font-size: 16px;
            font-weight: bold;
            text-align: right;
        }

        .amount-profit {
            color: #166534;
        }

        .amount-loss {
            color: #991b1b;
        }

        .badge {
            display: inline-block;
            font-size: 10px;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-profit {
            background: #dcfce7;
            color: #166534;
        }

        .badge-loss {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            margin-top: 48px;
            text-align: right;
            font-size: 12px;
            color: #888;
            border-top: 1px solid #eee;
            padding-top: 12px;
        }
    </style>
</head>
<body>

    {{-- HEADER --}}
    <div class="header">
        <div class="report-title">Laporan Laba Rugi</div>
        <div class="report-period">
            @if($type === 'month')
                Periode: {{ $namaBulan[$bulan] }} {{ $tahun }}
            @else
                Periode: Tahun {{ $tahun }}
            @endif
        </div>

        <div class="report-period">
              Dicetak pada: {{ now()->translatedFormat('d F Y') }}
        </div>        
    </div>

    {{-- PENDAPATAN --}}
    <div class="section">
        <div class="section-title">Pendapatan</div>
        <table>
            <tr>
                <td>Pendapatan Penjualan</td>
                <td>Rp {{ number_format($data['total_pendapatan'], 0, ',', '.') }}</td>
            </tr>
            <tr>
                <td>Piutang Terbayar</td>
                <td>Rp {{ number_format($data['total_pendapatan_piutang'], 0, ',', '.') }}</td>
            </tr>
            <tr style="font-weight: bold; background: #f9f9f9;">
                <td>Total Pendapatan</td>
                <td>Rp {{ number_format($data['total_pendapatan'] + $data['total_pendapatan_piutang'], 0, ',', '.') }}</td>
            </tr>
        </table>
    </div>

    {{-- PENGELUARAN --}}
    <div class="section">
        <div class="section-title">Pengeluaran</div>
        <table>
            <tr>
                <td>Total Pembelian</td>
                <td>Rp {{ number_format($data['total_pembelian'], 0, ',', '.') }}</td>
            </tr>

            <tr>
                <td>Utang Pembelian</td>
                <td>Rp {{ number_format($data['total_utang'], 0, ',', '.') }}</td>
            </tr>

            <tr style="font-weight: bold; background: #f9f9f9;">
                <td>Total Pengeluaran</td>
                <td>
                    Rp {{ number_format(
                        $data['total_pembelian'] + $data['total_utang'],
                        0, ',', '.'
                    ) }}
                </td>
            </tr>
        </table>
    </div>

    <hr class="divider">

    {{-- HASIL LABA / RUGI --}}
    <div class="section">
        <div class="section-title">Hasil Akhir</div>
        <div class="result-box">
            <table>
                <tr>
                    <td class="label">
                        @if($data['laba_rugi'] >= 0)
                            Laba Bersih
                            <span class="badge badge-profit">Untung</span>
                        @else
                            Rugi Bersih
                            <span class="badge badge-loss">Rugi</span>
                        @endif
                    </td>
                    <td class="amount {{ $data['laba_rugi'] >= 0 ? 'amount-profit' : 'amount-loss' }}">
                        @if($data['laba_rugi'] < 0)
                            (Rp {{ number_format(abs($data['laba_rugi']), 0, ',', '.') }})
                        @else
                            Rp {{ number_format($data['laba_rugi'], 0, ',', '.') }}
                        @endif
                    </td>
                </tr>
            </table>
        </div>
    </div>

    {{-- FOOTER --}}
    <div class="footer">
       
    </div>

</body>
</html>