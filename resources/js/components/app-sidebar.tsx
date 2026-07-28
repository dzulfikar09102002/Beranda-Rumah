import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    ScanBarcode,
    ShoppingCart,
    ShoppingBasket,
    Receipt,
    BarChart3,
    Package,
    Tags,
    Truck,
    CreditCard,
    Database,
    Boxes,
    PoundSterling,
    BadgePoundSterling,
    BaggageClaim,
    Calculator,
    NotebookPen,
    ClipboardList,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { dashboard } from '@/routes';
import paymentMethods from '@/routes/payment-methods';
import purchaseMethods from '@/routes/purchase-methods';
import products from '@/routes/products';
import categories from '@/routes/categories';
import suppliers from '@/routes/suppliers';
import purchases from '@/routes/purchases';
import reportsStocks from '@/routes/reportsStocks';
import sellings from '@/routes/sellings';
import salesSummary from '@/routes/sales-summary';
import cashLedgers from '@/routes/cash-ledgers';
import supplierCards from '@/routes/supplier-cards';
import stockCard from '@/routes/stock-card';
const mainNavItems = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutDashboard,
    },

    {
        title: 'Transaksi',
        icon: ScanBarcode,
        children: [
            {
                title: 'Barang Keluar',
                href: sellings.index().url,
                icon: ScanBarcode,
            },
            {
                title: 'Barang Masuk',
                href: purchases.index().url,
                icon: ShoppingBasket,
            },
        ],
    },

    {
        title: 'Monitoring',
        icon: BarChart3,
        children: [
            {
                title: 'Rekapan',
                href: salesSummary.index().url,
                icon: Calculator,
            },
            {
                title: 'Stok',
                href: reportsStocks.index().url,
                icon: Boxes,
            },
            {
                title: 'Kartu Supplier',
                href: supplierCards.index().url,
                icon: Truck,
            },
            {
                title: 'Keuangan',
                href: cashLedgers.index().url,
                icon: NotebookPen,
            },
            {
                title: 'Laba/Rugi',
                href: '/reports/laba-rugi',
                icon: BadgePoundSterling,
            },
        ],
    },

    {
        title: 'Laporan',
        icon: Receipt,
        children: [
            {
                title: 'Laporan Penjualan',
                href: '/reports/sales',
                icon: Receipt,
            },
            {
                title: 'Laporan Pembelian',
                href: '/reports/purchases',
                icon: ShoppingBasket,
            },
            {
                title: 'Kartu Stok',
                href: stockCard.index().url,
                icon: ClipboardList,
            },
        ],
    },

    {
        title: 'Master Data',
        icon: Database,
        children: [
            {
                title: 'Produk',
                href: products.index().url,
                icon: Package,
            },
            {
                title: 'Kategori',
                href: categories.index().url,
                icon: Tags,
            },
            {
                title: 'Supplier',
                href: suppliers.index().url,
                icon: Truck,
            },
            {
                title: 'Metode Pembayaran',
                href: paymentMethods.index().url,
                icon: CreditCard,
            },
            {
                title: 'Metode Pembelian',
                href: purchaseMethods.index().url,
                icon: BaggageClaim,
            },
        ],
    },
];
export function AppSidebar() {
    return (
        <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard().url} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
