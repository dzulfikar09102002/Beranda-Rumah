import { useEffect, useState } from 'react';
import type { CartLine, StoreProduct } from './types';

const STORAGE_KEY = 'store-cart-v2';

type CartState = Record<number, CartLine>;

function readStorage(): CartState {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);

        return raw ? (JSON.parse(raw) as CartState) : {};
    } catch {
        return {};
    }
}

/**
 * Products are paginated from the server, so the cart keeps a snapshot of
 * each product it contains instead of looking them up in a full list.
 */
export function useCart() {
    const [state, setState] = useState<CartState>(readStorage);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // storage unavailable: the cart simply won't persist
        }
    }, [state]);

    const lines = Object.values(state).filter((line) => line.quantity > 0);

    const setQuantity = (product: StoreProduct, quantity: number) => {
        setState((current) => {
            const next = { ...current };
            const clamped = Math.min(Math.max(0, quantity), product.stock);

            if (clamped === 0) {
                delete next[product.id];
            } else {
                next[product.id] = { product, quantity: clamped };
            }

            return next;
        });
    };

    const quantityOf = (id: number) => state[id]?.quantity ?? 0;

    return {
        lines,
        count: lines.reduce((sum, line) => sum + line.quantity, 0),
        total: lines.reduce(
            (sum, line) => sum + line.quantity * line.product.price,
            0,
        ),
        quantityOf,
        add: (product: StoreProduct, quantity = 1) =>
            setQuantity(product, quantityOf(product.id) + quantity),
        setQuantity,
        remove: (product: StoreProduct) => setQuantity(product, 0),
        clear: () => setState({}),
    };
}

export type Cart = ReturnType<typeof useCart>;
