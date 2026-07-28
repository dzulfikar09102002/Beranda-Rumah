import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <>
            <style>{`
                
            `}</style>

            <div className="dw-root">
                {/* LEFT PANEL */}
                <div className="dw-left">
                    <div className="dw-batik" />
                    <div className="dw-batik-lines" />
                    <div className="dw-circle dw-circle-1" />
                    <div className="dw-circle dw-circle-2" />
                    <div className="dw-circle dw-circle-3" />
                    <div className="dw-circle dw-circle-4" />

                    <div
                        className="dw-slide-right"
                        style={{
                            position: 'relative',
                            zIndex: 10,
                            textAlign: 'center',
                        }}
                    >
                        <div className="dw-logo-ring">
                            <div className="dw-logo-inner">DW</div>
                        </div>

                        <h1 className="dw-brand-title">Dharma Wanita</h1>
                        <p className="dw-brand-subtitle">Kota Surabaya</p>
                        <div className="dw-divider" />

                        <p className="dw-brand-desc">
                            Organisasi sosial wanita yang berdedikasi untuk
                            pemberdayaan masyarakat dan pelayanan sosial yang
                            berkelanjutan.
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <span className="dw-badge">📱 @dwp_surabaya</span>
                        </div>

                        <div className="dw-pillars">
                            <span>✦ Pemberdayaan</span>
                            <span>✦ Dedikasi</span>
                            <span>✦ Pelayanan</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="dw-right">
                    <div className="dw-card dw-slide-left">
                        {/* Mobile logo */}
                        <div
                            className="dw-mobile-logo"
                            style={{ display: 'none' }}
                            ref={(el) => {
                                if (el) {
                                    const show = window.innerWidth < 1024;
                                    el.style.display = show ? 'block' : 'none';
                                }
                            }}
                        >
                            <div className="dw-logo-ring">
                                <div className="dw-logo-inner">DW</div>
                            </div>
                            <div
                                className="dw-brand-title"
                                style={{ fontSize: '1.4rem' }}
                            >
                                Dharma Wanita
                            </div>
                            <div
                                style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--text-muted)',
                                    letterSpacing: '1px',
                                }}
                            >
                                Kota Surabaya
                            </div>
                        </div>

                        <div>
                            <h2 className="dw-form-title">{title}</h2>
                            <div className="dw-title-line" />
                            <p className="dw-form-desc">{description}</p>
                        </div>

                        {children}

                        <div className="dw-footer">
                            ✦ Dharma Wanita Persatuan Kota Surabaya ✦
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
