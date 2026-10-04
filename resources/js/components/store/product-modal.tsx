import { Flame, PackageCheck, ShoppingBag } from 'lucide-react';
import { useRef, useState } from 'react';
import { Overlay } from './overlay';
import { QuantityStepper } from './product-card';
import { ProductImage } from './product-image';
import type { StoreProduct } from './types';
import { formatRupiah } from './utils';

export function ProductModal({
    product,
    open,
    inCart,
    related,
    onClose,
    onAdd,
    onSelect,
}: {
    product: StoreProduct | null;
    open: boolean;
    inCart: number;
    related: StoreProduct[];
    onClose: () => void;
    onAdd: (
        product: StoreProduct,
        quantity: number,
        source: HTMLElement | null,
    ) => void;
    onSelect: (product: StoreProduct) => void;
}) {
    const imageRef = useRef<HTMLDivElement>(null);
    const [quantity, setQuantity] = useState(1);
    const [shownId, setShownId] = useState(product?.id);

    if (product?.id !== shownId) {
        setShownId(product?.id);
        setQuantity(1);
    }

    if (!product) {
        return null;
    }

    const available = Math.max(0, product.stock - inCart);

    return (
        <Overlay
            open={open}
            onClose={onClose}
            variant="modal"
            label={product.name}
        >
            <div className="overflow-y-auto">
                <div className="grid md:grid-cols-2">
                    <div ref={imageRef} className="relative p-3 md:p-4">
                        <ProductImage
                            key={product.id}
                            product={product}
                            className="store-zoom-in aspect-square rounded-[1.5rem]"
                        />
                    </div>

                    <div
                        key={product.id}
                        className="store-stagger flex flex-col gap-4 p-6 pt-2 md:pt-12 md:pl-2"
                    >
                        <p className="text-xs font-semibold tracking-[0.2em] text-(--s-sage) uppercase">
                            {product.category ?? 'Produk'}
                        </p>
                        <h2 className="font-display text-3xl leading-tight font-semibold text-(--s-ink)">
                            {product.name}
                        </h2>
                        {product.brand && (
                            <p className="-mt-2 text-sm text-(--s-ink)/60">
                                oleh {product.brand}
                            </p>
                        )}
                        <p className="font-display text-3xl font-bold text-(--s-terra)">
                            {formatRupiah(product.price)}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs font-medium">
                            <span className="flex items-center gap-1.5 rounded-full bg-(--s-sage)/15 px-3 py-1.5 text-(--s-sage)">
                                <PackageCheck className="h-3.5 w-3.5" />
                                {product.stock > 0
                                    ? `Stok ${product.stock}`
                                    : 'Stok habis'}
                            </span>
                            {product.sold > 0 && (
                                <span className="flex items-center gap-1.5 rounded-full bg-(--s-honey)/25 px-3 py-1.5 text-(--s-ink)">
                                    <Flame className="h-3.5 w-3.5 text-(--s-terra)" />
                                    {product.sold} terjual
                                </span>
                            )}
                            {inCart > 0 && (
                                <span className="rounded-full bg-(--s-terra)/10 px-3 py-1.5 text-(--s-terra)">
                                    {inCart} di keranjang
                                </span>
                            )}
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                            {available > 0 ? (
                                <>
                                    <QuantityStepper
                                        quantity={quantity}
                                        max={available}
                                        onChange={(value) =>
                                            setQuantity(Math.max(1, value))
                                        }
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onAdd(
                                                product,
                                                quantity,
                                                imageRef.current,
                                            )
                                        }
                                        className="store-shine flex flex-1 items-center justify-center gap-2 rounded-full bg-(--s-terra) px-6 py-3 font-semibold text-white shadow-(--s-terra)/30 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        Tambah ·{' '}
                                        {formatRupiah(product.price * quantity)}
                                    </button>
                                </>
                            ) : (
                                <p className="rounded-2xl bg-(--s-ink)/5 px-4 py-3 text-sm text-(--s-ink)/60">
                                    {product.stock > 0
                                        ? 'Semua stok sudah ada di keranjangmu.'
                                        : 'Produk ini sedang habis. Cek lagi nanti ya!'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {related.length > 0 && (
                    <div className="border-t border-(--s-ink)/10 p-6">
                        <p className="mb-3 text-sm font-semibold text-(--s-ink)">
                            Mungkin kamu juga suka
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {related.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onSelect(item)}
                                    className="group rounded-2xl bg-white p-2 text-left ring-1 ring-(--s-ink)/5 transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <ProductImage
                                        product={item}
                                        compact
                                        className="aspect-[4/3] rounded-xl"
                                    />
                                    <p className="mt-2 line-clamp-1 text-xs font-semibold text-(--s-ink)">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-(--s-terra)">
                                        {formatRupiah(item.price)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Overlay>
    );
}
