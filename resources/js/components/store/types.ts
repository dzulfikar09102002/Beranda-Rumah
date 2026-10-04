export type StoreProduct = {
    id: number;
    name: string;
    brand: string | null;
    price: number;
    image: string | null;
    category_id: number;
    category: string | null;
    stock: number;
    sold: number;
    best_seller: boolean;
};

export type StoreCategory = {
    id: number;
    name: string | null;
    count: number;
};

export type StoreInfo = {
    name: string;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    location: string | null;
    order_prefix: string;
};

export type CartLine = {
    product: StoreProduct;
    quantity: number;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
