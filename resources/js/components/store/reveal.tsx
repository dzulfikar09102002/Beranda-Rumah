import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

function useInView<T extends Element>(threshold = 0.12) {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold, rootMargin: '0px 0px -40px 0px' },
        );
        observer.observe(element);

        return () => observer.disconnect();
    }, [threshold]);

    return { ref, inView };
}

export function Reveal({
    children,
    delay = 0,
    className,
    style,
}: {
    children: ReactNode;
    delay?: number;
    className?: string;
    style?: CSSProperties;
}) {
    const { ref, inView } = useInView<HTMLDivElement>();

    return (
        <div
            ref={ref}
            className={cn('store-reveal', inView && 'is-visible', className)}
            style={{ transitionDelay: `${delay}ms`, ...style }}
        >
            {children}
        </div>
    );
}

export function CountUp({
    value,
    duration = 1400,
}: {
    value: number;
    duration?: number;
}) {
    const { ref, inView } = useInView<HTMLSpanElement>(0.5);
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!inView) {
            return;
        }

        let frame = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };
        frame = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(frame);
    }, [inView, value, duration]);

    return <span ref={ref}>{display.toLocaleString('id-ID')}</span>;
}
