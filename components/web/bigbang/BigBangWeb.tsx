'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const WA = '5492613861323';
const waLink = (msg: string) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
const DEFAULT_MSG = '¡Hola! Quiero info sobre las promos de Big Bang Pelotero 🎉';

const DEFAULTS: Record<string, string> = {
  promo_super_lv: '265000', promo_clasic_lj: '310000', promo_clasic_finde: '335000',
  promo_clasic_sena: '150000', promo_full_lj: '370000', promo_full_finde: '399000',
  adic_hora_extra: '103000', adic_invitado_extra: '5170', adic_moza: '40500',
  adic_parrillero: '49000', adic_dispenser: '18000',
  menu_pizza_muzza: '17500', menu_pizza_napo: '20700', menu_panchos_24: '53500',
  menu_hamburguesas_12: '70000', menu_snack: '48500', menu_empanadas: '20000', menu_sandwiches: '110000',
  beb_gaseosa: '7500', beb_agua_sab: '7500', beb_agua_min: '7500', beb_cerveza: '9200', beb_hielo: '7900',
};

const $$ = (precios: Record<string, string>, key: string) => {
  const n = parseInt(precios[key] ?? DEFAULTS[key] ?? '0', 10);
  return '$' + n.toLocaleString('es-AR');
};

const DRIVE = (id: string, w = 600) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;

const PHOTOS = [
  { id: '1uxVr8q2TCZqpS-DHbBaStNa8fd_ioQz4', label: 'Entrada', color: '#f59e0b' },
  { id: '1cAig93_4i5wOjtoOucopXkK7VmySx1QL', label: 'Laberinto', color: '#ef4444' },
  { id: '1rqMg9_jnepmftZwyt63geejGvnDN2oPF', label: 'Arcade', color: '#8b5cf6' },
  { id: '1j5JJdLCg8r6RP_49vgAeXKTQF3W3e5Bq', label: 'Arcade 2', color: '#06b6d4' },
  { id: '1tbGYmdkt1kDBn3EkDBqYFahkWhV47BKX', label: 'Simuladores', color: '#10b981' },
  { id: '1lBUXlOID7rN0XpR6qlFGCBjOnVh4X8k9', label: 'Simulador F1', color: '#f97316' },
  { id: '1z6uHKUwYk-HKBjT35Wx-ViHzY3JOI0g1', label: 'Candy bar', color: '#ec4899' },
  { id: '1nvqtnhzXEYN_eleRhvMBFCvZ-Fg_dJ-R', label: 'Salón', color: '#f59e0b' },
  { id: '18hdqot3j9kr3PYJwTP7NSbSJY_0bBkmS', label: 'Mesas', color: '#06b6d4' },
  { id: '1TKv6DWbdQ-JThIikz5WfH6UNsORf5rcM', label: 'Grúa', color: '#8b5cf6' },
  { id: '1-3o8b-Sh41cqE-TnqJ4hEOQJI1ar5B-F', label: 'Juegos', color: '#ef4444' },
  { id: '1Rueuki_-g9EFv1I1jAF5PvC8anQXrEyt', label: 'Inflable', color: '#10b981' },
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
    emoji: '⚡',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.4)',
    diasLabel: 'Lunes a Viernes',
    turnos: ['13:00 a 16:00 hs', '16:30 a 19:30 hs'],
    precios: [{ label: 'Lun–Vie', precioKey: 'promo_super_lv' }],
    sena: 'Se abona el total en efectivo al momento de contratar',
    cancelacion: null,
    menu: null,
    badge: 'MÁS ECONÓMICA',
    extras: [],
  },
  {
    key: 'clasic',
    name: 'CLASIC',
    emoji: '🎉',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.4)',
    diasLabel: 'Todos los días',
    turnos: ['13:00 a 16:00 hs', '16:30 a 19:30 hs', '20:00 a 23:00 hs'],
    precios: [
      { label: 'Lun–Jue', precioKey: 'promo_clasic_lj' },
      { label: 'Vie–Dom y feriados', precioKey: 'promo_clasic_finde' },
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
    emoji: '👑',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.4)',
    diasLabel: 'Todos los días',
    turnos: ['13:00 a 16:00 hs', '16:30 a 19:30 hs', '20:00 a 23:00 hs'],
    precios: [
      { label: 'Lun–Jue', precioKey: 'promo_full_lj' },
      { label: 'Vie–Dom y feriados', precioKey: 'promo_full_finde' },
    ],
    sena: 'Señá con el 50% (efectivo o transferencia)',
    cancelacion: 'Saldo cancelado 15 días antes del evento (solo efectivo)',
    menu: '🍕 5 pizzas muzzarella (60 porciones) + 🌭 24 panchos con aderezos',
    badge: 'MÁS COMPLETA',
    extras: ['Menú básico incluido en el precio'],
  },
];

const ADICIONALES = [
  { item: 'Hora extra', precioKey: 'adic_hora_extra', suffix: '' },
  { item: 'Invitado extra (sobre 60)', precioKey: 'adic_invitado_extra', suffix: ' c/u' },
  { item: 'Moza', precioKey: 'adic_moza', suffix: '' },
  { item: 'Parrillero + leña', precioKey: 'adic_parrillero', suffix: '' },
  { item: 'Dispenser de jugo o café', precioKey: 'adic_dispenser', suffix: '' },
  { item: 'Menú salado o dulce', precioKey: null, suffix: '' },
  { item: 'Bebidas', precioKey: null, suffix: '' },
];

const MENU_SALADO = [
  { item: 'Pizza muzzarella 12 porciones', precioKey: 'menu_pizza_muzza' },
  { item: 'Pizza napolitana o especial 12 porciones', precioKey: 'menu_pizza_napo' },
  { item: 'Combo 24 panchos con aderezos', precioKey: 'menu_panchos_24' },
  { item: 'Combo 12 hamburguesas a la parrilla', precioKey: 'menu_hamburguesas_12' },
  { item: 'Combo snack (papas, chizitos, palitos)', precioKey: 'menu_snack' },
  { item: 'Docena de empanadas (carne o jamón/queso)', precioKey: 'menu_empanadas' },
  { item: 'Sandwich de miga triples x100', precioKey: 'menu_sandwiches' },
];

const MENU_BEBIDAS = [
  { item: 'Gaseosa Pepsi 1,5 lts', precioKey: 'beb_gaseosa' },
  { item: 'Agua saborizada H2O 1,5 lts', precioKey: 'beb_agua_sab' },
  { item: 'Agua mineral Eco de los Andes 1,5 lts', precioKey: 'beb_agua_min' },
  { item: 'Cerveza Quilmes 1 lt', precioKey: 'beb_cerveza' },
  { item: 'Bolsa de hielo 3,5 kg', precioKey: 'beb_hielo' },
];

export default function BigBangWeb() {
  const [precios, setPrecios] = useState<Record<string, string>>(DEFAULTS);
  const [activePromo, setActivePromo] = useState<'super' | 'clasic' | 'full'>('clasic');
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    fetch('/api/bigbang/precios-web')
      .then(r => r.ok ? r.json() : DEFAULTS)
      .then(data => setPrecios(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const promo = PROMOS.find(p => p.key === activePromo)!;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,900;1,900&display=swap');
        @font-face {
          font-family: 'SuperHistories';
          src: url('/fonts/SuperHistories.ttf') format('truetype');
          font-weight: normal; font-style: normal; font-display: swap;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #06081a; color: #e2e8f0; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

        .bb-font { font-family: 'SuperHistories', sans-serif; }

        /* NAV */
        .bb-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 14px 28px;
          display: flex; align-items: center; justify-content: space-between;
          transition: all 0.3s;
        }
        .bb-nav.scrolled {
          background: rgba(6,8,26,0.96);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .bb-nav-link {
          color: #94a3b8; text-decoration: none; font-size: 14px;
          font-weight: 500; transition: color 0.2s;
        }
        .bb-nav-link:hover { color: #fff; }

        /* STARS */
        .bb-stars {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse at top, #0e1540 0%, #06081a 65%);
        }
        .bb-stars::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px),
            radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px);
          background-size: 120px 90px, 70px 110px;
          background-position: 10px 10px, 50px 60px;
          animation: twinkle 5s infinite alternate;
        }
        @keyframes twinkle { from { opacity: 0.5; } to { opacity: 1; } }

        /* HERO */
        .bb-hero {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          padding: 100px 60px 60px;
          gap: 40px;
          max-width: 1400px;
          margin: 0 auto;
        }
        @media (max-width: 900px) {
          .bb-hero { grid-template-columns: 1fr; padding: 100px 24px 60px; }
          .bb-hero-img { display: none; }
        }

        /* RAINBOW */
        .bb-rainbow {
          height: 8px; border-radius: 99px;
          background: linear-gradient(90deg, #ff3b7a, #ff6b35, #f59e0b, #22c55e, #06b6d4, #8b5cf6);
          margin-bottom: 20px;
          width: 120px;
        }

        /* OUTLINED TEXT */
        .bb-outlined {
          -webkit-text-stroke: 3px #f59e0b;
          color: transparent;
        }

        /* STICKER FLOAT */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-12px) rotate(5deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(10deg); }
          50% { transform: translateY(-8px) rotate(-10deg); }
        }
        .bb-sticker { position: absolute; user-select: none; pointer-events: none; }
        .bb-float { animation: float 3s ease-in-out infinite; }
        .bb-float2 { animation: float2 4s ease-in-out infinite; }

        /* STATS BAR */
        .bb-stats-bar {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 99px;
          max-width: 1000px;
          margin: 0 auto 0;
          padding: 20px 40px;
          display: flex;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 20px;
        }
        .bb-stat-item {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          text-align: center;
        }
        .bb-stat-icon { font-size: 24px; }
        .bb-stat-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; max-width: 80px; }

        /* LIGHT SECTION */
        .bb-light-section {
          background: #f0f4ff;
          color: #1e293b;
          position: relative; z-index: 1;
        }

        /* PHOTO GRID */
        .bb-photo-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        @media (max-width: 768px) {
          .bb-photo-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        .bb-photo-card {
          border-radius: 16px; overflow: hidden;
          aspect-ratio: 3/4;
          position: relative; cursor: pointer;
        }
        .bb-photo-card img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .bb-photo-card:hover img { transform: scale(1.06); }
        .bb-photo-label {
          position: absolute; bottom: 10px; left: 10px; right: 10px;
          color: #fff; font-size: 12px; font-weight: 800; text-align: center;
          padding: 6px 8px; border-radius: 10px; letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* TOUR SECTION */
        .bb-tour-section {
          position: relative; z-index: 1;
          background: linear-gradient(160deg, #0e0520 0%, #06081a 60%);
          border-top: 1px solid rgba(139,92,246,0.2);
          border-bottom: 1px solid rgba(139,92,246,0.2);
          padding: 80px 24px;
          text-align: center;
          overflow: hidden;
        }

        /* PROMO TABS */
        .promo-pill {
          padding: 14px 28px; border-radius: 99px;
          border: 2px solid; cursor: pointer;
          font-family: 'SuperHistories', sans-serif; font-size: 16px;
          transition: all 0.25s; display: flex; align-items: center; gap: 8px;
        }

        /* GALLERY GRID */
        .bb-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
        }
        .bb-gallery-item {
          border-radius: 14px; overflow: hidden;
          aspect-ratio: 1; position: relative;
        }
        .bb-gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .bb-gallery-item:hover img { transform: scale(1.07); }

        /* MENU ROW */
        .bb-menu-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); gap: 16px;
        }

        /* WA FIXED */
        .bb-wa-fixed {
          position: fixed; bottom: 24px; right: 24px; z-index: 200;
          width: 60px; height: 60px; border-radius: 50%;
          background: #25D366;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; text-decoration: none;
          box-shadow: 0 4px 20px rgba(37,211,102,0.5);
          transition: transform 0.2s;
        }
        .bb-wa-fixed:hover { transform: scale(1.1); }

        @media (max-width: 640px) {
          .bb-stats-bar { border-radius: 24px; padding: 20px 16px; }
          .bb-outlined { -webkit-text-stroke: 2px #f59e0b; }
        }
      `}</style>

      <div className="bb-stars" />

      {/* WA flotante */}
      <a href={waLink(DEFAULT_MSG)} target="_blank" rel="noopener noreferrer" className="bb-wa-fixed">💬</a>

      {/* NAV */}
      <nav className={`bb-nav${navScrolled ? ' scrolled' : ''}`}>
        <Image src="/logo-bigbang.png" alt="Big Bang" width={90} height={45} style={{ objectFit: 'contain' }} />
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="bb-nav-links-d">
          {[['#salon', 'El salón'], ['#tour', 'Tour 360°'], ['#promos', 'Promos'], ['#galeria', 'Galería'], ['#menu', 'Menú'], ['#contacto', 'Contacto']].map(([href, label]) => (
            <a key={href} href={href} className="bb-nav-link">{label}</a>
          ))}
        </div>
        <a href={waLink(DEFAULT_MSG)} target="_blank" rel="noopener noreferrer"
          style={{ background: '#25D366', color: '#fff', textDecoration: 'none', padding: '10px 22px', borderRadius: 99, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(37,211,102,0.35)' }}>
          💬 RESERVAR
        </a>
      </nav>

      {/* HERO */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="bb-hero">
          {/* LEFT */}
          <div style={{ position: 'relative' }}>
            {/* Stickers flotantes */}
            <div className="bb-sticker bb-float" style={{ top: -20, right: 40, fontSize: 40 }}>🚀</div>
            <div className="bb-sticker bb-float2" style={{ top: 60, right: -10, fontSize: 28 }}>⭐</div>
            <div className="bb-sticker bb-float" style={{ bottom: 40, right: 60, fontSize: 32 }}>🪐</div>

            <div className="bb-rainbow" />

            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 12 }}>
              Salón de eventos infantiles · Villa Nueva
            </p>

            <h1 style={{ lineHeight: 1.05, marginBottom: 24 }}>
              <span style={{ display: 'block', fontFamily: "'SuperHistories', sans-serif", fontSize: 'clamp(28px, 5vw, 52px)', color: '#fff', fontWeight: 900 }}>
                El cumpleaños más
              </span>
              <span className="bb-font bb-outlined" style={{ display: 'block', fontSize: 'clamp(52px, 10vw, 100px)', lineHeight: 0.9, letterSpacing: -2 }}>
                EXPLOSIVO
              </span>
              <span style={{ display: 'block', fontFamily: "'SuperHistories', sans-serif", fontSize: 'clamp(28px, 5vw, 52px)', color: '#fff', fontWeight: 900 }}>
                de tu hijo/a
              </span>
            </h1>

            <p style={{ fontSize: 17, color: '#94a3b8', lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
              Salón exclusivo, juegos increíbles y todo el servicio para que vos solo disfrutes.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href={waLink(DEFAULT_MSG)} target="_blank" rel="noopener noreferrer"
                style={{ background: '#25D366', color: '#fff', textDecoration: 'none', padding: '14px 28px', borderRadius: 99, fontWeight: 800, fontSize: 16, display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 24px rgba(37,211,102,0.4)' }}>
                💬 RESERVAR AHORA
              </a>
              <a href="#salon"
                style={{ background: 'transparent', color: '#fff', textDecoration: 'none', padding: '14px 28px', borderRadius: 99, fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 10, border: '2px solid rgba(255,255,255,0.2)' }}>
                CONOCÉ EL SALÓN ▶
              </a>
            </div>

            <p style={{ marginTop: 28, fontSize: 13, color: '#475569', display: 'flex', alignItems: 'center', gap: 8 }}>
              📍 Calle 25 de Mayo 2985, Barrio Unimev, Villa Nueva
            </p>
          </div>

          {/* RIGHT — hero photo */}
          <div className="bb-hero-img" style={{ position: 'relative' }}>
            <div style={{ borderRadius: 32, overflow: 'hidden', border: '2px solid rgba(245,158,11,0.3)', boxShadow: '0 0 80px rgba(245,158,11,0.15)', aspectRatio: '4/5', position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DRIVE('1rqMg9_jnepmftZwyt63geejGvnDN2oPF', 800)} alt="Arcade Big Bang" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,8,26,0.6) 0%, transparent 50%)' }} />
              {/* Badge */}
              <div style={{ position: 'absolute', top: 20, right: 20, background: '#f59e0b', color: '#000', padding: '8px 16px', borderRadius: 12, fontWeight: 900, fontSize: 13, letterSpacing: 1 }}>
                DIVERSIÓN<br />EN OTRO NIVEL
              </div>
            </div>
            {/* Stickers en la foto */}
            <div className="bb-sticker bb-float2" style={{ bottom: -20, left: -20, fontSize: 48, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}>🎈</div>
            <div className="bb-sticker bb-float" style={{ top: -16, left: 20, fontSize: 36, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))' }}>⭐</div>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ textAlign: 'center', paddingBottom: 32, animation: 'twinkle 1.5s infinite alternate' }}>
          <span style={{ fontSize: 24, color: '#475569' }}>↓</span>
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div className="bb-stats-bar">
          {[
            { icon: '⭐', label: 'SALÓN 100% EXCLUSIVO' },
            { icon: '🎮', label: 'JUEGOS INCREÍBLES' },
            { icon: '🎉', label: 'TODO INCLUIDO' },
            { icon: '👨‍👩‍👧', label: 'PARA TODAS LAS EDADES' },
            { icon: '❤️', label: 'EQUIPO QUE TE ACOMPAÑA' },
          ].map(s => (
            <div key={s.label} className="bb-stat-item">
              <span className="bb-stat-icon">{s.icon}</span>
              <span className="bb-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* UN MUNDO DE DIVERSIÓN — sección clara */}
      <section id="salon" className="bb-light-section">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 60, alignItems: 'center' }}>
          {/* LEFT */}
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🚀</div>
            <div className="bb-rainbow" style={{ background: 'linear-gradient(90deg, #ff3b7a, #f59e0b, #22c55e, #06b6d4, #8b5cf6)' }} />
            <h2 className="bb-font" style={{ fontSize: 'clamp(32px,4vw,52px)', color: '#0f172a', lineHeight: 1.1, marginBottom: 16, marginTop: 16 }}>
              Un mundo de<br />
              <span style={{ color: '#ef4444' }}>diversión</span>
            </h2>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.8, marginBottom: 28 }}>
              En Big Bang cada detalle está pensado para que los chicos vivan una experiencia única y vos disfrutes sin preocupaciones.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🏠', text: 'Salón exclusivo para 60 personas', color: '#8b5cf6' },
                { icon: '⏱️', text: '3 horas completas de evento', color: '#06b6d4' },
                { icon: '👩‍🍳', text: 'Coordinadora, cocinera, moza y auxiliar', color: '#f59e0b' },
                { icon: '❄️', text: 'Aire acondicionado y calefacción', color: '#10b981' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 14, padding: '12px 16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <span style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — 4 photos */}
          <div className="bb-photo-grid-4">
            {[
              { id: '1Rueuki_-g9EFv1I1jAF5PvC8anQXrEyt', label: '3 Inflables Gigantes', color: '#10b981' },
              { id: '1cAig93_4i5wOjtoOucopXkK7VmySx1QL', label: 'Laberinto', color: '#ef4444' },
              { id: '1-3o8b-Sh41cqE-TnqJ4hEOQJI1ar5B-F', label: 'Mini Cancha de Fútbol', color: '#22c55e' },
              { id: '1rqMg9_jnepmftZwyt63geejGvnDN2oPF', label: 'Juegos Arcade Originales', color: '#8b5cf6' },
            ].map((p) => (
              <div key={p.id} className="bb-photo-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={DRIVE(p.id)} alt={p.label} loading="lazy" />
                <div className="bb-photo-label" style={{ background: p.color }}>
                  {p.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Juegos grid */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
          {[
            { icon: '🎈', text: '3 Inflables enormes', color: '#fef3c7' },
            { icon: '🏃', text: '2 Laberintos gigantes', color: '#dbeafe' },
            { icon: '🏰', text: 'Plaza blanda', color: '#fce7f3' },
            { icon: '⚽', text: 'Cancha de fútbol', color: '#dcfce7' },
            { icon: '🕹️', text: 'Videojuegos arcade', color: '#ede9fe' },
            { icon: '📺', text: '2 TV + consolas', color: '#cffafe' },
            { icon: '🎱', text: 'Pool, ping pong, tejo', color: '#fef9c3' },
          ].map((j, i) => (
            <div key={i} style={{ background: j.color, borderRadius: 18, padding: '20px 16px', textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{j.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{j.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOUR 360° */}
      <section id="tour" className="bb-tour-section">
        {/* Glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🕹️</div>
          <h2 className="bb-font" style={{ fontSize: 'clamp(32px,5vw,56px)', color: '#fff', marginBottom: 8 }}>
            CONOCÉ EL SALÓN EN{' '}
            <span style={{ color: '#8b5cf6' }}>360°</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 40 }}>
            Recorrá cada espacio y viví la experiencia antes de tu evento
          </p>
          <div style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid rgba(139,92,246,0.3)', boxShadow: '0 0 60px rgba(139,92,246,0.2)', marginBottom: 28 }}>
            <iframe
              src="https://kuula.co/share/collection/7TQQ3?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1"
              style={{ width: '100%', height: 'clamp(280px, 50vw, 560px)', border: 'none', display: 'block' }}
              allowFullScreen allow="xr-spatial-tracking"
              title="Tour 360° Big Bang Pelotero"
            />
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section id="galeria" style={{ position: 'relative', zIndex: 1, padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
            <h2 className="bb-font" style={{ fontSize: 'clamp(28px,4vw,48px)', color: '#fff' }}>
              Así la pasamos <span style={{ color: '#f59e0b' }}>🎉</span>
            </h2>
            <a href={waLink(DEFAULT_MSG)} target="_blank" rel="noopener noreferrer"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', textDecoration: 'none', padding: '10px 22px', borderRadius: 99, fontWeight: 700, fontSize: 13, border: '1px solid rgba(245,158,11,0.3)' }}>
              ¡Reservá el tuyo! →
            </a>
          </div>
          <div className="bb-gallery-grid">
            {PHOTOS.map(p => (
              <div key={p.id} className="bb-gallery-item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={DRIVE(p.id)} alt={p.label} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMOS */}
      <section id="promos" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', background: 'linear-gradient(180deg, rgba(6,8,26,0) 0%, rgba(15,5,40,0.8) 50%, rgba(6,8,26,0) 100%)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.35)', color: '#f59e0b', fontSize: 11, fontWeight: 700, letterSpacing: 2, padding: '6px 18px', borderRadius: 99, textTransform: 'uppercase', marginBottom: 18 }}>
              🎉 Precios 2025
            </div>
            <h2 className="bb-font" style={{ fontSize: 'clamp(36px,6vw,64px)', color: '#fff', lineHeight: 1 }}>
              PROMOS{' '}
              <span style={{ color: '#f59e0b' }}>DESTACADAS.</span>
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16, marginTop: 12 }}>Ideales para cumples, fin de año y todo tipo de festejos</p>
            <div style={{ marginTop: 16, display: 'inline-block', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
              ✦ ¡CONSULTÁ DISPONIBILIDAD!
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 36, flexWrap: 'wrap' }}>
            {PROMOS.map(p => (
              <button key={p.key}
                onClick={() => setActivePromo(p.key as typeof activePromo)}
                className="promo-pill"
                style={{
                  borderColor: activePromo === p.key ? p.color : 'rgba(255,255,255,0.1)',
                  color: activePromo === p.key ? '#fff' : '#64748b',
                  background: activePromo === p.key ? `linear-gradient(135deg, ${p.color}44, ${p.color}18)` : 'transparent',
                  boxShadow: activePromo === p.key ? `0 0 24px ${p.color}55` : 'none',
                  transform: activePromo === p.key ? 'scale(1.07)' : 'scale(1)',
                }}>
                <span style={{ fontSize: 20 }}>{p.emoji}</span>
                <div>
                  <div>{p.name}</div>
                  {p.badge && <div style={{ fontSize: 9, opacity: 0.7, letterSpacing: 1 }}>★ {p.badge}</div>}
                </div>
              </button>
            ))}
          </div>

          {/* Promo card */}
          <div style={{
            background: `linear-gradient(160deg, ${promo.bg}, rgba(6,8,26,0.95))`,
            border: `1.5px solid ${promo.color}55`,
            borderRadius: 28, padding: '36px 32px',
            boxShadow: `0 0 80px ${promo.color}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}>
            {/* Card header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 52 }}>{promo.emoji}</div>
              <div style={{ flex: 1 }}>
                {promo.badge && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: promo.color, color: '#000', padding: '4px 14px', borderRadius: 99, fontSize: 10, fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>
                    ⭐ {promo.badge}
                  </div>
                )}
                <div className="bb-font" style={{ fontSize: 44, color: promo.color, lineHeight: 1, textShadow: `0 0 40px ${promo.color}66` }}>
                  {promo.name}
                </div>
                <div style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>📅 {promo.diasLabel}</div>
              </div>
            </div>

            {/* Precios */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
              {promo.precios.map((pr, i) => (
                <div key={i} style={{ flex: 1, minWidth: 140, background: `linear-gradient(135deg, ${promo.color}28, ${promo.color}0a)`, borderRadius: 20, padding: '20px 24px', border: `1px solid ${promo.color}44`, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{pr.label}</div>
                  <div className="bb-font" style={{ fontSize: 36, color: '#fff', textShadow: `0 0 20px ${promo.color}77` }}>
                    {$$(precios, pr.precioKey)}
                  </div>
                </div>
              ))}
            </div>

            {/* Info boxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>🕐 Turnos</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {promo.turnos.map(t => (
                    <span key={t} style={{ fontSize: 13, color: '#e2e8f0', background: 'rgba(255,255,255,0.07)', padding: '5px 14px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.08)' }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>💳 Seña y pago</div>
                <div style={{ fontSize: 14, color: '#cbd5e1' }}>{promo.sena}</div>
                {promo.cancelacion && <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>⚠️ {promo.cancelacion}</div>}
              </div>
              {promo.menu && (
                <div style={{ background: 'rgba(6,182,212,0.1)', borderRadius: 14, padding: '14px 18px', border: '1px solid rgba(6,182,212,0.25)' }}>
                  <div style={{ fontSize: 11, color: '#06b6d4', fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>🍕 MENÚ INCLUIDO</div>
                  <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7 }}>{promo.menu}</div>
                </div>
              )}
            </div>

            {/* Includes grid */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '16px 18px', marginBottom: 28, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>✅ Todo incluido</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 8 }}>
                {COMMON_INCLUDES.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '7px 10px' }}>
                    <span style={{ fontSize: 15 }}>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <a href={waLink(`¡Hola! Me interesa la promo ${promo.name} de Big Bang Pelotero, ¿me podés dar más info?`)}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', textDecoration: 'none', padding: '16px 32px', borderRadius: 99, fontWeight: 800, fontSize: 17, boxShadow: '0 4px 24px rgba(37,211,102,0.35)' }}>
              💬 Consultar promo {promo.name}
            </a>
          </div>

          {/* Comparativa */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 28 }}>
            {PROMOS.map(p => (
              <div key={p.key} onClick={() => setActivePromo(p.key as typeof activePromo)}
                style={{ background: activePromo === p.key ? `linear-gradient(135deg, ${p.color}22, ${p.color}08)` : 'rgba(255,255,255,0.03)', borderRadius: 18, padding: '18px 14px', textAlign: 'center', border: `1.5px solid ${activePromo === p.key ? p.color : 'rgba(255,255,255,0.06)'}`, cursor: 'pointer', transition: 'all 0.25s', boxShadow: activePromo === p.key ? `0 0 20px ${p.color}33` : 'none' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{p.emoji}</div>
                <div className="bb-font" style={{ color: p.color, fontSize: 14, marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 2 }}>{$$(precios, p.precios[0].precioKey)}</div>
                <div style={{ fontSize: 10, color: '#475569' }}>{p.diasLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADICIONALES */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 className="bb-font" style={{ fontSize: 'clamp(28px,4vw,44px)', color: '#fff', textAlign: 'center', marginBottom: 40 }}>
            Adicionales
          </h2>
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: '8px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {ADICIONALES.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: i < ADICIONALES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: 16 }}>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>{a.item}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>
                  {a.precioKey ? $$(precios, a.precioKey) + a.suffix : 'Consultar'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENÚ */}
      <section id="menu" style={{ position: 'relative', zIndex: 1, padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 className="bb-font" style={{ fontSize: 'clamp(28px,4vw,44px)', color: '#fff', textAlign: 'center', marginBottom: 8 }}>
            Lista de precios
          </h2>
          <p style={{ textAlign: 'center', color: '#475569', marginBottom: 40, fontSize: 13 }}>Precios sujetos a variación sin previo aviso</p>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: '8px 24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
            <div className="bb-font" style={{ fontSize: 18, color: '#f59e0b', marginBottom: 4, paddingTop: 16 }}>🍕 Salado</div>
            {MENU_SALADO.map((m, i) => (
              <div key={i} className="bb-menu-row">
                <span style={{ fontSize: 14, color: '#cbd5e1' }}>{m.item}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{$$(precios, m.precioKey)}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, padding: '8px 24px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16 }}>
            <div className="bb-font" style={{ fontSize: 18, color: '#06b6d4', marginBottom: 4, paddingTop: 16 }}>🥤 Bebidas</div>
            {MENU_BEBIDAS.map((m, i) => (
              <div key={i} className="bb-menu-row">
                <span style={{ fontSize: 14, color: '#cbd5e1' }}>{m.item}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{$$(precios, m.precioKey)}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 16, padding: '14px 20px', border: '1px solid rgba(245,158,11,0.2)', fontSize: 13, color: '#64748b' }}>
            🎂 Tortas, alfajores y mesa dulce — consultá precios por WhatsApp
          </div>
        </div>
      </section>

      {/* CONTACTO / FOOTER */}
      <footer id="contacto" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 24px 40px', textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}>
        <Image src="/logo-bigbang.png" alt="Big Bang" width={120} height={60} style={{ objectFit: 'contain', marginBottom: 24, opacity: 0.9 }} />

        <h3 className="bb-font" style={{ fontSize: 28, color: '#fff', marginBottom: 24 }}>¿Listo para reservar?</h3>

        <a href={waLink(DEFAULT_MSG)} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#25D366', color: '#fff', textDecoration: 'none', padding: '18px 40px', borderRadius: 99, fontWeight: 800, fontSize: 18, marginBottom: 40, boxShadow: '0 4px 28px rgba(37,211,102,0.4)' }}>
          💬 Escribinos por WhatsApp
        </a>

        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 6 }}>📍 Calle 25 de Mayo 2985, Barrio Unimev, Villa Nueva</p>
        <p style={{ color: '#64748b', fontSize: 15, marginBottom: 32 }}>📞 +54 261 386-1323</p>

        <div style={{ marginBottom: 32 }}>
          <div style={{ color: '#334155', fontSize: 12, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Turnos disponibles</div>
          {['13:00 a 16:00 hs', '16:30 a 19:30 hs', '20:00 a 23:00 hs'].map(t => (
            <span key={t} style={{ display: 'inline-block', margin: 4, padding: '8px 18px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 13, color: '#94a3b8' }}>{t}</span>
          ))}
        </div>

        <p style={{ color: '#1e293b', fontSize: 12 }}>© {new Date().getFullYear()} Big Bang Pelotero · Villa Nueva, Mendoza</p>
      </footer>
    </>
  );
}
