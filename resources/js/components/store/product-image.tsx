import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { StoreProduct } from './types';
import { emojiFor, gradientFor, initials } from './utils';

export function ProductImage({
    product,
    className,
    compact = false,
}: {
    product: StoreProduct;
    className?: string;
    compact?: boolean;
}) {
    const [failed, setFailed] = useState(false);
    const [loaded, setLoaded] = useState(false);

    if (product.image && !failed) {
        return (
            <div
                className={cn(
                    'relative overflow-hidden bg-(--s-sand)',
                    className,
                )}
            >
                {!loaded && <div className="store-shimmer absolute inset-0" />}
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onLoad={() => setLoaded(true)}
                    onError={() => setFailed(true)}
                    className={cn(
                        'h-full w-full object-cover transition-all duration-700',
                        loaded
                            ? 'scale-100 opacity-100'
                            : 'scale-110 opacity-0',
                    )}
                />
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative flex items-center justify-center overflow-hidden bg-gradient-to-br',
                gradientFor(product.category_id),
                className,
            )}
        >
            <span
                aria-hidden
                className={cn(
                    'font-display absolute -right-1 -bottom-4 leading-none font-bold text-white/30 select-none',
                    compact ? 'text-3xl' : 'text-8xl',
                )}
            >
                {initials(product.name)}
            </span>
            <span
                aria-hidden
                className={cn(
                    'drop-shadow-lg',
                    compact ? 'text-2xl' : 'store-float text-6xl',
                )}
            >
                {emojiFor(product.category)}
            </span>
        </div>
    );
}
