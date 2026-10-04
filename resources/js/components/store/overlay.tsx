import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

const EXIT_MS = 280;

export function Overlay({
    open,
    onClose,
    variant,
    label,
    children,
}: {
    open: boolean;
    onClose: () => void;
    variant: 'modal' | 'drawer';
    label: string;
    children: ReactNode;
}) {
    const [rendered, setRendered] = useState(open);

    if (open && !rendered) {
        setRendered(true);
    }

    useEffect(() => {
        if (open || !rendered) {
            return;
        }

        const timer = window.setTimeout(() => setRendered(false), EXIT_MS);

        return () => window.clearTimeout(timer);
    }, [open, rendered]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);

        return () => {
            document.body.style.overflow = previous;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);

    if (!rendered) {
        return null;
    }

    return createPortal(
        <div
            className="store-root fixed inset-0 z-[60]"
            data-state={open ? 'open' : 'closed'}
            role="dialog"
            aria-modal="true"
            aria-label={label}
        >
            <div
                className="store-backdrop absolute inset-0 bg-(--s-ink)/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className={cn(
                    'pointer-events-none absolute inset-0 flex',
                    variant === 'drawer'
                        ? 'justify-end'
                        : 'items-end justify-center md:items-center md:p-6',
                )}
            >
                <div
                    className={cn(
                        'pointer-events-auto relative flex w-full flex-col overflow-hidden bg-(--s-cream) shadow-2xl',
                        variant === 'drawer'
                            ? 'store-drawer h-full max-w-md sm:rounded-l-[2rem]'
                            : 'store-modal max-h-[92vh] rounded-t-[2rem] md:max-h-[88vh] md:max-w-3xl md:rounded-[2rem]',
                    )}
                >
                    <button
                        type="button"
                        aria-label="Tutup"
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-(--s-ink) shadow-md backdrop-blur transition hover:rotate-90 hover:bg-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
}
