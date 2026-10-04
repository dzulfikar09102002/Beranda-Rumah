import {
    CheckCircle2,
    Clock,
    MapPin,
    ShoppingBasket,
    Store,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Overlay } from './overlay';
import { QuantityStepper } from './product-card';
import { ProductImage } from './product-image';
import type { StoreInfo } from './types';
import type { Cart } from './use-cart';
import { formatRupiah } from './utils';

const CUSTOMER_KEY = 'store-customer';

const pickupOptions = [
    { value: 'asap', label: 'Secepatnya', hint: '±15 menit' },
    { value: '30', label: '30 menit lagi', hint: '' },
    { value: '60', label: '1 jam lagi', hint: '' },
    { value: 'custom', label: 'Pilih jam', hint: '' },
] as const;

type Pickup = (typeof pickupOptions)[number]['value'];

type Customer = {
    name: string;
    pickup: Pickup;
    time: string;
    note: string;
};

type PlacedOrder = {
    number: string;
    url: string;
    total: number;
    count: number;
};

const emptyCustomer: Customer = {
    name: '',
    pickup: 'asap',
    time: '',
    note: '',
};

function readCustomer(): Customer {
    try {
        const raw = window.localStorage.getItem(CUSTOMER_KEY);

        return { ...emptyCustomer, ...(raw ? JSON.parse(raw) : {}) };
    } catch {
        return emptyCustomer;
    }
}

const pad = (value: number) => String(value).padStart(2, '0');

function orderNumber(prefix: string, date: Date): string {
    const stamp = `${String(date.getFullYear()).slice(2)}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
    const time = `${pad(date.getHours())}${pad(date.getMinutes())}`;
    const random = Math.floor(Math.random() * 90 + 10);

    return `${prefix}-${stamp}-${time}${random}`;
}

function clock(date: Date): string {
    return `${pad(date.getHours())}.${pad(date.getMinutes())}`;
}

function pickupLabel(customer: Customer, now: Date): string {
    switch (customer.pickup) {
        case 'asap':
            return `Secepatnya (±15 menit, sekitar pukul ${clock(new Date(now.getTime() + 15 * 60000))})`;
        case '30':
        case '60':
            return `Sekitar pukul ${clock(new Date(now.getTime() + Number(customer.pickup) * 60000))}`;
        default:
            return `Pukul ${customer.time.replace(':', '.')}`;
    }
}

function buildMessage(
    store: StoreInfo,
    cart: Cart,
    customer: Customer,
    number: string,
    now: Date,
): string {
    const divider = '━━━━━━━━━━━━━━━━━━━━';
    const date = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const items = cart.lines.map(
        ({ product, quantity }, index) =>
            `${index + 1}. ${product.name}\n     ${quantity} x ${formatRupiah(product.price)} = *${formatRupiah(quantity * product.price)}*`,
    );

    const sections = [
        [`*PESANAN BARU · ${store.name.toUpperCase()}*`, divider].join('\n'),
        [
            `No. Pesanan : *${number}*`,
            `Tanggal       : ${date}, ${clock(now)}`,
            `Atas Nama    : ${customer.name.trim()}`,
            `Pengambilan : Ambil di toko`,
            `Waktu Ambil : ${pickupLabel(customer, now)}`,
        ].join('\n'),
        ['*DETAIL PESANAN*', ...items].join('\n'),
        [
            divider,
            `Jumlah Item : ${cart.count} pcs`,
            `*TOTAL BAYAR : ${formatRupiah(cart.total)}*`,
            `Pembayaran   : Di toko saat pengambilan`,
            divider,
        ].join('\n'),
    ];

    if (customer.note.trim()) {
        sections.push(`*Catatan:*\n_${customer.note.trim()}_`);
    }

    sections.push(
        'Mohon konfirmasi ketersediaan pesanan di atas. Saya akan datang mengambil pesanan ke toko setelah pesanan dikonfirmasi.',
        'Terima kasih 🙏',
    );

    return sections.join('\n\n');
}

export function CartDrawer({
    open,
    onClose,
    cart,
    store,
    onBrowse,
}: {
    open: boolean;
    onClose: () => void;
    cart: Cart;
    store: StoreInfo;
    onBrowse: () => void;
}) {
    const [customer, setCustomer] = useState<Customer>(readCustomer);
    const [touched, setTouched] = useState(false);
    const [placed, setPlaced] = useState<PlacedOrder | null>(null);

    useEffect(() => {
        try {
            window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
        } catch {
            // ignore
        }
    }, [customer]);

    const nameMissing = customer.name.trim() === '';
    const timeMissing = customer.pickup === 'custom' && customer.time === '';

    const checkout = () => {
        setTouched(true);

        if (nameMissing || timeMissing) {
            toast.error(
                nameMissing
                    ? 'Isi nama pemesan dulu ya 🙂'
                    : 'Pilih jam pengambilan dulu ya.',
            );

            return;
        }

        if (!store.whatsapp) {
            toast.error('Nomor WhatsApp toko belum diatur.');

            return;
        }

        const now = new Date();
        const number = orderNumber(store.order_prefix, now);
        const text = buildMessage(store, cart, customer, number, now);
        const url = `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(text)}`;

        window.open(url, '_blank', 'noopener');
        setPlaced({ number, url, total: cart.total, count: cart.count });
    };

    const finish = () => {
        cart.clear();
        setPlaced(null);
        setTouched(false);
        setCustomer((current) => ({ ...current, note: '' }));
        onClose();
    };

    const field =
        'w-full rounded-2xl border-0 bg-white px-4 py-3 text-sm text-(--s-ink) shadow-sm ring-1 ring-(--s-ink)/10 transition outline-none placeholder:text-(--s-ink)/40 focus:ring-2 focus:ring-(--s-terra)';

    return (
        <Overlay
            open={open}
            onClose={onClose}
            variant="drawer"
            label="Keranjang"
        >
            {placed ? (
                <div className="store-stagger flex flex-1 flex-col items-center overflow-y-auto px-8 pt-16 pb-8 text-center">
                    <div className="relative mb-6">
                        <span className="store-pulse absolute inset-0 rounded-full" />
                        <CheckCircle2 className="store-pop relative h-20 w-20 rounded-full bg-[#25D366] p-3 text-white" />
                    </div>
                    <h2 className="font-display text-3xl font-semibold text-(--s-ink)">
                        Pesanan siap dikirim!
                    </h2>
                    <p className="mt-2 text-sm text-(--s-ink)/60">
                        Tekan <strong>kirim</strong> di WhatsApp agar pesananmu
                        kami proses.
                    </p>

                    <div className="mt-6 w-full rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-(--s-ink)/5">
                        <div className="flex justify-between text-sm">
                            <span className="text-(--s-ink)/50">
                                No. Pesanan
                            </span>
                            <span className="font-mono font-semibold text-(--s-ink)">
                                {placed.number}
                            </span>
                        </div>
                        <div className="mt-2 flex justify-between text-sm">
                            <span className="text-(--s-ink)/50">
                                Total ({placed.count} item)
                            </span>
                            <span className="font-semibold text-(--s-ink)">
                                {formatRupiah(placed.total)}
                            </span>
                        </div>
                        <div className="mt-4 border-t border-dashed border-(--s-ink)/15 pt-4">
                            <p className="mb-3 text-xs font-semibold tracking-wider text-(--s-terra) uppercase">
                                Langkah selanjutnya
                            </p>
                            <ol className="space-y-3 text-sm text-(--s-ink)/80">
                                <li className="flex gap-3">
                                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-(--s-sage)" />
                                    Tunggu konfirmasi dari kami via WhatsApp.
                                </li>
                                <li className="flex gap-3">
                                    <Store className="mt-0.5 h-4 w-4 shrink-0 text-(--s-sage)" />
                                    Datang ke toko, sebutkan nomor pesanan, lalu
                                    bayar di kasir.
                                </li>
                                {store.address && (
                                    <li className="flex gap-3">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-(--s-sage)" />
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="underline decoration-(--s-terra)/40 underline-offset-4 hover:text-(--s-terra)"
                                        >
                                            {store.address}
                                        </a>
                                    </li>
                                )}
                            </ol>
                        </div>
                    </div>

                    <a
                        href={placed.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#25D366]/30 transition hover:-translate-y-0.5"
                    >
                        <WhatsappIcon className="h-5 w-5" />
                        Buka WhatsApp lagi
                    </a>
                    <button
                        type="button"
                        onClick={finish}
                        className="mt-3 w-full rounded-full bg-(--s-ink) px-6 py-3.5 text-sm font-semibold text-(--s-cream) transition hover:-translate-y-0.5"
                    >
                        Selesai, kosongkan keranjang
                    </button>
                    <button
                        type="button"
                        onClick={() => setPlaced(null)}
                        className="mt-2 py-2 text-xs text-(--s-ink)/50 hover:text-(--s-ink)"
                    >
                        Ubah pesanan
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3 px-6 pt-6 pb-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-(--s-terra) text-white">
                            <ShoppingBasket className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl font-semibold text-(--s-ink)">
                                Keranjang
                            </h2>
                            <p className="text-xs text-(--s-ink)/60">
                                {cart.count} item · ambil di toko
                            </p>
                        </div>
                    </div>

                    {cart.lines.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                            <div className="store-float text-7xl">☕</div>
                            <p className="font-display text-xl font-semibold text-(--s-ink)">
                                Keranjangmu masih kosong
                            </p>
                            <p className="text-sm text-(--s-ink)/60">
                                Pilih kopi atau teh favoritmu, pesan lewat
                                WhatsApp, lalu tinggal ambil di toko.
                            </p>
                            <button
                                type="button"
                                onClick={onBrowse}
                                className="rounded-full bg-(--s-ink) px-6 py-3 text-sm font-semibold text-(--s-cream) transition hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Lihat menu
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 space-y-3 overflow-y-auto px-6 pb-4">
                                {cart.lines.map(
                                    ({ product, quantity }, index) => (
                                        <div
                                            key={product.id}
                                            className="store-slide-in flex gap-3 rounded-3xl bg-white p-3 shadow-sm ring-1 ring-(--s-ink)/5"
                                            style={{
                                                animationDelay: `${index * 40}ms`,
                                            }}
                                        >
                                            <ProductImage
                                                product={product}
                                                compact
                                                className="h-20 w-20 shrink-0 rounded-2xl"
                                            />
                                            <div className="flex min-w-0 flex-1 flex-col">
                                                <div className="flex items-start gap-2">
                                                    <p className="line-clamp-2 flex-1 text-sm font-semibold text-(--s-ink)">
                                                        {product.name}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        aria-label={`Hapus ${product.name}`}
                                                        onClick={() =>
                                                            cart.remove(product)
                                                        }
                                                        className="rounded-full p-1.5 text-(--s-ink)/40 transition hover:bg-red-50 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-(--s-ink)/50">
                                                    {formatRupiah(
                                                        product.price,
                                                    )}
                                                </p>
                                                <div className="mt-auto flex items-center justify-between pt-2">
                                                    <QuantityStepper
                                                        size="sm"
                                                        quantity={quantity}
                                                        max={product.stock}
                                                        onChange={(value) =>
                                                            cart.setQuantity(
                                                                product,
                                                                value,
                                                            )
                                                        }
                                                    />
                                                    <p className="text-sm font-bold text-(--s-ink)">
                                                        {formatRupiah(
                                                            quantity *
                                                                product.price,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}

                                <div className="space-y-3 pt-3">
                                    <p className="text-sm font-semibold text-(--s-ink)">
                                        Data pengambilan
                                    </p>
                                    <div>
                                        <input
                                            className={field}
                                            placeholder="Nama pemesan *"
                                            value={customer.name}
                                            onChange={(event) =>
                                                setCustomer({
                                                    ...customer,
                                                    name: event.target.value,
                                                })
                                            }
                                        />
                                        {touched && nameMissing && (
                                            <p className="store-shake mt-1 pl-2 text-xs text-red-500">
                                                Nama wajib diisi
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {pickupOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() =>
                                                    setCustomer({
                                                        ...customer,
                                                        pickup: option.value,
                                                    })
                                                }
                                                className={cn(
                                                    'rounded-2xl px-3 py-2.5 text-left text-sm ring-1 transition',
                                                    customer.pickup ===
                                                        option.value
                                                        ? 'bg-(--s-ink) text-(--s-cream) ring-(--s-ink)'
                                                        : 'bg-white text-(--s-ink) ring-(--s-ink)/10 hover:ring-(--s-terra)',
                                                )}
                                            >
                                                <span className="block font-semibold">
                                                    {option.label}
                                                </span>
                                                {option.hint && (
                                                    <span className="text-xs opacity-60">
                                                        {option.hint}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {customer.pickup === 'custom' && (
                                        <div className="store-fade-up">
                                            <input
                                                type="time"
                                                className={field}
                                                value={customer.time}
                                                onChange={(event) =>
                                                    setCustomer({
                                                        ...customer,
                                                        time: event.target
                                                            .value,
                                                    })
                                                }
                                            />
                                            {touched && timeMissing && (
                                                <p className="store-shake mt-1 pl-2 text-xs text-red-500">
                                                    Pilih jam pengambilan
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <textarea
                                        rows={2}
                                        className={field}
                                        placeholder="Catatan, mis. less sugar, es dipisah…"
                                        value={customer.note}
                                        onChange={(event) =>
                                            setCustomer({
                                                ...customer,
                                                note: event.target.value,
                                            })
                                        }
                                    />

                                    {store.address && (
                                        <p className="flex gap-2 rounded-2xl bg-(--s-sage)/10 px-4 py-3 text-xs text-(--s-ink)/70">
                                            <MapPin className="h-4 w-4 shrink-0 text-(--s-sage)" />
                                            <span>
                                                Ambil di{' '}
                                                <strong>{store.name}</strong>,{' '}
                                                {store.address}. Bayar di kasir
                                                saat pengambilan.
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-(--s-ink)/10 bg-white/70 px-6 pt-4 pb-6 backdrop-blur">
                                <div className="mb-4 flex items-end justify-between">
                                    <span className="text-sm text-(--s-ink)/60">
                                        Total
                                    </span>
                                    <span
                                        key={cart.total}
                                        className="store-pop font-display text-3xl font-bold text-(--s-ink)"
                                    >
                                        {formatRupiah(cart.total)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={checkout}
                                    className="store-shine flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 font-semibold text-white shadow-lg shadow-[#25D366]/40 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                                >
                                    <WhatsappIcon className="h-5 w-5" />
                                    Pesan via WhatsApp
                                </button>
                                <button
                                    type="button"
                                    onClick={cart.clear}
                                    className="mt-2 w-full py-2 text-xs text-(--s-ink)/50 transition hover:text-red-500"
                                >
                                    Kosongkan keranjang
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}
        </Overlay>
    );
}

export function WhatsappIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            aria-hidden
        >
            <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.01c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.67 2.77a9.37 9.37 0 0 1 2.76 6.68c0 5.2-4.24 9.43-9.46 9.43m8.04-17.47A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.67 12.07c0 2 .52 3.96 1.52 5.68L.57 23.7l6.08-1.6a11.33 11.33 0 0 0 5.4 1.38h.01c6.27 0 11.37-5.1 11.38-11.37 0-3.04-1.18-5.9-3.33-8.05" />
        </svg>
    );
}
