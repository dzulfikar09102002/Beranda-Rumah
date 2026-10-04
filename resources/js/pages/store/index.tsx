import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUp,
    ArrowUpRight,
    Coffee,
    Loader2,
    MapPin,
    MessageCircleHeart,
    Phone,
    RefreshCw,
    Search,
    ShoppingCart,
    SlidersHorizontal,
    Store,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { CartDrawer, WhatsappIcon } from '@/components/store/cart-drawer';
import { flyToCart } from '@/components/store/fly-to-cart';
import { Hero } from '@/components/store/hero';
import { ProductCard } from '@/components/store/product-card';
import { ProductModal } from '@/components/store/product-modal';
import { Reveal } from '@/components/store/reveal';
import type {
    Paginated,
    StoreCategory,
    StoreInfo,
    StoreProduct,
} from '@/components/store/types';
import { useCart } from '@/components/store/use-cart';
import {
    useDebouncedValue,
    useProductFeed,
} from '@/components/store/use-product-feed';
import type { FeedFilters, Sort } from '@/components/store/use-product-feed';
import { emojiFor, formatRupiah } from '@/components/store/utils';
import { cn } from '@/lib/utils';
import { dashboard, login } from '@/routes';
import '../../../css/store.css';

const SLOGAN = 'Ngopi dan Ngeteh Ga Harus Mahal';

const sortOptions: { value: Sort; label: string }[] = [
    { value: 'popular', label: 'Terlaris' },
    { value: 'name', label: 'Nama A–Z' },
    { value: 'cheap', label: 'Harga terendah' },
    { value: 'expensive', label: 'Harga tertinggi' },
];

const steps = [
    {
        icon: Coffee,
        title: 'Pilih menu',
        desc: 'Cari kopi, teh, atau camilan favoritmu lalu masukkan ke keranjang.',
    },
    {
        icon: MessageCircleHeart,
        title: 'Kirim via WhatsApp',
        desc: 'Isi nama & jam ambil. Pesananmu tersusun rapi otomatis, tinggal kirim.',
    },
    {
        icon: Store,
        title: 'Ambil di toko',
        desc: 'Setelah kami konfirmasi, datang ke toko, sebutkan nomor pesanan & bayar di kasir.',
    },
];

function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function StoreIndex({
    store,
    featured,
    categories,
    productCount,
    minPrice,
    initialPage,
}: {
    store: StoreInfo;
    featured: StoreProduct[];
    categories: StoreCategory[];
    productCount: number;
    minPrice: number | null;
    initialPage: Paginated<StoreProduct>;
}) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };
    const cart = useCart();

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<number | null>(null);
    const [sort, setSort] = useState<Sort>('popular');
    const [cartOpen, setCartOpen] = useState(false);
    const [selected, setSelected] = useState<StoreProduct | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const progressRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    const debouncedSearch = useDebouncedValue(search, 300);
    const filters: FeedFilters = { search: debouncedSearch, category, sort };
    const feed = useProductFeed(initialPage, filters);
    const searching = feed.pending || search.trim() !== debouncedSearch.trim();

    useEffect(() => {
        const onScroll = () => {
            const max =
                document.documentElement.scrollHeight - window.innerHeight;
            setScrolled(window.scrollY > 24);

            if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
            }
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Infinite scroll: chain the next page request when the sentinel shows up.
    useEffect(() => {
        const sentinel = sentinelRef.current;

        if (!sentinel || !feed.hasMore || feed.error) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    feed.loadMore();
                }
            },
            { rootMargin: '600px' },
        );
        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [feed]);

    const addToCart = (
        product: StoreProduct,
        source: HTMLElement | null,
        quantity = 1,
    ) => {
        if (cart.quantityOf(product.id) + quantity > product.stock) {
            toast.warning(`Stok ${product.name} tinggal ${product.stock}`);

            return;
        }

        cart.add(product, quantity);
        flyToCart(source, emojiFor(product.category));
        toast.success(`${product.name} masuk keranjang`, {
            description: `${quantity} × ${formatRupiah(product.price)}`,
            action: { label: 'Lihat', onClick: () => setCartOpen(true) },
        });
    };

    const openProduct = (product: StoreProduct) => {
        setSelected(product);
        setModalOpen(true);
    };

    const pickCategory = (id: number | null) => {
        setCategory(id);
        scrollToId('menu');
    };

    const resetFilters = () => {
        setSearch('');
        setCategory(null);
        setSort('popular');
    };

    const related = selected
        ? [...featured, ...feed.items]
              .filter(
                  (product, index, all) =>
                      product.category_id === selected.category_id &&
                      product.id !== selected.id &&
                      product.stock > 0 &&
                      all.findIndex((item) => item.id === product.id) === index,
              )
              .slice(0, 4)
        : [];

    const mapsUrl = store.address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`
        : null;

    return (
        <div className="store-root min-h-screen font-sans antialiased">
            <Head title={SLOGAN}>
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    rel="stylesheet"
                    href="https://fonts.bunny.net/css?family=fraunces:500,600,700,500i,600i"
                />
                <meta
                    name="description"
                    content={`${store.name} — ${SLOGAN}. Pesan kopi & teh lewat WhatsApp, ambil langsung di toko.`}
                />
            </Head>

            <Toaster position="top-center" richColors closeButton />

            {/* ------------ navbar ------------ */}
            <header
                className={cn(
                    'fixed inset-x-0 top-0 z-50 transition-all duration-500',
                    scrolled ? 'py-2' : 'py-4',
                )}
            >
                <div
                    ref={progressRef}
                    className="absolute top-0 left-0 h-0.5 w-full origin-left bg-gradient-to-r from-(--s-honey) via-(--s-terra) to-(--s-sage)"
                    style={{ transform: 'scaleX(0)' }}
                />
                <nav
                    className={cn(
                        'mx-auto flex max-w-7xl items-center gap-4 rounded-full px-4 py-2 transition-all duration-500 sm:px-6',
                        scrolled
                            ? 'mx-3 bg-white/75 shadow-(--s-ink)/5 shadow-lg ring-1 ring-(--s-ink)/5 backdrop-blur-xl sm:mx-auto'
                            : 'bg-transparent',
                    )}
                >
                    <button
                        type="button"
                        onClick={() =>
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                        }
                        className="group flex items-center gap-2.5"
                    >
                        <img
                            src="/assets/images/logo-brand2.png"
                            alt=""
                            className="h-9 w-9 rounded-full object-contain transition-transform duration-500 group-hover:rotate-[360deg]"
                        />
                        <span className="text-left leading-tight">
                            <span className="font-display block text-xl font-semibold text-(--s-ink)">
                                {store.name}
                            </span>
                            <span className="hidden text-[10px] font-semibold tracking-[0.2em] text-(--s-terra) uppercase sm:block">
                                Coffee &amp; Tea
                            </span>
                        </span>
                    </button>

                    <div className="ml-auto hidden items-center gap-1 text-sm font-medium md:flex">
                        {[
                            ['menu', 'Menu'],
                            ['cara-pesan', 'Cara Pesan'],
                            ['kontak', 'Lokasi'],
                        ].map(([id, label]) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => scrollToId(id)}
                                className="group relative px-4 py-2 text-(--s-ink)/70 transition hover:text-(--s-ink)"
                            >
                                {label}
                                <span className="absolute inset-x-4 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-(--s-terra) transition-transform duration-300 group-hover:scale-x-100" />
                            </button>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-2 md:ml-2">
                        
                        <button
                            id="store-cart-button"
                            type="button"
                            onClick={() => setCartOpen(true)}
                            aria-label="Buka keranjang"
                            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-(--s-ink) text-(--s-cream) shadow-(--s-ink)/20 shadow-lg transition hover:scale-105"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cart.count > 0 && (
                                <span
                                    key={cart.count}
                                    className="store-pop absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-(--s-terra) px-1 text-[11px] font-bold text-white ring-2 ring-(--s-cream)"
                                >
                                    {cart.count}
                                </span>
                            )}
                        </button>
                    </div>
                </nav>
            </header>

            <main>
                <Hero
                    store={store}
                    featured={featured}
                    productCount={productCount}
                    categoryCount={categories.length}
                    cheapest={minPrice}
                    onShop={() => scrollToId('menu')}
                    onOpen={openProduct}
                />

                {/* ------------ slogan + category marquee ------------ */}
                <section className="relative -rotate-1 border-y border-(--s-ink)/10 bg-(--s-ink) py-5 text-(--s-cream)">
                    <div className="flex overflow-hidden">
                        <div className="store-marquee flex shrink-0 items-center gap-3 pr-3">
                            {[0, 1].map((loop) => (
                                <div
                                    key={loop}
                                    className="flex shrink-0 items-center gap-3"
                                    aria-hidden={loop === 1}
                                >
                                    <span className="font-display px-4 text-xl whitespace-nowrap text-(--s-honey) italic">
                                        ☕ {SLOGAN} 🍵
                                    </span>
                                    {categories.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            tabIndex={loop === 1 ? -1 : 0}
                                            onClick={() =>
                                                pickCategory(item.id)
                                            }
                                            className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-sm font-medium whitespace-nowrap transition hover:border-(--s-honey) hover:bg-white/10 hover:text-(--s-honey)"
                                        >
                                            <span className="text-lg">
                                                {emojiFor(item.name)}
                                            </span>
                                            {item.name}
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ------------ menu ------------ */}
                <section id="menu" className="scroll-mt-20 pt-24 pb-16">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Reveal className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <p className="mb-2 text-sm font-semibold tracking-[0.25em] text-(--s-terra) uppercase">
                                    Menu kami
                                </p>
                                <h2 className="font-display text-4xl font-semibold text-(--s-ink) sm:text-5xl">
                                    Pilih racikan{' '}
                                    <em className="text-(--s-sage)">
                                        favoritmu
                                    </em>
                                </h2>
                            </div>
                            <p className="max-w-sm text-(--s-ink)/60">
                                Harga bersahabat, rasa juara. Klik menu untuk
                                detail atau langsung tambahkan ke keranjang.
                            </p>
                        </Reveal>

                        {/* toolbar */}
                        <div className="sticky top-20 z-30 -mx-4 mb-8 px-4 sm:mx-0 sm:px-0">
                            <div className="rounded-[1.75rem] bg-white/80 p-3 shadow-(--s-ink)/5 shadow-lg ring-1 ring-(--s-ink)/5 backdrop-blur-xl">
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    <label className="group relative flex-1">
                                        <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-(--s-ink)/40 transition group-focus-within:scale-110 group-focus-within:text-(--s-terra)" />
                                        <input
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Cari kopi, teh, latte…"
                                            className="w-full rounded-full border-0 bg-(--s-cream) py-3 pr-16 pl-11 text-sm text-(--s-ink) ring-1 ring-transparent transition outline-none placeholder:text-(--s-ink)/40 focus:bg-white focus:ring-(--s-terra)"
                                        />
                                        <span className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
                                            {searching && (
                                                <Loader2 className="h-4 w-4 animate-spin text-(--s-terra)" />
                                            )}
                                            {search && (
                                                <button
                                                    type="button"
                                                    aria-label="Hapus pencarian"
                                                    onClick={() =>
                                                        setSearch('')
                                                    }
                                                    className="rounded-full p-1 text-(--s-ink)/50 hover:bg-(--s-ink)/5"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </span>
                                    </label>
                                    <label className="relative flex items-center gap-2 rounded-full bg-(--s-cream) px-4 text-sm text-(--s-ink)">
                                        <SlidersHorizontal className="h-4 w-4 text-(--s-ink)/50" />
                                        <select
                                            value={sort}
                                            onChange={(event) =>
                                                setSort(
                                                    event.target.value as Sort,
                                                )
                                            }
                                            className="cursor-pointer appearance-none bg-transparent py-3 pr-2 font-medium outline-none"
                                        >
                                            {sortOptions.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div className="store-scrollbar-none mt-3 flex gap-2 overflow-x-auto">
                                    {[
                                        {
                                            id: null,
                                            name: 'Semua',
                                            count: productCount,
                                        },
                                        ...categories,
                                    ].map((item) => {
                                        const active = category === item.id;

                                        return (
                                            <button
                                                key={item.id ?? 'all'}
                                                type="button"
                                                onClick={() =>
                                                    setCategory(item.id)
                                                }
                                                // warm the cache so the click feels instant
                                                onMouseEnter={() =>
                                                    feed.prefetch({
                                                        ...filters,
                                                        category: item.id,
                                                    })
                                                }
                                                className={cn(
                                                    'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-300',
                                                    active
                                                        ? 'bg-(--s-ink) text-(--s-cream) shadow-md'
                                                        : 'bg-(--s-cream) text-(--s-ink)/70 hover:bg-(--s-sand) hover:text-(--s-ink)',
                                                )}
                                            >
                                                {item.id !== null && (
                                                    <span>
                                                        {emojiFor(item.name)}
                                                    </span>
                                                )}
                                                {item.name}
                                                <span
                                                    className={cn(
                                                        'rounded-full px-1.5 text-[11px]',
                                                        active
                                                            ? 'bg-white/15'
                                                            : 'bg-(--s-ink)/5',
                                                    )}
                                                >
                                                    {item.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {feed.error && feed.items.length === 0 ? (
                            <div className="flex flex-col items-center py-24 text-center">
                                <div className="mb-4 text-6xl">😵‍💫</div>
                                <p className="font-display text-2xl font-semibold text-(--s-ink)">
                                    {feed.error}
                                </p>
                                <button
                                    type="button"
                                    onClick={feed.retry}
                                    className="mt-6 flex items-center gap-2 rounded-full bg-(--s-ink) px-6 py-3 text-sm font-semibold text-(--s-cream)"
                                >
                                    <RefreshCw className="h-4 w-4" /> Coba lagi
                                </button>
                            </div>
                        ) : !feed.pending && feed.total === 0 ? (
                            <div className="flex flex-col items-center py-24 text-center">
                                <div className="store-float mb-4 text-7xl">
                                    🔍
                                </div>
                                <p className="font-display text-2xl font-semibold text-(--s-ink)">
                                    Menu tidak ditemukan
                                </p>
                                <p className="mt-2 text-(--s-ink)/60">
                                    Coba kata kunci lain atau pilih kategori
                                    berbeda.
                                </p>
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="mt-6 rounded-full bg-(--s-ink) px-6 py-3 text-sm font-semibold text-(--s-cream) transition hover:-translate-y-0.5"
                                >
                                    Reset filter
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 flex items-center justify-between gap-4 text-sm text-(--s-ink)/50">
                                    <p>
                                        Menampilkan{' '}
                                        <strong className="text-(--s-ink)">
                                            {feed.items.length}
                                        </strong>{' '}
                                        dari {feed.total} menu
                                    </p>
                                    <p className="hidden sm:block">
                                        Halaman {feed.page} / {feed.lastPage}
                                    </p>
                                </div>
                                <div className="mb-6 h-1 overflow-hidden rounded-full bg-(--s-ink)/5">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-(--s-honey) to-(--s-terra) transition-all duration-700"
                                        style={{
                                            width: `${feed.total ? (feed.items.length / feed.total) * 100 : 0}%`,
                                        }}
                                    />
                                </div>

                                <div
                                    className={cn(
                                        'grid grid-cols-2 gap-3 transition-opacity duration-300 sm:gap-5 md:grid-cols-3 lg:grid-cols-4',
                                        feed.pending &&
                                            'pointer-events-none opacity-40',
                                    )}
                                >
                                    {feed.items.map((product, index) => (
                                        <Reveal
                                            key={product.id}
                                            delay={(index % 4) * 70}
                                        >
                                            <ProductCard
                                                product={product}
                                                quantity={cart.quantityOf(
                                                    product.id,
                                                )}
                                                bestSeller={product.best_seller}
                                                onAdd={(item, source) =>
                                                    addToCart(item, source)
                                                }
                                                onQuantity={cart.setQuantity}
                                                onOpen={openProduct}
                                            />
                                        </Reveal>
                                    ))}
                                </div>

                                {feed.hasMore && (
                                    <div ref={sentinelRef} className="mt-10">
                                        {feed.loadingMore ? (
                                            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                                                {Array.from(
                                                    { length: 4 },
                                                    (_, index) => (
                                                        <div
                                                            key={index}
                                                            className="store-shimmer aspect-[3/4] rounded-3xl"
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={feed.loadMore}
                                                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-(--s-ink) shadow-sm ring-1 ring-(--s-ink)/10 transition hover:-translate-y-0.5 hover:shadow-lg"
                                                >
                                                    Muat menu lainnya
                                                </button>
                                                {feed.error && (
                                                    <p className="text-xs text-red-500">
                                                        {feed.error}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!feed.hasMore &&
                                    feed.items.length > 0 &&
                                    !feed.pending && (
                                        <p className="mt-12 text-center text-sm text-(--s-ink)/40">
                                            ☕ Semua menu sudah ditampilkan
                                        </p>
                                    )}
                            </>
                        )}
                    </div>
                </section>

                {/* ------------ how to order ------------ */}
                <section id="cara-pesan" className="scroll-mt-20 py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
                            <p className="mb-2 text-sm font-semibold tracking-[0.25em] text-(--s-terra) uppercase">
                                Cara pesan
                            </p>
                            <h2 className="font-display text-4xl font-semibold text-(--s-ink) sm:text-5xl">
                                Pesan dari HP, ambil tanpa antre
                            </h2>
                            <p className="mt-4 text-(--s-ink)/60">
                                Tidak perlu daftar akun. Pesanan dikirim lewat
                                WhatsApp dan siap diambil di toko.
                            </p>
                        </Reveal>
                        <div className="relative grid gap-6 md:grid-cols-3">
                            <div className="absolute top-12 right-[16%] left-[16%] hidden h-px border-t-2 border-dashed border-(--s-ink)/15 md:block" />
                            {steps.map((step, index) => (
                                <Reveal key={step.title} delay={index * 150}>
                                    <div className="group relative h-full rounded-[2rem] bg-white p-8 text-center shadow-sm ring-1 ring-(--s-ink)/5 transition duration-500 hover:-translate-y-2 hover:shadow-xl">
                                        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-(--s-cream) transition duration-500 group-hover:bg-(--s-terra)">
                                            <step.icon className="h-10 w-10 text-(--s-terra) transition duration-500 group-hover:scale-110 group-hover:-rotate-12 group-hover:text-white" />
                                            <span className="font-display absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-(--s-ink) text-sm font-bold text-(--s-honey)">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <h3 className="font-display text-2xl font-semibold text-(--s-ink)">
                                            {step.title}
                                        </h3>
                                        <p className="mt-2 text-(--s-ink)/60">
                                            {step.desc}
                                        </p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>

                        {store.address && (
                            <Reveal
                                delay={200}
                                className="mx-auto mt-10 max-w-3xl"
                            >
                                <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-(--s-sage)/10 p-6 text-center sm:flex-row sm:text-left">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-(--s-sage) text-white">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-semibold tracking-wider text-(--s-sage) uppercase">
                                            Lokasi pengambilan
                                        </p>
                                        <p className="font-semibold text-(--s-ink)">
                                            {store.name} · {store.address}
                                        </p>
                                    </div>
                                    {mapsUrl && (
                                        <a
                                            href={mapsUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-1 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-(--s-ink) shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                        >
                                            Buka Maps
                                            <ArrowUpRight className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            </Reveal>
                        )}
                    </div>
                </section>

                {/* ------------ CTA ------------ */}
                <section className="px-4 pb-24 sm:px-6 lg:px-8">
                    <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-(--s-ink) px-8 py-16 text-center text-(--s-cream) sm:px-16">
                        <div className="store-blob absolute -top-20 -left-20 h-72 w-72 rounded-full bg-(--s-terra)/40 blur-3xl" />
                        <div className="store-blob absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-(--s-honey)/30 blur-3xl [animation-delay:-6s]" />
                        <div className="relative">
                            <p className="mb-4 text-5xl">☕🍵</p>
                            <h2 className="font-display text-4xl font-semibold sm:text-5xl">
                                Ngopi &amp; ngeteh enak{' '}
                                <em className="text-(--s-honey)">
                                    ga harus mahal.
                                </em>
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-white/70">
                                Bingung pilih menu atau mau pesan dalam jumlah
                                banyak? Chat kami langsung, kami bantu siapkan.
                            </p>
                            {store.whatsapp && (
                                <a
                                    href={`https://wa.me/${store.whatsapp}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="store-shine mt-8 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 font-semibold text-white shadow-xl shadow-[#25D366]/30 transition hover:-translate-y-1"
                                >
                                    <WhatsappIcon className="h-5 w-5" />
                                    Chat WhatsApp
                                    <ArrowUpRight className="h-4 w-4" />
                                </a>
                            )}
                        </div>
                    </Reveal>
                </section>
            </main>

            {/* ------------ footer ------------ */}
            <footer
                id="kontak"
                className="border-t border-(--s-ink)/10 bg-(--s-sand)/60"
            >
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
                    <div>
                        <p className="font-display text-3xl font-semibold text-(--s-ink)">
                            {store.name}
                        </p>
                        <p className="font-display mt-2 text-lg text-(--s-terra) italic">
                            {SLOGAN}.
                        </p>
                    </div>
                    <div className="space-y-3 text-sm text-(--s-ink)/70">
                        <p className="font-semibold text-(--s-ink)">
                            Ambil pesanan di
                        </p>
                        {store.address && (
                            <a
                                href={mapsUrl ?? undefined}
                                target="_blank"
                                rel="noreferrer"
                                className="flex gap-2 hover:text-(--s-terra)"
                            >
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-(--s-terra)" />
                                {store.address}
                            </a>
                        )}
                        {store.phone && (
                            <a
                                href={
                                    store.whatsapp
                                        ? `https://wa.me/${store.whatsapp}`
                                        : undefined
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="flex gap-2 hover:text-(--s-terra)"
                            >
                                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-(--s-terra)" />
                                {store.phone}
                            </a>
                        )}
                    </div>
                    <div className="space-y-3 text-sm">
                        <p className="font-semibold text-(--s-ink)">
                            Kategori populer
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {categories.slice(0, 6).map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => pickCategory(item.id)}
                                    className="rounded-full bg-white px-3 py-1.5 text-(--s-ink)/70 ring-1 ring-(--s-ink)/5 transition hover:-translate-y-0.5 hover:text-(--s-terra)"
                                >
                                    {item.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <p className="border-t border-(--s-ink)/10 py-6 text-center text-xs text-(--s-ink)/50">
                    © {new Date().getFullYear()} {store.name} · Coffee &amp; Tea
                    {store.location && ` · ${store.location}`}
                </p>
            </footer>

            {/* ------------ floating actions ------------ */}
            {store.whatsapp && (
                <a
                    href={`https://wa.me/${store.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Chat WhatsApp"
                    className={cn(
                        'store-pulse fixed left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-500 hover:scale-110 sm:left-6',
                        cart.count > 0 ? 'bottom-24 sm:bottom-6' : 'bottom-6',
                    )}
                >
                    <WhatsappIcon className="h-7 w-7" />
                </a>
            )}

            <button
                type="button"
                aria-label="Kembali ke atas"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={cn(
                    'fixed right-4 z-40 hidden h-12 w-12 items-center justify-center rounded-full bg-white text-(--s-ink) shadow-xl ring-1 ring-(--s-ink)/10 transition-all duration-500 hover:-translate-y-1 sm:right-6 sm:bottom-6 sm:flex',
                    scrolled
                        ? 'translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-6 opacity-0',
                )}
            >
                <ArrowUp className="h-5 w-5" />
            </button>

            <div
                className={cn(
                    'fixed inset-x-3 bottom-3 z-40 transition-all duration-500 sm:hidden',
                    cart.count > 0
                        ? 'translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-24 opacity-0',
                )}
            >
                <button
                    type="button"
                    onClick={() => setCartOpen(true)}
                    className="flex w-full items-center gap-3 rounded-full bg-(--s-ink) py-2 pr-2 pl-5 text-(--s-cream) shadow-2xl"
                >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-sm">
                        <strong>{cart.count}</strong> item
                    </span>
                    <span className="ml-auto rounded-full bg-(--s-terra) px-5 py-3 text-sm font-bold">
                        {formatRupiah(cart.total)}
                    </span>
                </button>
            </div>

            <ProductModal
                product={selected}
                open={modalOpen}
                inCart={selected ? cart.quantityOf(selected.id) : 0}
                related={related}
                onClose={() => setModalOpen(false)}
                onSelect={setSelected}
                onAdd={(product, quantity, source) => {
                    addToCart(product, source, quantity);
                    setModalOpen(false);
                }}
            />

            <CartDrawer
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                cart={cart}
                store={store}
                onBrowse={() => {
                    setCartOpen(false);
                    scrollToId('menu');
                }}
            />
        </div>
    );
}
