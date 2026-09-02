'use client';
import Link from 'next/link';

const SECTIONS = [
  {
    id: 'portal',
    titulo: 'PORTAL',
    subtitulo: 'Pedidos & Agenda',
    descripcion: 'Gestioná pedidos, presupuestos y fechas. Todo el flujo desde el primer contacto hasta el cobro.',
    href: '/hub/glowup/portal',
    emoji: '📋',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    accent: '#db2777',
    tagBg: '#fce7f3',
    tagText: '#be185d',
    tags: ['Pedidos', 'Presupuestos', 'Agenda', 'Servicios'],
  },
  {
    id: 'marketing',
    titulo: 'MARKETING',
    subtitulo: 'Diseño & Redes',
    descripcion: 'Organizá el contenido para Instagram, pedidos de diseño y planificación de publicaciones.',
    href: '/hub/glowup/marketing',
    emoji: '✨',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    accent: '#7c3aed',
    tagBg: '#ede9fe',
    tagText: '#5b21b6',
    tags: ['Diseño', 'Redes', 'Contenido'],
  },
];

const PASTEL_DOTS = [
  { color: '#fbcfe8', x: '8%',  y: '20%', size: 180 },
  { color: '#ddd6fe', x: '75%', y: '10%', size: 220 },
  { color: '#bfdbfe', x: '85%', y: '65%', size: 160 },
  { color: '#bbf7d0', x: '5%',  y: '70%', size: 140 },
  { color: '#fef08a', x: '50%', y: '85%', size: 100 },
];

export default function GlowUpHub() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#fefcff' }}>

      {/* Manchas pastel de fondo */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {PASTEL_DOTS.map((d, i) => (
          <div key={i} style={{
            position: 'absolute', left: d.x, top: d.y,
            width: d.size, height: d.size, borderRadius: '50%',
            background: d.color, opacity: 0.35, filter: 'blur(60px)',
          }} />
        ))}
      </div>

      {/* Franja pastel top */}
      <div className="h-2 w-full" style={{
        background: 'linear-gradient(90deg,#fbcfe8,#ddd6fe,#bfdbfe,#bbf7d0,#fef08a,#fbcfe8)',
        zIndex: 1,
      }} />

      {/* Header */}
      <header className="relative flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid #f3e8ff', zIndex: 1 }}>
        <div className="flex items-center gap-3">
          <Link href="/hub" className="font-dm text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
            ← Hub
          </Link>
          <span className="text-gray-200">|</span>
          <span className="text-2xl">🎀</span>
          <div>
            <span className="font-bebas text-xl tracking-widest text-gray-800">GLOW UP DECO</span>
            <span className="font-dm text-[10px] text-gray-400 ml-2 uppercase tracking-widest">Decoraciones · Tamara Sosa</span>
          </div>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="font-dm text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
            Salir
          </button>
        </form>
      </header>

      {/* Main */}
      <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12" style={{ zIndex: 1 }}>
        <div className="w-full max-w-3xl">

          <div className="text-center mb-12">
            <p className="font-dm text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">Seleccioná una sección</p>
            <h1 className="font-bebas text-5xl md:text-6xl text-gray-800 tracking-widest">¿QUÉ VAMOS A GESTIONAR?</h1>
            <div className="mx-auto mt-4 h-1 w-24 rounded-full"
              style={{ background: 'linear-gradient(90deg,#f472b6,#a78bfa,#60a5fa)' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SECTIONS.map(sec => (
              <Link key={sec.id} href={sec.href}
                className="group flex flex-col gap-5 p-7 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ background: sec.bg, border: `2px solid ${sec.border}` }}>

                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white shadow-sm">
                  {sec.emoji}
                </div>
                <div>
                  <h2 className="font-bebas text-3xl tracking-widest text-gray-800" style={{ lineHeight: 1 }}>{sec.titulo}</h2>
                  <p className="font-dm text-xs mt-1 uppercase tracking-widest font-semibold" style={{ color: sec.accent }}>{sec.subtitulo}</p>
                </div>
                <p className="font-dm text-sm leading-relaxed text-gray-500">{sec.descripcion}</p>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {sec.tags.map(t => (
                    <span key={t} className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium"
                      style={{ background: sec.tagBg, color: sec.tagText }}>{t}</span>
                  ))}
                </div>
                <div className="font-dm text-xs uppercase tracking-widest font-semibold flex items-center gap-1"
                  style={{ color: sec.accent }}>
                  <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                  <span>Entrar</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Info rápida */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Instagram', val: '@glowup.deco' },
              { label: 'Zona', val: 'Gran Mendoza' },
              { label: 'Seña', val: '50% del total' },
              { label: 'Anticipación', val: 'Mín. 1 semana' },
            ].map(item => (
              <div key={item.label} className="text-center py-3 px-4 rounded-2xl"
                style={{ background: '#fdf2f8', border: '1px solid #fbcfe8' }}>
                <div className="font-dm text-[10px] uppercase tracking-wider text-gray-400 mb-1">{item.label}</div>
                <div className="font-dm text-sm font-semibold text-gray-700">{item.val}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
