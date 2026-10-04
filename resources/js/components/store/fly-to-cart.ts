function bump(target: HTMLElement) {
    target.animate(
        [
            { transform: 'scale(1) rotate(0)' },
            { transform: 'scale(1.25) rotate(-10deg)' },
            { transform: 'scale(0.95) rotate(6deg)' },
            { transform: 'scale(1) rotate(0)' },
        ],
        { duration: 450, easing: 'ease-out' },
    );
}

export function flyToCart(source: HTMLElement | null, label: string) {
    const target = document.getElementById('store-cart-button');

    if (!source || !target) {
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        bump(target);

        return;
    }

    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const size = 56;

    const ghost = document.createElement('div');
    ghost.className = 'store-fly-ghost';
    ghost.textContent = label;
    Object.assign(ghost.style, {
        left: `${from.left + from.width / 2 - size / 2}px`,
        top: `${from.top + from.height / 2 - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
    });
    document.body.appendChild(ghost);

    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);

    const animation = ghost.animate(
        [
            { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
            {
                transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 120}px) scale(1.15) rotate(-12deg)`,
                opacity: 1,
                offset: 0.5,
            },
            {
                transform: `translate(${dx}px, ${dy}px) scale(0.2) rotate(20deg)`,
                opacity: 0.4,
            },
        ],
        { duration: 750, easing: 'cubic-bezier(.5,-0.3,.6,1)' },
    );

    animation.onfinish = () => {
        ghost.remove();
        bump(target);
    };
}
