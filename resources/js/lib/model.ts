export interface PaymentMethod {
    id: number;
    name: string;
    kind: string;
}
export interface PurchaseMethod {
    id: number;
    name: string;
}
export interface Supplier {
    id: number;
    name: string;
    contact: string;
    address: string;
}
export type Pagination<T> = {
    data: T[];
    current_page: number;
    total: number;
    last_page: number;
    per_page: number;
    first_page_url: string;
    last_page_url: string;
    prev_page_url?: string;
    next_page_url?: string;
    path: string;
    links: {
        url?: string;
        label: string;
        active: boolean;
    }[];
};
export interface Category {
    id: number;
    name: string;
}
export interface GroupedSaleTransactionDetail {
    id: number;
    purchase_id: number;

    product_id: number;
    product_name: string;
    product_brand: string;

    code: string;

    quantity: number;

    purchase_price: number;
    selling_price: number;

    subtotal: number;
    adjustment: number;
}
export interface Product {
    id: number;
    category_id: number;
    category?: Category;
    minimum_stock?: number;
    name: string;
    brand: string;
    purchase_price: number;
    selling_price: number;
    has_expired: boolean;
    expired_date?: string | null;
    stock: ProductStock;
}
export interface ProductStock {
    id: number;
    stock: number;
}
export type Option = {
    value: string;
    label: string;
};
export interface Purchase {
    id: number;
    product_id: number;
    product?: Product;
    code: string;
    year: number;
    supplier_id: number;
    supplier?: Supplier;
    quantity: number;
    total_quantity: number;
    total_payment: number;
    purchase_price: number;
    selling_price: number;
    purchase_date: string;
    status_payment: PaymentStatus;
    expired_date: string | null;
    created_by: number;
    updated_by: number | null;
    deleted_by: number | null;
    created_at: string;
    updated_at: string | null;
    deleted_at: string | null;
    month: number;
    inventory_transactions: InventoryTransaction[];
}
export type PaymentStatus = 'pending' | 'paid' | 'canceled';

export interface SaleTransaction {
    id: number;
    invoice_number: string;
    payment_method_id: number;
    payment_method?: PaymentMethod;
    change: number;
    details: SaleTransactionDetail[];
    grouped_details?: GroupedSaleTransactionDetail[];
    purchasing_method: PurchaseMethod;
    payment_status: PaymentStatus;
    total_amount: number;
    grand_total: number;
    transaction_date: string;
    bulan: number;
    tahun: number;
    reason: string;
    profit: number;
}
export interface SalesSummaryDetail {
    id: number;
    sales_summary_id: number;
    payment_method_id: number;
    total_amount: number | string;
    total_transactions: number;
    payment_method?: {
        id: number;
        name: string;
        kind: string;
    };
}
export interface PaymentMethodSummary {
    payment_method_id: number;
    payment_method_name: string;
    payment_method_kind: string;
    total_transaksi: number;
    total_nominal: number;
}
export type SupplierCardProduct = {
    product_id: number;
    product_name: string;

    source: string;

    barang_masuk: number;
    barang_keluar: number;

    laku_paid: number;

    harga_beli: number;

    hutang: number;
};

export type SupplierCard = {
    // PARENT
    supplier_id: number;
    supplier_name: string;

    total_masuk: number;
    total_keluar: number;

    total_laku_paid: number;

    total_hutang: number;

    // CHILDREN
    products: SupplierCardProduct[];
};
export interface SalesSummary {
    total_transaksi: number;
    total_item: number;
    total_pendapatan: number;
    by_payment_method: PaymentMethodSummary[];
    pagination: Pagination<SaleTransaction>;
    total_profit: number;
    id: number;
    date: string;
    total_sales: number;
    total_transactions: number;
    details: SalesSummaryDetail[];
    created_by?: number | null;
    updated_by?: number | null;
    deleted_by?: number | null;

    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}
export interface SaleTransactionDetail {
    id: number;
    sale_transaction_id: number;
    purchase_id: number;
    purchase?: Purchase;
    quantity: number;
    purchase_price: number;
    selling_price: number;
    subtotal: number;
    adjustment: number;
    return_transaction?: InventoryTransaction[];
    sale_transaction?: SaleTransaction;
}

export interface Stock {
    id: number;
    name: string;
    brand: string;
    purchase_price: number;
    selling_price: number;
    total_in: number;
    total_out: number;
    stock: number;
    minimum_stock: number;
    first_in_transaction: InventoryTransaction;
    stock_source: string;
    stock_asset: number;
}
export interface InventoryTransaction {
    id: number;
    product_id: number;
    type: string;
    source: string;
    reference_id: number;
    quantity: number;
    purchase_price: number;
    selling_price: number;
    note?: string;
    product?: Product | null;
    purchase_reference?: Purchase | null;
    sale_reference?: SaleTransactionDetail | null;
    created_by?: number | null;
    updated_by?: number | null;
    deleted_by?: number | null;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
}
export interface LabaRugi {
    bulan: number;
    tahun: number;
    total_penjualan: number;
    total_pembelian: number;
    laba_rugi: number;
}

export type CashLedger = {
    id: number;
    transaction_date: string;
    type: 'in' | 'out';
    amount: number;
    description: string;
    category: string;
    sale?: any;
    purchase?: any;
    cash_flow_type: string;
};
