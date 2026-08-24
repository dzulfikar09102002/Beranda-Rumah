import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <>
            <style>{`
                .br-root {
                    display: grid;
                    grid-template-columns: 1.05fr 1fr;
                    min-height: 100dvh;
                    background: #FAF3E7;
                    --br-espresso: #3B2A20;
                    --br-espresso-dark: #241811;
                    --br-cream: #FAF3E7;
                    --br-card: #FFFDF9;
                    --br-gold: #C79A56;
                    --br-sage: #7C8863;
                    --br-text-dark: #2B2118;
                    --br-text-muted-warm: #8A7967;
                }

                /* LEFT PANEL */
                .br-left {
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem;
                    background: linear-gradient(160deg, var(--br-espresso) 0%, var(--br-espresso-dark) 100%);
                }

                .br-weave {
                    position: absolute;
                    inset: 0;
                    opacity: 0.07;
                    pointer-events: none;
                    background-image:
                        repeating-linear-gradient(45deg, #E8C88A 0, #E8C88A 2px, transparent 2px, transparent 14px),
                        repeating-linear-gradient(-45deg, #E8C88A 0, #E8C88A 2px, transparent 2px, transparent 14px);
                }

                .br-glow {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(60px);
                    pointer-events: none;
                }
                .br-glow-1 {
                    width: 320px;
                    height: 320px;
                    background: var(--br-gold);
                    opacity: 0.18;
                    top: -80px;
                    right: -80px;
                }
                .br-glow-2 {
                    width: 280px;
                    height: 280px;
                    background: var(--br-sage);
                    opacity: 0.14;
                    bottom: -100px;
                    left: -60px;
                }

                .br-content {
                    position: relative;
                    z-index: 10;
                    max-width: 380px;
                    text-align: center;
                }

                .br-logo-wrap {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 1.75rem;
                }

                .br-logo {
                    width: 180px;
                    height: auto;
                    display: block;
                    filter: drop-shadow(0 8px 20px rgba(0,0,0,0.35));
                }

                .br-steam span {
                    position: absolute;
                    bottom: 100%;
                    width: 3px;
                    border-radius: 999px;
                    background: rgba(232, 200, 138, 0.55);
                    filter: blur(2px);
                    animation: br-steam-rise 3.2s ease-in-out infinite;
                }
                .br-steam span:nth-child(1) { left: 40%; height: 26px; animation-delay: 0s; }
                .br-steam span:nth-child(2) { left: 50%; height: 32px; animation-delay: 0.7s; }
                .br-steam span:nth-child(3) { left: 60%; height: 24px; animation-delay: 1.4s; }

                @keyframes br-steam-rise {
                    0%   { transform: translateY(0) scaleY(1); opacity: 0; }
                    25%  { opacity: 0.7; }
                    100% { transform: translateY(-34px) scaleY(1.4); opacity: 0; }
                }

                .br-tagline {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.72rem;
                    font-weight: 600;
                    letter-spacing: 2.5px;
                    text-transform: uppercase;
                    color: var(--br-gold);
                    margin-bottom: 0.9rem;
                }

                .br-divider {
                    width: 44px;
                    height: 2px;
                    margin: 1.1rem auto;
                    background: linear-gradient(90deg, var(--br-gold), var(--br-sage));
                    border-radius: 2px;
                }

                .br-desc {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.88rem;
                    line-height: 1.65;
                    color: rgba(250, 243, 231, 0.72);
                    margin-bottom: 1.75rem;
                }

                .br-values {
                    display: flex;
                    justify-content: center;
                    gap: 0;
                }
                .br-value {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0 1.1rem;
                    border-left: 1px solid rgba(232, 200, 138, 0.18);
                }
                .br-value:first-child { border-left: none; }
                .br-value svg { width: 18px; height: 18px; color: var(--br-gold); }
                .br-value span {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.68rem;
                    color: rgba(250, 243, 231, 0.6);
                    letter-spacing: 0.3px;
                }

                /* RIGHT PANEL */
                .br-right {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background: var(--br-cream);
                }

                .br-card {
                    width: 100%;
                    max-width: 400px;
                    background: var(--br-card);
                    border: 1px solid rgba(43, 33, 24, 0.08);
                    border-radius: 20px;
                    padding: 2.75rem 2.5rem;
                    box-shadow: 0 16px 40px rgba(59, 42, 32, 0.08);
                }

                .br-mobile-logo {
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 1.75rem;
                }
                .br-mobile-logo img {
                    width: 120px;
                    height: auto;
                    margin-bottom: 0.6rem;
                }
                .br-mobile-logo span {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.7rem;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    color: var(--br-text-muted-warm);
                }

                .br-form-title {
                    font-family: 'Fraunces', serif;
                    font-size: 1.55rem;
                    font-weight: 600;
                    color: var(--br-text-dark);
                    margin: 0;
                }
                .br-title-line {
                    width: 32px;
                    height: 3px;
                    background: var(--br-gold);
                    border-radius: 2px;
                    margin: 0.6rem 0 0.9rem;
                }
                .br-form-desc {
                    font-family: 'Inter', sans-serif;
                    font-size: 0.85rem;
                    color: var(--br-text-muted-warm);
                    margin: 0 0 1.75rem;
                }

                .br-footer {
                    margin-top: 2rem;
                    padding-top: 1.25rem;
                    border-top: 1px solid rgba(43, 33, 24, 0.08);
                    text-align: center;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.72rem;
                    letter-spacing: 0.4px;
                    color: var(--br-text-muted-warm);
                }

                /* MOTION */
                .br-slide-right { animation: br-fade-right 0.6s ease-out; }
                .br-slide-left { animation: br-fade-left 0.6s ease-out; }
                @keyframes br-fade-right {
                    from { opacity: 0; transform: translateX(-16px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes br-fade-left {
                    from { opacity: 0; transform: translateX(16px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .br-slide-right, .br-slide-left, .br-steam span { animation: none; }
                }

                /* RESPONSIVE */
                @media (max-width: 1024px) {
                    .br-root { grid-template-columns: 1fr; }
                    .br-left { display: none; }
                    .br-mobile-logo { display: flex; }
                    .br-right { padding: 1.25rem; }
                    .br-card { padding: 2.25rem 1.5rem; border-radius: 16px; }
                }
            `}</style>

            <div className="br-root">
                {/* LEFT PANEL */}
                <div className="br-left">
                    <div className="br-weave" />
                    <div className="br-glow br-glow-1" />
                    <div className="br-glow br-glow-2" />

                    <div className="br-content br-slide-right">
                        <div className="br-logo-wrap">
                            <div className="br-steam">
                                <span />
                                <span />
                                <span />
                            </div>
                            <img
                                src="/assets/images/logo-brand-full.png"
                                alt="Beranda Rumah"
                                className="br-logo"
                            />
                        </div>

                        <p className="br-tagline">Kedai Kopi &amp; Teh Rumahan</p>

                        <p className="br-desc">
                            Tempat ngopi santai dengan racikan kopi dan teh
                            pilihan, disajikan dengan kehangatan seperti di
                            rumah sendiri.
                        </p>

                        <div className="br-divider" />

                        <div className="br-values">
                            <div className="br-value">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M4 9h13a3 3 0 0 1 0 6h-1" strokeLinecap="round" />
                                    <path d="M4 9v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V9" strokeLinecap="round" />
                                    <path d="M7 5c.5 1 .5 1.5 0 2.5M11 5c.5 1 .5 1.5 0 2.5" strokeLinecap="round" />
                                </svg>
                                <span>Kopi Pilihan</span>
                            </div>
                            <div className="br-value">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M12 3c4 3 6 6 6 9.5A6 6 0 0 1 6 12.5C6 9 8 6 12 3Z" strokeLinejoin="round" />
                                    <path d="M12 21v-7" strokeLinecap="round" />
                                </svg>
                                <span>Teh Racikan</span>
                            </div>
                            <div className="br-value">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M4 11 12 4l8 7" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Suasana Rumah</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="br-right">
                    <div className="br-card br-slide-left">
                        <div className="br-mobile-logo">
                            <img
                                src="/assets/images/logo-brand-full.png"
                                alt="Beranda Rumah"
                            />
                            <span>Beranda Rumah</span>
                        </div>

                        <div>
                            <h2 className="br-form-title">{title}</h2>
                            <div className="br-title-line" />
                            <p className="br-form-desc">{description}</p>
                        </div>

                        {children}

                        <div className="br-footer">
                            Beranda Rumah &middot; Kopi &amp; Teh Rumahan
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}