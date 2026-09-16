'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const WA = '5492613861323';
const waLink = (msg: string) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
const DEFAULT_MSG = '¡Hola! Quiero info sobre las promos de Big Bang Pelotero 🎉';

const DRIVE1 = (id: string, w = 600) =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

const PHOTOS = [
  { id: '1uxVr8q2TCZqpS-DHbBaStNa8fd_ioQz4', label: 'Entrada' },
  { id: '1cAig93_4i5wOjtoOucopXkK7VmySx1QL', label: 'Laberinto' },
  { id: '1rqMg9_jnepmftZwyt63geejGvnDN2oPF', label: 'Arcade' },
  { id: '1j5JJdLCg8r6RP_49vgAeXKTQF3W3e5Bq', label: 'Arcade 2' },
  { id: '1tbGYmdkt1kDBn3EkDBqYFahkWhV47BKX', label: 'Simuladores' },
  { id: '1lBUXlOID7rN0XpR6qlFGCBjOnVh4X8k9', label: 'Simulador F1' },
  { id: '1z6uHKUwYk-HKBjT35Wx-ViHzY3JOI0g1', label: 'Candy bar' },
  { id: '1nvqtnhzXEYN_eleRhvMBFCvZ-Fg_dJ-R', label: 'Salón' },
  { id: '18hdqot3j9kr3PYJwTP7NSbSJY_0bBkmS', label: 'Mesas' },
  { id: '1TKv6DWbdQ-JThIikz5WfH6UNsORf5rcM', label: 'Grúa premios' },
  { id: '1-3o8b-Sh41cqE-TnqJ4hEOQJI1ar5B-F', label: 'Juegos' },
  { id: '1Rueuki_-g9EFv1I1jAF5PvC8anQXrEyt', label: 'Inflable' },
];

const COMMON_INCLUDES = [
  { icon: '👩‍🍳', text: 'Coordinadora de evento' },
  { icon: '🍳', text: 'Cocinera' },
  { icon: '🤝', text: 'Moza' },
  { icon: '🎮', text: 'Auxiliar de juegos' },
  { icon: '🏠', text: 'Salón exclusivo para 60 personas' },
  { icon: '⏱️', text: '3 horas de evento' },
  { icon: '🍽️', text: 'Cocina totalmente equipada' },
  { icon: '❄️', text: 'Aire acondicionado y calefacción' },
  { icon: '🎵', text: 'Música ambiental a elección' },
  { icon: '🍬', text: 'Mesas de candy bar' },
  { icon: '🌿', text: 'Sector patio' },
  { icon: '🚻', text: 'Baños con cambiador para bebés' },
  { icon: '🎈', text: '3 inflables enormes' },
  { icon: '🏃', text: '2 laberintos gigantes' },
  { icon: '🏰', text: 'Plaza blanda con castillo' },
  { icon: '⚽', text: 'Cancha de fútbol' },
  { icon: '🎯', text: 'Pool, metegol, ping pong y tejo' },
  { icon: '🕹️', text: 'Videojuegos tipo arcade' },
  { icon: '📺', text: '2 TV + consolas de videojuegos' },
];

const PROMOS = [
  {
    key: 'super',
    name: 'SUPER PROMO',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.4)',
    diasLabel: 'Lunes a Viernes',
    turnos: ['13:00 a 16:00 hs', '16:30 a 19:30 hs'],
    precios: [{ label: 'Lun–Vie', precio: '$265.000' }],
    sena: 'Se abona el total en efectivo al momento de contratar',
    cancelacion: null,
    menu: null,
    badge: 'MÁS ECONÓMICA',
    extras: [],
  },
  {
    key: 'clasic',
    name: 'CLASIC',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.4)',
    diasLabel: 'Todos los días',
    turnos: ['13:00 a 16:00 hs', '16:30 a 19:30 hs', '20:00 a 23:00 hs'],
    precios: [
      { label: 'Lun–Jue', precio: '$310.000' },
      { label: 'Vie–Dom y feriados', precio: '$335.000' },
    ],
    sena: 'Señá con $150.000 (efectivo o transferencia)',
    cancelacion: 'Saldo cancelado 15 días antes del evento (solo efectivo)',
    menu: null,
    badge: null,
    extras: [],
  },
  {
    key: 'full',
    name: 'FULL',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.4)',
    diasLabel: 'Todos los días',
    turnos: ['13:00 a 16:00 hs', '16:30 a 19:30 hs', '20:00 a 23:00 hs'],
    precios: [
      { label: 'Lun–Jue', precio: '$370.000' },
      { label: 'Vie–Dom y feriados', precio: '$399.000' },
    ],
    sena: 'Señá con el 50% (efectivo o transferencia)',
    cancelacion: 'Saldo cancelado 15 días antes del evento (solo efectivo)',
    menu: '🍕 5 pizzas muzzarella de 12 porciones (60 porciones totales) + 🌭 24 panchos individuales con aderezos',
    badge: 'MÁS COMPLETA',
    extras: ['Menú básico incluido en el precio'],
  },
] as const;

const JUEGOS = [
  { icon: '🎈', text: '3 Inflables enormes' },
  { icon: '🏃', text: '2 Laberintos gigantes' },
  { icon: '🏰', text: 'Plaza blanda con castillo' },
  { icon: '⚽', text: 'Cancha de fútbol' },
  { icon: '🎮', text: 'Videojuegos tipo arcade' },
  { icon: '📺', text: '2 TV + consolas de videojuegos' },
  { icon: '🎱', text: 'Pool, metegol, ping pong y tejo' },
];

const SERVICIOS = [
  { icon: '🏠', text: 'Salón exclusivo para 60 personas' },
  { icon: '⏱️', text: '3 horas de evento' },
  { icon: '🍳', text: 'Cocina totalmente equipada' },
  { icon: '❄️', text: 'Aire acondicionado y calefacción' },
  { icon: '🎵', text: 'Música ambiental a elección' },
  { icon: '🍬', text: 'Mesas de candy bar' },
  { icon: '🌿', text: 'Sector patio' },
  { icon: '🚻', text: 'Baños con cambiador para bebés' },
  { icon: '👩‍🍳', text: 'Coordinadora, cocinera, moza y auxiliar' },
];

const ADICIONALES = [
  { item: 'Hora extra', lj: '$103.000', finde: '$—' },
  { item: 'Invitado extra (sobre 60)', lj: '$5.170 c/u', finde: '$5.170 c/u' },
  { item: 'Moza', lj: '$40.500', finde: '$40.500' },
  { item: 'Parrillero + leña', lj: '$49.000', finde: '$49.000' },
  { item: 'Dispenser de jugo o café', lj: '$18.000', finde: '$18.000' },
  { item: 'Menú salado o dulce', lj: 'Consultar', finde: 'Consultar' },
  { item: 'Bebidas', lj: 'Consultar', finde: 'Consultar' },
];

const MENU_SALADO = [
  { item: 'Pizza muzzarella 12 porciones', precio: '$17.500' },
  { item: 'Pizza napolitana o especial 12 porciones', precio: '$20.700' },
  { item: 'Combo 24 panchos con aderezos', precio: '$53.500' },
  { item: 'Combo 12 hamburguesas a la parrilla', precio: '$70.000' },
  { item: 'Combo snack (papas, chizitos, palitos)', precio: '$48.500' },
  { item: 'Docena de empanadas (carne o jamón/queso)', precio: '$20.000' },
  { item: 'Sandwich de miga triples x100', precio: '$110.000' },
];

const MENU_BEBIDAS = [
  { item: 'Gaseosa Pepsi 1,5 lts', precio: '$7.500' },
  { item: 'Agua saborizada H2O 1,5 lts', precio: '$7.500' },
  { item: 'Agua mineral Eco de los Andes 1,5 lts', precio: '$7.500' },
  { item: 'Cerveza Quilmes 1 lt', precio: '$9.200' },
  { item: 'Bolsa de hielo 3,5 kg', precio: '$7.900' },
];

function useCounter(target: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [active, target]);
  return count;
}

function StatItem({ value, label, suffix = '', active }: { value: number; label: string; suffix?: string; active: boolean }) {
  const count = useCounter(value, active);
  return (
    <div style={{ textAlign: 'center', padding: '0 12px' }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

export default function BigBangWeb() {
  const [statsVisible, setStatsVisible] = useState(false);
  const [activePromo, setActivePromo] = useState<'super' | 'clasic' | 'full'>('clasic');
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const promo = PROMOS.find(p => p.key === activePromo)!;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @font-face {
          font-family: 'SuperHistories';
          src: url('/fonts/SuperHistories.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #050818; color: #e2e8f0; font-family: 'DM Sans', sans-serif; }

        .bb-stars {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse at top, #0d1333 0%, #050818 70%);
        }
        .bb-stars::before, .bb-stars::after {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px);
          background-size: 100px 80px, 60px 90px;
          background-position: 0 0, 30px 40px;
          animation: twinkle 4s infinite alternate;
        }
        .bb-stars::after { animation-delay: 2s; opacity: 0.4; }
        @keyframes twinkle { from { opacity: 0.6; } to { opacity: 1; } }

        .fredoka { font-family: 'SuperHistories', 'Fredoka One', cursive; }

        .bb-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 12px 24px;
          display: flex; align-items: center; justify-content: space-between;
          transition: all 0.3s;
        }
        .bb-nav.scrolled {
          background: rgba(5,8,24,0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .bb-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 99px;
          border: none; cursor: pointer;
          font-family: 'Fredoka One', cursive; font-size: 16px;
          text-decoration: none; transition: all 0.2s;
        }
        .bb-btn-primary {
          background: linear-gradient(135deg, #e53e3e, #f59e0b);
          color: #fff;
          box-shadow: 0 4px 20px rgba(229,62,62,0.4);
        }
        .bb-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(229,62,62,0.5); }
        .bb-btn-wa {
          background: #25D366; color: #fff;
          box-shadow: 0 4px 20px rgba(37,211,102,0.3);
        }
        .bb-btn-wa:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(37,211,102,0.4); }
        .bb-btn-outline {
          background: transparent; color: #e2e8f0;
          border: 2px solid rgba(255,255,255,0.2);
        }
        .bb-btn-outline:hover { border-color: #f59e0b; color: #f59e0b; }

        .bb-section { position: relative; z-index: 1; padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
        .bb-section-title {
          font-family: 'Fredoka One', cursive;
          font-size: clamp(28px, 5vw, 48px);
          color: #fff; text-align: center; margin-bottom: 12px;
        }
        .bb-section-sub { text-align: center; color: #94a3b8; margin-bottom: 48px; font-size: 16px; }

        .bb-glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }

        .bb-photo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
        }
        .bb-photo-item {
          border-radius: 16px; overflow: hidden;
          aspect-ratio: 3/4;
          position: relative;
        }
        .bb-photo-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .bb-photo-item:hover img { transform: scale(1.05); }

        .promo-tab {
          padding: 10px 22px; border-radius: 99px;
          border: 2px solid transparent; cursor: pointer;
          font-family: 'Fredoka One', cursive; font-size: 15px;
          background: transparent; color: #94a3b8;
          transition: all 0.2s;
        }
        .promo-tab.active {
          color: #fff;
        }

        .feature-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .feature-icon { font-size: 22px; min-width: 32px; }
        .feature-text { font-size: 14px; color: #cbd5e1; line-height: 1.4; }

        .adicional-row {
          display: grid; grid-template-columns: 1fr auto;
          gap: 12px; padding: 12px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          align-items: center;
        }
        .adicional-item { font-size: 14px; color: #94a3b8; }
        .adicional-precio { font-size: 14px; font-weight: 600; color: #f59e0b; text-align: right; }

        .menu-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 16px;
        }
        .menu-item { font-size: 14px; color: #cbd5e1; }
        .menu-precio { font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; }

        .turno-badge {
          display: inline-block; padding: 8px 18px; border-radius: 99px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          font-size: 14px; color: #e2e8f0; margin: 6px;
        }

        @media (max-width: 640px) {
          .bb-section { padding: 60px 16px; }
          .bb-photo-grid { grid-template-columns: repeat(2, 1fr); }
          .bb-nav-links { display: none; }
        }
      `}</style>

      <div className="bb-stars" />

      {/* NAV */}
      <nav className={`bb-nav${navScrolled ? ' scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Image src="/logo-bigbang.png" alt="Big Bang" width={80} height={40} style={{ objectFit: 'contain' }} />
        </div>
        <div className="bb-nav-links" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {[['#juegos', 'El salón'], ['#tour', 'Tour 360°'], ['#promos', 'Promos'], ['#menu', 'Menú']].map(([href, label]) => (
            <a key={href} href={href} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
              {label}
            </a>
          ))}
        </div>
        <a href={waLink(DEFAULT_MSG)} target="_blank" rel="noopener noreferrer" className="bb-btn bb-btn-wa" style={{ fontSize: 14, padding: '8px 18px' }}>
          💬 Reservar
        </a>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 24px 60px' }}>
        <div style={{ position: 'relative', marginBottom: 32 }}>
          <Image src="/logo-bigbang.png" alt="Big Bang Pelotero" width={280} height={140} style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 40px rgba(229,62,62,0.4))' }} priority />
        </div>
        <h1 className="fredoka" style={{ fontSize: 'clamp(32px, 7vw, 72px)', color: '#fff', lineHeight: 1.1, marginBottom: 16, maxWidth: 700 }}>
          El cumpleaños más{' '}
          <span style={{ color: '#f59e0b' }}>EXPLOSIVO</span> de tu hijo/a
        </h1>
        <p style={{ fontSize: 'clamp(15px, 2.5vw, 20px)', color: '#94a3b8', maxWidth: 500, marginBottom: 40, lineHeight: 1.6 }}>
          Salón exclusivo, juegos increíbles y todo el servicio para que vos solo disfrutes.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="#promos" className="bb-btn bb-btn-primary">🚀 Ver promos</a>
          <a href={waLink(DEFAULT_MSG)} target="_blank" rel="noopener noreferrer" className="bb-btn bb-btn-wa">💬 Consultar por WhatsApp</a>
        </div>
        <p style={{ marginTop: 32, fontSize: 13, color: '#475569' }}>
          📍 Calle 25 de Mayo 2985, Barrio Unimev, Villa Nueva
        </p>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', animation: 'twinkle 1.5s infinite alternate' }}>
          <div style={{ color: '#475569', fontSize: 24 }}>↓</div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 32 }}>
          <StatItem value={60} label="personas" active={statsVisible} />
          <StatItem value={3} label="turnos" active={statsVisible} />
          <StatItem value={3} label="inflables" active={statsVisible} />
          <StatItem value={11} label="videojuegos" active={statsVisible} />
          <StatItem value={3} label="horas de diversión" active={statsVisible} />
        </div>
      </div>

      {/* JUEGOS Y SERVICIOS */}
      <section id="juegos">
        <div className="bb-section">
          <h2 className="bb-section-title">¿Qué incluye el salón?</h2>
          <p className="bb-section-sub">Todo esto está incluido en cualquiera de nuestras promos</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {/* Juegos */}
            <div className="bb-glass" style={{ padding: '28px 24px' }}>
              <div className="fredoka" style={{ fontSize: 20, color: '#f59e0b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                🕹️ Juegos incluidos
              </div>
              {JUEGOS.map((j, i) => (
                <div key={i} className="feature-item">
                  <span className="feature-icon">{j.icon}</span>
                  <span className="feature-text">{j.text}</span>
                </div>
              ))}
            </div>

            {/* Servicios */}
            <div className="bb-glass" style={{ padding: '28px 24px' }}>
              <div className="fredoka" style={{ fontSize: 20, color: '#06b6d4', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                ✨ Servicios incluidos
              </div>
              {SERVICIOS.map((s, i) => (
                <div key={i} className="feature-item">
                  <span className="feature-icon">{s.icon}</span>
                  <span className="feature-text">{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TOUR 360° */}
      <section id="tour" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 className="bb-section-title fredoka" style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(28px,5vw,48px)', color: '#fff', textAlign: 'center', marginBottom: 12 }}>
            Recorrido virtual 360°
          </h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 40, fontSize: 16 }}>
            Conocé el salón sin salir de casa — arrastrá para explorar cada rincón
          </p>
          <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 60px rgba(229,62,62,0.15)' }}>
            <iframe
              src="https://kuula.co/share/collection/7TQQ3?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1"
              style={{ width: '100%', height: 'clamp(300px, 55vw, 600px)', border: 'none', display: 'block' }}
              allowFullScreen
              allow="xr-spatial-tracking"
              title="Tour 360° Big Bang Pelotero"
            />
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 className="bb-section-title fredoka" style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(28px,5vw,48px)', color: '#fff', textAlign: 'center', marginBottom: 48 }}>
            Así la pasamos 🎉
          </h2>
          <div className="bb-photo-grid">
            {PHOTOS.map((p) => (
              <div key={p.id} className="bb-photo-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={DRIVE1(p.id)}
                  alt={p.label}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TURNOS */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="fredoka" style={{ fontSize: 20, color: '#94a3b8', marginBottom: 16 }}>🕐 Turnos disponibles</div>
        {['13:00 a 16:00 hs', '16:30 a 19:30 hs', '20:00 a 23:00 hs'].map(t => (
          <span key={t} className="turno-badge">{t}</span>
        ))}
      </div>

      {/* PROMOS */}
      <section id="promos">
        <div className="bb-section">
          <h2 className="bb-section-title">Nuestras promos</h2>
          <p className="bb-section-sub">Elegí la que mejor se adapta a tu evento</p>

          {/* Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
            {PROMOS.map(p => (
              <button key={p.key} className={`promo-tab${activePromo === p.key ? ' active' : ''}`}
                onClick={() => setActivePromo(p.key as typeof activePromo)}
                style={{
                  borderColor: activePromo === p.key ? p.color : 'transparent',
                  color: activePromo === p.key ? p.color : '#94a3b8',
                  background: activePromo === p.key ? p.bg : 'transparent',
                }}>
                {p.name}
              </button>
            ))}
          </div>

          {/* Promo Card */}
          <div className="bb-glass" style={{ maxWidth: 680, margin: '0 auto', padding: '36px 32px', border: `1px solid ${promo.border}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <div>
                {promo.badge && (
                  <div style={{ display: 'inline-block', background: promo.color, color: '#000', padding: '3px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>
                    ⭐ {promo.badge}
                  </div>
                )}
                <div className="fredoka" style={{ fontSize: 36, color: promo.color, lineHeight: 1 }}>{promo.name}</div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>📅 {promo.diasLabel}</div>
              </div>
            </div>

            {/* Precios */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
              {promo.precios.map((pr, i) => (
                <div key={i} style={{ flex: 1, minWidth: 130, background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '16px 20px', border: `1px solid ${promo.border}` }}>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{pr.label}</div>
                  <div className="fredoka" style={{ fontSize: 28, color: '#fff' }}>{pr.precio}</div>
                </div>
              ))}
            </div>

            {/* Turnos */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>🕐 Turnos disponibles</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {promo.turnos.map(t => (
                  <span key={t} style={{ fontSize: 13, color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 99 }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Seña y cancelación */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>💳 Seña</div>
              <div style={{ fontSize: 14, color: '#cbd5e1' }}>{promo.sena}</div>
              {promo.cancelacion && (
                <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>⚠️ {promo.cancelacion}</div>
              )}
            </div>

            {/* Menú incluido (solo FULL) */}
            {promo.menu && (
              <div style={{ background: `rgba(6,182,212,0.08)`, borderRadius: 12, padding: '14px 16px', marginBottom: 12, border: '1px solid rgba(6,182,212,0.2)' }}>
                <div style={{ fontSize: 12, color: '#06b6d4', marginBottom: 6, fontWeight: 700 }}>MENÚ INCLUIDO EN EL PRECIO</div>
                <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6 }}>{promo.menu}</div>
              </div>
            )}

            {/* Todo lo que incluye */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>✅ Todo esto incluido</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
                {COMMON_INCLUDES.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}>
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <a href={waLink(`¡Hola! Me interesa la promo ${promo.name} de Big Bang Pelotero, ¿me podés dar más info?`)}
              target="_blank" rel="noopener noreferrer"
              className="bb-btn bb-btn-wa"
              style={{ display: 'flex', justifyContent: 'center', fontSize: 16 }}>
              💬 Consultar promo {promo.name}
            </a>
          </div>

          {/* Comparativa rápida */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 40, maxWidth: 700, margin: '40px auto 0' }}>
            {PROMOS.map(p => (
              <div key={p.key} className="bb-glass" style={{ padding: '20px 16px', textAlign: 'center', border: `1px solid ${activePromo === p.key ? p.color : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
                onClick={() => setActivePromo(p.key as typeof activePromo)}>
                <div className="fredoka" style={{ color: p.color, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{p.precios[0].precio}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{p.diasLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADICIONALES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 className="bb-section-title fredoka" style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(28px,5vw,48px)', color: '#fff', textAlign: 'center', marginBottom: 40 }}>
            Adicionales
          </h2>
          <div className="bb-glass" style={{ padding: '28px 24px' }}>
            {ADICIONALES.map((a, i) => (
              <div key={i} className="adicional-row">
                <div className="adicional-item">{a.item}</div>
                <div className="adicional-precio">{a.lj !== a.finde ? `${a.lj} / ${a.finde}` : a.lj}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENÚ */}
      <section id="menu" style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 className="bb-section-title fredoka" style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(28px,5vw,48px)', color: '#fff', textAlign: 'center', marginBottom: 12 }}>
            Lista de precios
          </h2>
          <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 40, fontSize: 14 }}>Precios sujetos a variación sin previo aviso</p>

          <div className="bb-glass" style={{ padding: '28px 24px', marginBottom: 20 }}>
            <div className="fredoka" style={{ fontSize: 18, color: '#f59e0b', marginBottom: 16 }}>🍕 Salado</div>
            {MENU_SALADO.map((m, i) => (
              <div key={i} className="menu-row">
                <span className="menu-item">{m.item}</span>
                <span className="menu-precio">{m.precio}</span>
              </div>
            ))}
          </div>

          <div className="bb-glass" style={{ padding: '28px 24px' }}>
            <div className="fredoka" style={{ fontSize: 18, color: '#06b6d4', marginBottom: 16 }}>🥤 Bebidas</div>
            {MENU_BEBIDAS.map((m, i) => (
              <div key={i} className="menu-row">
                <span className="menu-item">{m.item}</span>
                <span className="menu-precio">{m.precio}</span>
              </div>
            ))}
            <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, fontSize: 13, color: '#64748b' }}>
              🎂 Tortas, alfajores y menú mesa dulce — consultá precios por WhatsApp
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER / CONTACTO */}
      <footer style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <Image src="/logo-bigbang.png" alt="Big Bang" width={120} height={60} style={{ objectFit: 'contain', marginBottom: 24, opacity: 0.9 }} />

        <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 8 }}>
          📍 Calle 25 de Mayo 2985, Barrio Unimev, Villa Nueva
        </p>
        <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 32 }}>
          📞 +54 261 386-1323
        </p>

        <a href={waLink(DEFAULT_MSG)} target="_blank" rel="noopener noreferrer"
          className="bb-btn bb-btn-wa" style={{ fontSize: 18, padding: '16px 36px', marginBottom: 32 }}>
          💬 Escribinos por WhatsApp
        </a>

        <div style={{ marginBottom: 40 }}>
          <div style={{ color: '#475569', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Turnos disponibles</div>
          {['13:00 a 16:00 hs', '16:30 a 19:30 hs', '20:00 a 23:00 hs'].map(t => (
            <span key={t} className="turno-badge">{t}</span>
          ))}
        </div>

        <p style={{ color: '#1e293b', fontSize: 12 }}>© {new Date().getFullYear()} Big Bang Pelotero · Villa Nueva, Mendoza</p>
      </footer>
    </>
  );
}
