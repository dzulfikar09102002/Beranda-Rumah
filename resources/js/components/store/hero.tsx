import { ArrowDown, Coffee } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { WhatsappIcon } from './cart-drawer';
import { ProductImage } from './product-image';
import { CountUp } from './reveal';
import type { StoreInfo, StoreProduct } from './types';
import { formatRupiah } from './utils';

const headline: { text: string; className?: string; br?: boolean }[] = [
    { text: 'Ngopi' },
    { text: 'dan' },
    { text: 'Ngeteh', br: true },
    { text: 'Ga', className: 'italic text-(--s-terra)' },
    { text: 'Harus', className: 'italic text-(--s-terra)', br: true },
    { text: 'Mahal.', className: 'store-underline' },
];

function Steam() {
    return (
        <svg
            viewBox="0 0 60 50"
            className="h-12 w-14 text-(--s-ink)/30"
            fill="none"
            aria-hidden
        >
            {[12, 30, 48].map((x, index) => (
                <path
                    key={x}
                    d={`M${x} 48 C ${x - 8} 36, ${x + 8} 26, ${x} 14 S ${x - 6} 4, ${x} 0`}
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="store-steam"
                    style={{ animationDelay: `${index * 0.6}s` }}
                />
            ))}
        </svg>
    );
}

function ProductDeck({
    products,
    onOpen,
}: {
    products: StoreProduct[];
    onOpen: (product: StoreProduct) => void;
}) {
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (paused || products.length < 2) {
            return;
        }

        const timer = window.setInterval(
            () => setActive((current) => (current + 1) % products.length),
            2800,
        );

        return () => window.clearInterval(timer);
    }, [paused, products.length]);

    if (products.length === 0) {
        return null;
    }

    return (
        <div
            className="relative mx-auto h-[360px] w-[260px] sm:h-[420px] sm:w-[300px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {products.map((product, index) => {
                const offset =
                    (index - active + products.length) % products.length;
                const visible = offset < 3;

                return (
                    <button
                        key={product.id}
                        type="button"
                        onClick={() =>
                            offset === 0 ? onOpen(product) : setActive(index)
                        }
                        className="absolute inset-0 flex flex-col rounded-[2rem] bg-white p-3 text-left shadow-[0_30px_60px_-25px_rgba(42,26,18,0.5)] transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
                        style={{
                            zIndex: products.length - offset,
                            opacity: visible ? 1 - offset * 0.2 : 0,
                            transform: `translate(${offset * 26}px, ${offset * -14}px) rotate(${offset * 6}deg) scale(${1 - offset * 0.06})`,
                            pointerEvents: visible ? 'auto' : 'none',
                        }}
                    >
                        <ProductImage
                            product={product}
                            className="aspect-square w-full rounded-[1.5rem]"
                        />
                        <div className="flex flex-1 flex-col justify-center px-2 pt-3">
                            <p className="text-[11px] font-semibold tracking-wider text-(--s-sage) uppercase">
                                {product.category}
                            </p>
                            <p className="line-clamp-1 font-semibold text-(--s-ink)">
                                {product.name}
                            </p>
                            <p className="font-display text-lg font-bold text-(--s-terra)">
                                {formatRupiah(product.price)}
                            </p>
                        </div>
                    </button>
                );
            })}

            <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 gap-1.5">
                {products.map((product, index) => (
                    <button
                        key={product.id}
                        type="button"
                        aria-label={`Tampilkan ${product.name}`}
                        onClick={() => setActive(index)}
                        className={`h-2 rounded-full transition-all duration-500 ${index === active ? 'w-6 bg-(--s-terra)' : 'w-2 bg-(--s-ink)/20'}`}
                    />
                ))}
            </div>
        </div>
    );
}

export function Hero({
    store,
    featured,
    productCount,
    categoryCount,
    cheapest,
    onShop,
    onOpen,
}: {
    store: StoreInfo;
    featured: StoreProduct[];
    productCount: number;
    categoryCount: number;
    cheapest: number | null;
    onShop: () => void;
    onOpen: (product: StoreProduct) => void;
}) {
    const heroRef = useRef<HTMLElement>(null);

    const handleMove = (event: MouseEvent<HTMLElement>) => {
        const hero = heroRef.current;

        if (!hero) {
            return;
        }

        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        hero.style.setProperty('--mx', x.toFixed(3));
        hero.style.setProperty('--my', y.toFixed(3));
    };

    return (
        <section
            ref={heroRef}
            onMouseMove={handleMove}
            className="relative isolate overflow-hidden pt-28 pb-24 sm:pt-36"
        >
            <div className="store-dots absolute inset-0 -z-10 opacity-60" />
            <div className="store-parallax-1 store-blob absolute -top-24 -left-24 -z-10 h-96 w-96 rounded-full bg-(--s-honey)/45 blur-3xl" />
            <div className="store-parallax-2 store-blob absolute top-40 right-[-6rem] -z-10 h-[28rem] w-[28rem] rounded-full bg-(--s-terra)/30 blur-3xl [animation-delay:-4s]" />
            <div className="store-parallax-1 store-blob absolute bottom-0 left-1/3 -z-10 h-72 w-72 rounded-full bg-(--s-sage)/30 blur-3xl [animation-delay:-8s]" />

            <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:px-8">
                <div>
                    <div className="store-fade-up mb-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-(--s-ink) shadow-sm ring-1 ring-(--s-ink)/5 backdrop-blur">
                        <Coffee className="h-3.5 w-3.5 text-(--s-terra)" />
                        Coffee &amp; Tea · {store.location ?? store.name}
                    </div>

                    <h1 className="font-display text-5xl leading-[1.02] font-semibold tracking-tight text-(--s-ink) sm:text-6xl lg:text-7xl">
                        {headline.map((word, index) => (
                            <span key={word.text}>
                                <span className="inline-block overflow-hidden pb-2 align-bottom">
                                    <span
                                        className={`store-word inline-block ${word.className ?? ''}`}
                                        style={{
                                            // the underlined word runs a second animation after it lands
                                            animationDelay:
                                                word.className?.includes(
                                                    'store-underline',
                                                )
                                                    ? `${150 + index * 110}ms, ${750 + index * 110}ms`
                                                    : `${150 + index * 110}ms`,
                                        }}
                                    >
                                        {word.text}
                                    </span>
                                    &nbsp;
                                </span>
                                {word.br && <br />}
                            </span>
                        ))}
                    </h1>

                    <p
                        className="store-fade-up mt-6 max-w-lg text-lg leading-relaxed text-(--s-ink)/70"
                        style={{ animationDelay: '900ms' }}
                    >
                        Racikan kopi &amp; teh favoritmu di{' '}
                        <strong className="text-(--s-ink)">{store.name}</strong>
                        {cheapest !== null && (
                            <>
                                {' '}
                                mulai{' '}
                                <strong className="text-(--s-terra)">
                                    {formatRupiah(cheapest)}
                                </strong>
                            </>
                        )}
                        . Pesan lewat WhatsApp, tinggal ambil di toko tanpa
                        antre.
                    </p>

                    <div
                        className="store-fade-up mt-8 flex flex-wrap gap-3"
                        style={{ animationDelay: '1050ms' }}
                    >
                        <button
                            type="button"
                            onClick={onShop}
                            className="store-shine group flex items-center gap-2 rounded-full bg-(--s-ink) px-7 py-4 font-semibold text-(--s-cream) shadow-(--s-ink)/20 shadow-xl transition hover:-translate-y-1"
                        >
                            <Coffee className="h-4 w-4 text-(--s-honey)" />
                            Lihat Menu
                            <ArrowDown className="h-4 w-4 transition group-hover:translate-y-1" />
                        </button>
                        {store.whatsapp && (
                            <a
                                href={`https://wa.me/${store.whatsapp}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-full bg-white px-7 py-4 font-semibold text-(--s-ink) shadow-sm ring-1 ring-(--s-ink)/10 transition hover:-translate-y-1 hover:shadow-lg"
                            >
                                <WhatsappIcon className="h-5 w-5 text-[#25D366]" />
                                Tanya dulu
                            </a>
                        )}
                    </div>

                    <dl
                        className="store-fade-up mt-12 grid max-w-md grid-cols-3 gap-6"
                        style={{ animationDelay: '1200ms' }}
                    >
                        {[
                            {
                                label: 'Pilihan menu',
                                value: productCount,
                                suffix: '+',
                            },
                            {
                                label: 'Kategori',
                                value: categoryCount,
                                suffix: '',
                            },
                            {
                                label: 'Menit siap ambil',
                                value: 15,
                                suffix: '',
                            },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <dt className="text-xs font-medium tracking-wide text-(--s-ink)/50 uppercase">
                                    {stat.label}
                                </dt>
                                <dd className="font-display text-3xl font-bold text-(--s-ink)">
                                    {stat.label.startsWith('Menit') && '±'}
                                    <CountUp value={stat.value} />
                                    {stat.suffix}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div
                    className="store-fade-up relative pb-12"
                    style={{ animationDelay: '500ms' }}
                >
                    <div className="store-spin-slow absolute top-1/2 left-1/2 -z-10 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-(--s-ink)/10" />
                    <div className="absolute -top-12 left-1/2 z-20 -translate-x-1/2">
                        <Steam />
                    </div>
                    <span className="store-parallax-1 store-float absolute top-4 left-2 z-20 text-5xl sm:left-10">
                        ☕
                    </span>
                    <span className="store-parallax-2 store-float absolute top-1/3 right-0 z-20 text-4xl [animation-delay:-1.5s] sm:right-6">
                        🍵
                    </span>
                    <span className="store-parallax-1 store-float absolute bottom-16 left-0 z-20 text-4xl [animation-delay:-3s] sm:left-8">
                        🧋
                    </span>
                    <span className="store-parallax-2 store-float absolute right-8 bottom-4 z-20 text-3xl [animation-delay:-2s]">
                        🫘
                    </span>
                    {cheapest !== null && (
                        <div className="store-parallax-2 absolute top-10 -right-2 z-30 flex h-24 w-24 rotate-12 flex-col items-center justify-center rounded-full bg-(--s-honey) text-center text-(--s-ink) shadow-xl sm:right-0">
                            <span className="text-[10px] font-bold tracking-wider uppercase">
                                Mulai
                            </span>
                            <span className="font-display text-lg leading-none font-bold">
                                {cheapest >= 1000
                                    ? `${(Math.round(cheapest / 100) / 10).toLocaleString('id-ID')}rb`
                                    : cheapest}
                            </span>
                        </div>
                    )}
                    <ProductDeck products={featured} onOpen={onOpen} />
                </div>
            </div>
        </section>
    );
}
