import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props as { auth?: { user?: unknown } };
    const [scrollY, setScrollY] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        const handleMouse = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouse);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouse);
        };
    }, []);

    const pillars = [
        {
            icon: '✦',
            title: 'Pemberdayaan',
            desc: 'Memberdayakan perempuan melalui pendidikan, pelatihan, dan pengembangan keterampilan yang berkelanjutan.',
            color: '#c8102e',
        },
        {
            icon: '◆',
            title: 'Dedikasi',
            desc: 'Berdedikasi penuh dalam melayani masyarakat dengan semangat kekeluargaan dan kebersamaan yang erat.',
            color: '#b8960c',
        },
        {
            icon: '❋',
            title: 'Pelayanan',
            desc: 'Memberikan pelayanan sosial terbaik kepada masyarakat Kota Surabaya dengan tulus dan ikhlas.',
            color: '#c8102e',
        },
    ];

    const programs = [
        {
            num: '01',
            title: 'Pendidikan & Pelatihan',
            desc: 'Program peningkatan kompetensi dan keterampilan anggota',
        },
        {
            num: '02',
            title: 'Kesehatan Masyarakat',
            desc: 'Kegiatan posyandu, penyuluhan kesehatan, dan donor darah',
        },
        {
            num: '03',
            title: 'Ekonomi Kreatif',
            desc: 'Pengembangan UMKM dan wirausaha perempuan mandiri',
        },
        {
            num: '04',
            title: 'Sosial Budaya',
            desc: 'Pelestarian budaya lokal dan kegiatan sosial kemasyarakatan',
        },
    ];

    const stats = [
        { value: '1.200+', label: 'Anggota Aktif' },
        { value: '31', label: 'Kecamatan' },
        { value: '154', label: 'Kelurahan' },
        { value: '40+', label: 'Tahun Berdiri' },
    ];

    return (
        <>
            <Head title="Dharma Wanita Persatuan Kota Surabaya" />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Nunito+Sans:wght@300;400;600&display=swap');

                :root {
                    --red: #c8102e;
                    --red-dark: #8B0000;
                    --gold: #b8960c;
                    --gold-light: #d4af37;
                    --gold-pale: #f5e6a3;
                    --cream: #fdf8f0;
                    --white: #ffffff;
                    --dark: #1a0a0a;
                    --text: #2d1515;
                    --text-muted: #6b4040;
                }

                * { margin: 0; padding: 0; box-sizing: border-box; }

                body {
                    font-family: 'Nunito Sans', sans-serif;
                    background: var(--cream);
                    color: var(--text);
                    overflow-x: hidden;
                }

                /* ── SCROLLBAR ── */
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

                /* ── NAV ── */
                .nav {
                    position: fixed;
                    top: 0; left: 0; right: 0;
                    z-index: 100;
                    padding: 1rem 3rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(253, 248, 240, 0.92);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(184, 150, 12, 0.2);
                    transition: all 0.3s ease;
                }

                .nav-logo {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    text-decoration: none;
                }

                .nav-badge {
                    width: 40px; height: 40px;
                    border-radius: 50%;
                    border: 2px solid var(--gold);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Cinzel Decorative', serif;
                    font-size: 0.65rem;
                    color: var(--red);
                    font-weight: 700;
                    background: var(--white);
                }

                .nav-name {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: 0.8rem;
                    color: var(--red-dark);
                    letter-spacing: 0.05em;
                    line-height: 1.2;
                }

                .nav-sub {
                    font-size: 0.6rem;
                    color: var(--gold);
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .btn-login {
                    padding: 0.5rem 1.5rem;
                    border: 1px solid var(--red);
                    color: var(--red);
                    background: transparent;
                    font-family: 'Nunito Sans', sans-serif;
                    font-size: 0.85rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    display: inline-block;
                }

                .btn-login:hover {
                    background: var(--red);
                    color: var(--white);
                }

                .btn-register {
                    padding: 0.5rem 1.5rem;
                    background: var(--gold);
                    color: var(--white);
                    font-family: 'Nunito Sans', sans-serif;
                    font-size: 0.85rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    display: inline-block;
                    border: 1px solid var(--gold);
                }

                .btn-register:hover {
                    background: var(--gold-light);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 16px rgba(184, 150, 12, 0.3);
                }

                /* ── HERO ── */
                .hero {
                    min-height: 100vh;
                    position: relative;
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    background: var(--dark);
                }

                .hero-bg-red {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #8B0000 0%, #c8102e 40%, #1a0a0a 100%);
                }

                .hero-batik {
                    position: absolute;
                    inset: 0;
                    background-image:
                        radial-gradient(ellipse 3px 3px at 20px 20px, rgba(212,175,55,0.15) 100%, transparent 0),
                        radial-gradient(ellipse 1px 1px at 10px 10px, rgba(212,175,55,0.08) 100%, transparent 0);
                    background-size: 40px 40px, 20px 20px;
                    opacity: 0.6;
                }

                .hero-pattern {
                    position: absolute;
                    inset: 0;
                    overflow: hidden;
                }

                .hero-circle {
                    position: absolute;
                    border-radius: 50%;
                    border: 1px solid rgba(212, 175, 55, 0.2);
                    animation: pulse 4s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.05); opacity: 0.6; }
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }

                @keyframes shimmer {
                    0% { opacity: 0.4; }
                    50% { opacity: 1; }
                    100% { opacity: 0.4; }
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes rotateSlow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes drawLine {
                    from { stroke-dashoffset: 1000; }
                    to { stroke-dashoffset: 0; }
                }

                .ornament-rotate {
                    animation: rotateSlow 20s linear infinite;
                    transform-origin: center;
                }

                .hero-content {
                    position: relative;
                    z-index: 10;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 8rem 3rem 4rem;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    align-items: center;
                    width: 100%;
                }

                .hero-left {
                    animation: slideUp 0.8s ease both;
                }

                .hero-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.7rem;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: var(--gold-light);
                    margin-bottom: 1.5rem;
                }

                .hero-eyebrow::before,
                .hero-eyebrow::after {
                    content: '';
                    display: inline-block;
                    width: 24px;
                    height: 1px;
                    background: var(--gold-light);
                }

                .hero-title {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: clamp(2rem, 4vw, 3.5rem);
                    color: var(--white);
                    line-height: 1.1;
                    margin-bottom: 0.5rem;
                    animation: slideUp 0.8s 0.1s ease both;
                }

                .hero-title span {
                    color: var(--gold-light);
                    display: block;
                }

                .hero-subtitle {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.1rem;
                    color: rgba(255,255,255,0.7);
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    margin-bottom: 2rem;
                    animation: slideUp 0.8s 0.2s ease both;
                }

                .hero-desc {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.2rem;
                    color: rgba(255,255,255,0.8);
                    line-height: 1.8;
                    margin-bottom: 2.5rem;
                    font-style: italic;
                    animation: slideUp 0.8s 0.3s ease both;
                }

                .hero-actions {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    animation: slideUp 0.8s 0.4s ease both;
                }

                .btn-hero-primary {
                    padding: 0.9rem 2.5rem;
                    background: var(--gold);
                    color: var(--dark);
                    font-family: 'Nunito Sans', sans-serif;
                    font-weight: 700;
                    font-size: 0.85rem;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    display: inline-block;
                    border: 1px solid var(--gold);
                }

                .btn-hero-primary:hover {
                    background: var(--gold-light);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(212, 175, 55, 0.4);
                }

                .btn-hero-outline {
                    padding: 0.9rem 2.5rem;
                    background: transparent;
                    color: var(--white);
                    font-family: 'Nunito Sans', sans-serif;
                    font-weight: 600;
                    font-size: 0.85rem;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    text-decoration: none;
                    border: 1px solid rgba(255,255,255,0.4);
                    transition: all 0.3s ease;
                    display: inline-block;
                }

                .btn-hero-outline:hover {
                    border-color: var(--gold-light);
                    color: var(--gold-light);
                }

                .hero-right {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    animation: fadeIn 1s 0.5s ease both;
                }

                .emblem {
                    position: relative;
                    width: 340px;
                    height: 340px;
                }

                .emblem-ring {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 1px solid rgba(212, 175, 55, 0.4);
                }

                .emblem-ring-2 {
                    inset: 20px;
                    border-color: rgba(212, 175, 55, 0.25);
                }

                .emblem-center {
                    position: absolute;
                    inset: 50px;
                    border-radius: 50%;
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid rgba(212, 175, 55, 0.5);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(4px);
                }

                .emblem-dw {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: 3.5rem;
                    color: var(--gold-light);
                    line-height: 1;
                    text-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
                }

                .emblem-text {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 0.65rem;
                    color: rgba(212, 175, 55, 0.8);
                    letter-spacing: 0.25em;
                    text-transform: uppercase;
                    margin-top: 0.25rem;
                }

                .emblem-dots {
                    position: absolute;
                    inset: 0;
                    animation: rotateSlow 15s linear infinite;
                }

                .emblem-dot {
                    position: absolute;
                    width: 6px; height: 6px;
                    border-radius: 50%;
                    background: var(--gold-light);
                    top: 50%; left: 50%;
                    transform-origin: 0 0;
                    animation: shimmer 2s ease-in-out infinite;
                }

                /* ── SCROLL INDICATOR ── */
                .scroll-indicator {
                    position: absolute;
                    bottom: 2rem;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    color: rgba(255,255,255,0.5);
                    font-size: 0.7rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    animation: fadeIn 1s 1s ease both;
                }

                .scroll-line {
                    width: 1px;
                    height: 40px;
                    background: linear-gradient(to bottom, rgba(212,175,55,0.8), transparent);
                    animation: float 1.5s ease-in-out infinite;
                }

                /* ── STATS BAND ── */
                .stats-band {
                    background: var(--red-dark);
                    padding: 3rem;
                }

                .stats-grid {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0;
                }

                .stat-item {
                    text-align: center;
                    padding: 1.5rem;
                    border-right: 1px solid rgba(255,255,255,0.1);
                    position: relative;
                    transition: transform 0.3s ease;
                }

                .stat-item:last-child { border-right: none; }
                .stat-item:hover { transform: translateY(-4px); }

                .stat-value {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: 2.2rem;
                    color: var(--gold-light);
                    line-height: 1;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.6);
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                }

                /* ── PILLARS ── */
                .section {
                    padding: 6rem 3rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .section-eyebrow {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .eyebrow-line {
                    height: 1px;
                    width: 40px;
                    background: var(--gold);
                }

                .eyebrow-text {
                    font-size: 0.7rem;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: var(--gold);
                    font-weight: 600;
                }

                .section-title {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: clamp(1.5rem, 3vw, 2.5rem);
                    color: var(--red-dark);
                    margin-bottom: 1rem;
                    line-height: 1.2;
                }

                .section-desc {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.15rem;
                    color: var(--text-muted);
                    line-height: 1.8;
                    max-width: 600px;
                    font-style: italic;
                }

                .pillars-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                    margin-top: 4rem;
                }

                .pillar-card {
                    padding: 2.5rem 2rem;
                    border: 1px solid rgba(184, 150, 12, 0.2);
                    background: var(--white);
                    position: relative;
                    transition: all 0.4s ease;
                    overflow: hidden;
                }

                .pillar-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    background: linear-gradient(to right, var(--red), var(--gold));
                    transform: scaleX(0);
                    transition: transform 0.4s ease;
                    transform-origin: left;
                }

                .pillar-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 60px rgba(200, 16, 46, 0.12);
                    border-color: rgba(184, 150, 12, 0.4);
                }

                .pillar-card:hover::before {
                    transform: scaleX(1);
                }

                .pillar-icon {
                    font-size: 2rem;
                    color: var(--gold);
                    margin-bottom: 1rem;
                    display: block;
                    transition: transform 0.3s ease;
                }

                .pillar-card:hover .pillar-icon {
                    transform: scale(1.2) rotate(15deg);
                }

                .pillar-title {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: 1rem;
                    color: var(--red-dark);
                    margin-bottom: 0.75rem;
                    letter-spacing: 0.05em;
                }

                .pillar-desc {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1rem;
                    color: var(--text-muted);
                    line-height: 1.7;
                }

                /* ── PROGRAMS ── */
                .programs-section {
                    background: linear-gradient(135deg, var(--red-dark), #c8102e);
                    padding: 6rem 3rem;
                    position: relative;
                    overflow: hidden;
                }

                .programs-bg-pattern {
                    position: absolute;
                    inset: 0;
                    background-image:
                        radial-gradient(circle at 100% 0%, rgba(212,175,55,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 0% 100%, rgba(212,175,55,0.08) 0%, transparent 50%);
                    pointer-events: none;
                }

                .programs-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 5rem;
                    align-items: center;
                }

                .programs-left .section-title {
                    color: var(--white);
                }

                .programs-left .section-desc {
                    color: rgba(255,255,255,0.7);
                }

                .programs-left .eyebrow-text {
                    color: var(--gold-light);
                }

                .programs-left .eyebrow-line {
                    background: var(--gold-light);
                }

                .programs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    margin-top: 2rem;
                }

                .program-item {
                    display: flex;
                    gap: 1.5rem;
                    padding: 1.5rem 0;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.3s ease;
                    cursor: default;
                    position: relative;
                }

                .program-item::after {
                    content: '→';
                    position: absolute;
                    right: 0;
                    top: 50%;
                    transform: translateY(-50%) translateX(-10px);
                    color: var(--gold-light);
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .program-item:hover {
                    padding-left: 0.5rem;
                }

                .program-item:hover::after {
                    opacity: 1;
                    transform: translateY(-50%) translateX(0);
                }

                .program-num {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: 1.4rem;
                    color: rgba(212, 175, 55, 0.3);
                    line-height: 1;
                    flex-shrink: 0;
                    transition: color 0.3s ease;
                }

                .program-item:hover .program-num {
                    color: var(--gold-light);
                }

                .program-title {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: 0.85rem;
                    color: var(--white);
                    margin-bottom: 0.3rem;
                    letter-spacing: 0.05em;
                }

                .program-desc {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.5);
                    line-height: 1.5;
                }

                /* ── DECORATIVE DIVIDER ── */
                .ornament-divider {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    padding: 2rem 3rem;
                    background: var(--cream);
                }

                .ornament-line {
                    height: 1px;
                    flex: 1;
                    background: linear-gradient(to right, transparent, rgba(184, 150, 12, 0.4), transparent);
                }

                .ornament-symbol {
                    font-size: 1.2rem;
                    color: var(--gold);
                    animation: shimmer 3s ease-in-out infinite;
                }

                /* ── QUOTE ── */
                .quote-section {
                    padding: 5rem 3rem;
                    background: var(--cream);
                    text-align: center;
                }

                .quote-inner {
                    max-width: 800px;
                    margin: 0 auto;
                    position: relative;
                }

                .quote-mark {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: 6rem;
                    color: rgba(184, 150, 12, 0.15);
                    line-height: 0.5;
                    display: block;
                    margin-bottom: 1rem;
                }

                .quote-text {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: clamp(1.3rem, 2.5vw, 1.8rem);
                    color: var(--text);
                    line-height: 1.7;
                    font-style: italic;
                    margin-bottom: 1.5rem;
                }

                .quote-author {
                    font-size: 0.75rem;
                    letter-spacing: 0.3em;
                    text-transform: uppercase;
                    color: var(--gold);
                    font-weight: 600;
                }

                /* ── CTA ── */
                .cta-section {
                    padding: 6rem 3rem;
                    text-align: center;
                    background: var(--white);
                    border-top: 1px solid rgba(184, 150, 12, 0.2);
                    border-bottom: 1px solid rgba(184, 150, 12, 0.2);
                }

                .cta-inner {
                    max-width: 700px;
                    margin: 0 auto;
                }

                .cta-title {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: clamp(1.5rem, 3vw, 2.5rem);
                    color: var(--red-dark);
                    margin-bottom: 1rem;
                    line-height: 1.2;
                }

                .cta-desc {
                    font-family: 'Cormorant Garamond', serif;
                    font-size: 1.15rem;
                    color: var(--text-muted);
                    margin-bottom: 2.5rem;
                    font-style: italic;
                    line-height: 1.7;
                }

                .cta-buttons {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .btn-cta-primary {
                    padding: 1rem 3rem;
                    background: var(--red);
                    color: var(--white);
                    font-family: 'Nunito Sans', sans-serif;
                    font-weight: 700;
                    font-size: 0.85rem;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    text-decoration: none;
                    border: 1px solid var(--red);
                    transition: all 0.3s ease;
                    display: inline-block;
                }

                .btn-cta-primary:hover {
                    background: var(--red-dark);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(200, 16, 46, 0.3);
                }

                .btn-cta-outline {
                    padding: 1rem 3rem;
                    background: transparent;
                    color: var(--red);
                    font-family: 'Nunito Sans', sans-serif;
                    font-weight: 600;
                    font-size: 0.85rem;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    text-decoration: none;
                    border: 1px solid var(--red);
                    transition: all 0.3s ease;
                    display: inline-block;
                }

                .btn-cta-outline:hover {
                    background: rgba(200, 16, 46, 0.05);
                }

                /* ── FOOTER ── */
                .footer {
                    background: var(--dark);
                    padding: 3rem;
                    text-align: center;
                }

                .footer-logo {
                    font-family: 'Cinzel Decorative', serif;
                    font-size: 1.2rem;
                    color: var(--gold-light);
                    margin-bottom: 0.5rem;
                }

                .footer-sub {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.4);
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    margin-bottom: 1.5rem;
                }

                .footer-divider {
                    width: 60px;
                    height: 1px;
                    background: rgba(212, 175, 55, 0.4);
                    margin: 1rem auto;
                }

                .footer-copy {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.3);
                }

                /* ── RESPONSIVE ── */
                @media (max-width: 1024px) {
                    .hero-content {
                        grid-template-columns: 1fr;
                        text-align: center;
                    }
                    .hero-right { display: none; }
                    .hero-actions { justify-content: center; }
                    .hero-eyebrow { justify-content: center; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .pillars-grid { grid-template-columns: 1fr; }
                    .programs-inner { grid-template-columns: 1fr; }
                    .nav { padding: 1rem 1.5rem; }
                    .section { padding: 4rem 1.5rem; }
                }

                @media (max-width: 640px) {
                    .nav-name { font-size: 0.65rem; }
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1); }
                    .cta-buttons { flex-direction: column; align-items: center; }
                }
            `}</style>

            {/* NAV */}
            <nav className="nav">
                <a
                    href="#"
                    className="nav-logo"
                    style={{ textDecoration: 'none' }}
                >
                    <div className="nav-badge">DW</div>
                    <div>
                        <div className="nav-name">Dharma Wanita</div>
                        <div className="nav-sub">Kota Surabaya</div>
                    </div>
                </a>
                <div className="nav-links">
                    {auth?.user ? (
                        <Link href="/dashboard" className="btn-login">
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="btn-login">
                                Masuk
                            </Link>
                            {canRegister && (
                                <Link href="/register" className="btn-register">
                                    Daftar
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </nav>

            {/* HERO */}
            <section className="hero" ref={heroRef}>
                <div className="hero-bg-red" />
                <div className="hero-batik" />

                {/* Animated circles */}
                <div className="hero-pattern">
                    <div
                        className="hero-circle"
                        style={{
                            width: 500,
                            height: 500,
                            top: -100,
                            right: -100,
                        }}
                    />
                    <div
                        className="hero-circle"
                        style={{
                            width: 300,
                            height: 300,
                            top: 100,
                            right: 50,
                            animationDelay: '1s',
                        }}
                    />
                    <div
                        className="hero-circle"
                        style={{
                            width: 200,
                            height: 200,
                            bottom: 50,
                            left: 100,
                            animationDelay: '2s',
                        }}
                    />
                    <div
                        className="hero-circle"
                        style={{
                            width: 800,
                            height: 800,
                            bottom: -300,
                            left: -200,
                            opacity: 0.1,
                        }}
                    />

                    {/* Floating gold dots */}
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: 4 + (i % 3) * 2,
                                height: 4 + (i % 3) * 2,
                                borderRadius: '50%',
                                background: 'rgba(212, 175, 55, 0.4)',
                                top: `${15 + i * 13}%`,
                                left: `${5 + i * 7}%`,
                                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                                animationDelay: `${i * 0.3}s`,
                            }}
                        />
                    ))}

                    {/* SVG batik-style ornament */}
                    <svg
                        style={{
                            position: 'absolute',
                            right: '10%',
                            top: '15%',
                            opacity: 0.15,
                        }}
                        width="200"
                        height="200"
                        viewBox="0 0 200 200"
                    >
                        <g
                            className="ornament-rotate"
                            style={{ transformOrigin: '100px 100px' }}
                        >
                            {[...Array(8)].map((_, i) => (
                                <line
                                    key={i}
                                    x1="100"
                                    y1="100"
                                    x2={100 + 80 * Math.cos((i * Math.PI) / 4)}
                                    y2={100 + 80 * Math.sin((i * Math.PI) / 4)}
                                    stroke="#d4af37"
                                    strokeWidth="0.5"
                                />
                            ))}
                            <circle
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke="#d4af37"
                                strokeWidth="0.5"
                            />
                            <circle
                                cx="100"
                                cy="100"
                                r="55"
                                fill="none"
                                stroke="#d4af37"
                                strokeWidth="0.5"
                            />
                            <circle
                                cx="100"
                                cy="100"
                                r="30"
                                fill="none"
                                stroke="#d4af37"
                                strokeWidth="1"
                            />
                            {[...Array(8)].map((_, i) => (
                                <circle
                                    key={i}
                                    cx={100 + 55 * Math.cos((i * Math.PI) / 4)}
                                    cy={100 + 55 * Math.sin((i * Math.PI) / 4)}
                                    r="4"
                                    fill="none"
                                    stroke="#d4af37"
                                    strokeWidth="0.5"
                                />
                            ))}
                        </g>
                    </svg>
                </div>

                <div className="hero-content">
                    <div className="hero-left">
                        <div className="hero-eyebrow">Organisasi Perempuan</div>
                        <h1 className="hero-title">
                            Dharma Wanita
                            <span>Persatuan</span>
                        </h1>
                        <p className="hero-subtitle">Kota Surabaya</p>
                        <p className="hero-desc">
                            Bersatu dalam pengabdian, berdedikasi untuk
                            kemajuan.
                            <br />
                            Membangun Surabaya melalui pemberdayaan perempuan.
                        </p>
                        <div className="hero-actions">
                            {auth?.user ? (
                                <Link
                                    href="/dashboard"
                                    className="btn-hero-primary"
                                >
                                    Masuk Dashboard
                                </Link>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Link
                                            href="/register"
                                            className="btn-hero-primary"
                                        >
                                            Bergabung Sekarang
                                        </Link>
                                    )}
                                    <Link
                                        href="/login"
                                        className="btn-hero-outline"
                                    >
                                        Sudah Anggota?
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="hero-right">
                        <div className="emblem">
                            {/* Outer rings */}
                            <div
                                className="emblem-ring"
                                style={{
                                    animation: 'rotateSlow 30s linear infinite',
                                }}
                            />
                            <div
                                className="emblem-ring emblem-ring-2"
                                style={{
                                    animation:
                                        'rotateSlow 20s linear infinite reverse',
                                }}
                            />

                            {/* Orbiting dots */}
                            <div className="emblem-dots">
                                {[...Array(12)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="emblem-dot"
                                        style={{
                                            transform: `rotate(${i * 30}deg) translateX(160px)`,
                                            width: i % 3 === 0 ? 8 : 4,
                                            height: i % 3 === 0 ? 8 : 4,
                                            background:
                                                i % 3 === 0
                                                    ? '#d4af37'
                                                    : 'rgba(212,175,55,0.4)',
                                            animationDelay: `${i * 0.2}s`,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* SVG ornament ring */}
                            <svg
                                style={{
                                    position: 'absolute',
                                    inset: 10,
                                    width: 'calc(100% - 20px)',
                                    height: 'calc(100% - 20px)',
                                }}
                                viewBox="0 0 300 300"
                            >
                                <circle
                                    cx="150"
                                    cy="150"
                                    r="148"
                                    fill="none"
                                    stroke="rgba(212,175,55,0.3)"
                                    strokeWidth="0.5"
                                    strokeDasharray="4 8"
                                />
                                {[...Array(24)].map((_, i) => (
                                    <line
                                        key={i}
                                        x1={
                                            150 +
                                            120 * Math.cos((i * Math.PI) / 12)
                                        }
                                        y1={
                                            150 +
                                            120 * Math.sin((i * Math.PI) / 12)
                                        }
                                        x2={
                                            150 +
                                            148 * Math.cos((i * Math.PI) / 12)
                                        }
                                        y2={
                                            150 +
                                            148 * Math.sin((i * Math.PI) / 12)
                                        }
                                        stroke="rgba(212,175,55,0.2)"
                                        strokeWidth="0.5"
                                    />
                                ))}
                            </svg>

                            {/* Center */}
                            <div className="emblem-center">
                                <div className="emblem-dw">DW</div>
                                <div className="emblem-text">Surabaya</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="scroll-indicator">
                    <span>Scroll</span>
                    <div className="scroll-line" />
                </div>
            </section>

            {/* STATS BAND */}
            <section className="stats-band">
                <div className="stats-grid">
                    {stats.map((s, i) => (
                        <div className="stat-item" key={i}>
                            <div className="stat-value">{s.value}</div>
                            <div className="stat-label">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* PILLARS */}
            <div className="section">
                <div className="section-eyebrow">
                    <div className="eyebrow-line" />
                    <span className="eyebrow-text">Tiga Pilar Utama</span>
                </div>
                <h2 className="section-title">Nilai yang Kami Junjung</h2>
                <p className="section-desc">
                    Dharma Wanita Persatuan berdiri di atas tiga pilar
                    fundamental yang menjadi landasan setiap langkah pengabdian
                    kami.
                </p>

                <div className="pillars-grid">
                    {pillars.map((p, i) => (
                        <div className="pillar-card" key={i}>
                            <span className="pillar-icon">{p.icon}</span>
                            <div className="pillar-title">{p.title}</div>
                            <p className="pillar-desc">{p.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ORNAMENT DIVIDER */}
            <div className="ornament-divider">
                <div className="ornament-line" />
                <span className="ornament-symbol">✦</span>
                <span
                    className="ornament-symbol"
                    style={{ animationDelay: '0.5s' }}
                >
                    ◆
                </span>
                <span
                    className="ornament-symbol"
                    style={{ animationDelay: '1s' }}
                >
                    ✦
                </span>
                <div className="ornament-line" />
            </div>

            {/* PROGRAMS */}
            <section className="programs-section">
                <div className="programs-bg-pattern" />
                <div className="programs-inner">
                    <div className="programs-left">
                        <div className="section-eyebrow">
                            <div className="eyebrow-line" />
                            <span className="eyebrow-text">Program Kerja</span>
                        </div>
                        <h2 className="section-title">
                            Bidang Pengabdian Kami
                        </h2>
                        <p className="section-desc">
                            Berbagai program nyata yang telah dan terus kami
                            jalankan demi kesejahteraan masyarakat Kota
                            Surabaya.
                        </p>
                    </div>
                    <div>
                        <div className="programs-list">
                            {programs.map((p, i) => (
                                <div className="program-item" key={i}>
                                    <div className="program-num">{p.num}</div>
                                    <div>
                                        <div className="program-title">
                                            {p.title}
                                        </div>
                                        <div className="program-desc">
                                            {p.desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* QUOTE */}
            <section className="quote-section">
                <div className="quote-inner">
                    <span className="quote-mark">"</span>
                    <p className="quote-text">
                        Perempuan adalah tiang negara. Jika perempuannya baik,
                        maka baiklah negara itu. Jika perempuannya rusak, maka
                        rusaklah negara itu.
                    </p>
                    <div
                        style={{
                            width: 40,
                            height: 1,
                            background: 'var(--gold)',
                            margin: '1rem auto',
                        }}
                    />
                    <div className="quote-author">
                        ✦ Falsafah Dharma Wanita ✦
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="cta-inner">
                    <div
                        className="section-eyebrow"
                        style={{ justifyContent: 'center' }}
                    >
                        <div className="eyebrow-line" />
                        <span className="eyebrow-text">
                            Bergabung Bersama Kami
                        </span>
                        <div className="eyebrow-line" />
                    </div>
                    <h2 className="cta-title">Bersama Kita Lebih Kuat</h2>
                    <p className="cta-desc">
                        Jadilah bagian dari keluarga besar Dharma Wanita
                        Persatuan Kota Surabaya. Bersama-sama kita wujudkan
                        perempuan yang mandiri, berdaya, dan penuh prestasi.
                    </p>
                    <div className="cta-buttons">
                        {auth?.user ? (
                            <Link href="/dashboard" className="btn-cta-primary">
                                Buka Dashboard
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link
                                        href="/register"
                                        className="btn-cta-primary"
                                    >
                                        Daftar Sekarang
                                    </Link>
                                )}
                                <Link href="/login" className="btn-cta-outline">
                                    Masuk
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="footer">
                <div className="footer-logo">Dharma Wanita Persatuan</div>
                <div className="footer-sub">Kota Surabaya</div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        color: 'var(--gold)',
                        fontSize: '0.8rem',
                        marginBottom: '0.5rem',
                    }}
                >
                    <span>✦</span>
                    <span>Pemberdayaan</span>
                    <span>✦</span>
                    <span>Dedikasi</span>
                    <span>✦</span>
                    <span>Pelayanan</span>
                </div>
                <div className="footer-divider" />
                <div className="footer-copy">
                    © {new Date().getFullYear()} Dharma Wanita Persatuan Kota
                    Surabaya. Hak cipta dilindungi.
                </div>
            </footer>
        </>
    );
}
