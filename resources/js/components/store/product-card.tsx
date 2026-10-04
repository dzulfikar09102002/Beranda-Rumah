import { Flame, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { cn } from '@/lib/utils';
import { ProductImage } from './product-image';
import type { StoreProduct } from './types';
import { formatRupiah } from './utils';

export function QuantityStepper({
    quantity,
    max,
    onChange,
    size = 'md',
}: {
    quantity: number;
    max: number;
    onChange: (quantity: number) => void;
    size?: 'sm' | 'md';
}) {
    const button = cn(
        'flex items-center justify-center rounded-full transition active:scale-90 disabled:opacity-30',
        size === 'sm' ? 'h-7 w-7' : 'h-9 w-9',
    );

    return (
        <div className="flex items-center gap-1 rounded-full bg-(--s-ink) p-1 text-(--s-cream)">
            <button
                type="button"
                aria-label="Kurangi"
                className={cn(button, 'hover:bg-white/15')}
                onClick={(event) => {
                    event.stopPropagation();
                    onChange(quantity - 1);
                }}
            >
                <Minus className="h-4 w-4" />
            </button>
            <span
                key={quantity}
                className="store-pop min-w-6 text-center text-sm font-semibold tabular-nums"
            >
                {quantity}
            </span>
            <button
                type="button"
                aria-label="Tambah"
                disabled={quantity >= max}
                className={cn(button, 'bg-(--s-terra) hover:brightness-110')}
                onClick={(event) => {
                    event.stopPropagation();
                    onChange(quantity + 1);
                }}
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
}

export function ProductCard({
    product,
    quantity,
    bestSeller,
    onAdd,
    onQuantity,
    onOpen,
}: {
    product: StoreProduct;
    quantity: number;
    bestSeller: boolean;
    onAdd: (product: StoreProduct, source: HTMLElement | null) => void;
    onQuantity: (product: StoreProduct, quantity: number) => void;
    onOpen: (product: StoreProduct) => void;
}) {
    const cardRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const soldOut = product.stock <= 0;
    const lowStock = !soldOut && product.stock <= 5;

    const handleMove = (event: MouseEvent<HTMLDivElement>) => {
        const card = cardRef.current;

        if (!card) {
            return;
        }

        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
        card.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
        card.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
    };

    const handleLeave = () => {
        cardRef.current?.style.setProperty('--rx', '0deg');
        cardRef.current?.style.setProperty('--ry', '0deg');
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            onClick={() => onOpen(product)}
            className={cn(
                'store-tilt group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_0_rgba(43,29,20,0.06),0_12px_30px_-18px_rgba(43,29,20,0.35)] ring-1 ring-(--s-ink)/5',
                soldOut && 'opacity-70 grayscale-[0.6]',
            )}
        >
            <div className="store-glare pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div
                ref={imageRef}
                className="relative m-2 overflow-hidden rounded-2xl"
            >
                <ProductImage
                    product={product}
                    className="aspect-square transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {bestSeller && (
                        <span className="flex items-center gap-1 rounded-full bg-(--s-ink)/85 px-2.5 py-1 text-[11px] font-semibold text-(--s-honey) backdrop-blur">
                            <Flame className="h-3 w-3" /> Terlaris
                        </span>
                    )}
                    {lowStock && (
                        <span className="rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-(--s-terra) backdrop-blur">
                            Sisa {product.stock}
                        </span>
                    )}
                </div>

                {soldOut && (
                    <div className="absolute inset-0 flex items-center justify-center bg-(--s-ink)/40 backdrop-blur-[2px]">
                        <span className="-rotate-6 rounded-lg border-2 border-white px-3 py-1 text-sm font-bold tracking-widest text-white uppercase">
                            Habis
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col gap-1 px-4 pt-1 pb-4">
                <p className="text-[11px] font-semibold tracking-wider text-(--s-sage) uppercase">
                    {product.category ?? 'Produk'}
                </p>
                <h3 className="line-clamp-2 leading-snug font-semibold text-(--s-ink)">
                    {product.name}
                </h3>
                {product.brand && (
                    <p className="text-xs text-(--s-ink)/50">{product.brand}</p>
                )}

                <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <p className="font-display text-lg font-semibold text-(--s-ink)">
                        {formatRupiah(product.price)}
                    </p>

                    {quantity > 0 ? (
                        <QuantityStepper
                            size="sm"
                            quantity={quantity}
                            max={product.stock}
                            onChange={(value) => onQuantity(product, value)}
                        />
                    ) : soldOut ? null : (
                        <button
                            type="button"
                            aria-label={`Tambah ${product.name} ke keranjang`}
                            onClick={(event) => {
                                event.stopPropagation();
                                onAdd(product, imageRef.current);
                            }}
                            className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--s-terra) text-white shadow-(--s-terra)/30 shadow-lg transition-all duration-300 group-hover:w-24 hover:shadow-xl active:scale-90"
                        >
                            <ShoppingBag className="h-4 w-4 shrink-0" />
                            <span className="max-w-0 overflow-hidden text-xs font-semibold whitespace-nowrap transition-all duration-300 group-hover:ml-1.5 group-hover:max-w-16">
                                Tambah
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
