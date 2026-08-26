'use client';

import Link from 'next/link';

const SECTIONS = [
  {
    id: 'web',
    titulo: 'PÁGINA WEB',
    subtitulo: 'Sitio público',
    descripcion: 'Gestión del contenido del sitio web de Big Bang — textos, fotos, precios, secciones.',
    href: '/hub/bigbang/web',
    emoji: '🌐',
    tags: ['Inicio', 'Servicios', 'Galería', 'Contacto'],
    color: '#38bdf8',     // celeste
    tagBg: 'rgba(56,189,248,0.12)',
    tagText: '#7dd3fc',
    border: 'rgba(56,189,248,0.2)',
    glow: 'rgba(56,189,248,0.15)',
  },
  {
    id: 'portal',
    titulo: 'PORTAL',
    subtitulo: 'Big Bang',
    descripcion: 'Herramientas internas — reservas, eventos, presupuestos, gestión del salón.',
    href: '/hub/bigbang/portal',
    emoji: '🚀',
    tags: ['Reservas', 'Eventos', 'Presupuestos', 'Clientes'],
    color: '#f97316',     // naranja
    tagBg: 'rgba(249,115,22,0.12)',
    tagText: '#fb923c',
    border: 'rgba(249,115,22,0.2)',
    glow: 'rgba(249,115,22,0.15)',
  },
  {
    id: 'marketing',
    titulo: 'MARKETING',
    subtitulo: 'Contenido & Redes',
    descripcion: 'Calendario de contenido, pedidos de diseño, planificación de redes sociales.',
    href: '/hub/bigbang/marketing',
    emoji: '🎯',
    tags: ['Calendario', 'Diseño', 'Redes', 'Campañas'],
    color: '#a855f7',     // violeta
    tagBg: 'rgba(168,85,247,0.12)',
    tagText: '#c084fc',
    border: 'rgba(168,85,247,0.2)',
    glow: 'rgba(168,85,247,0.15)',
  },
];

export default function BigBangHub() {
  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #020818 0%, #050d24 60%, #030a1a 100%)' }}>

      {/* Estrellas decorativas */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.7 ? '2px' : '1px',
              height: Math.random() > 0.7 ? '2px' : '1px',
              top: `${(i * 37 + 11) % 100}%`,
              left: `${(i * 53 + 7) % 100}%`,
              opacity: 0.2 + (i % 5) * 0.1,
            }} />
        ))}
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #f97316, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #38bdf8, transparent)', filter: 'blur(80px)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <Link href="/hub"
            className="font-dm text-xs uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors">
            ← Hub
          </Link>
          <span className="text-white/10">|</span>
          <span className="text-2xl">🚀</span>
          <div>
            <span className="font-bebas text-xl tracking-widest text-white">BIG BANG</span>
            <span className="font-dm text-[10px] text-white/30 ml-2 uppercase tracking-widest">Eventos en el Espacio</span>
          </div>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button type="submit"
            className="font-dm text-xs uppercase tracking-widest text-white/30 hover:text-white transition-colors">
            Salir
          </button>
        </form>
      </header>

      {/* Arco iris decorativo */}
      <div className="relative z-10 h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899)' }} />

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">

          {/* Título */}
          <div className="text-center mb-12">
            <p className="font-dm text-xs uppercase tracking-[0.3em] mb-3"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              Seleccioná una sección
            </p>
            <h1 className="font-bebas text-5xl md:text-6xl text-white tracking-widest">
              ¿QUÉ VAMOS A GESTIONAR?
            </h1>
            <div className="mx-auto mt-4 h-px w-24"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.5), transparent)' }} />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SECTIONS.map((sec) => (
              <Link key={sec.id} href={sec.href}
                className="group relative flex flex-col gap-5 p-7 rounded-3xl transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${sec.border}`,
                }}>

                {/* Glow hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `0 0 40px ${sec.glow}, inset 0 0 30px ${sec.glow}` }} />

                {/* Ícono */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: `${sec.color}18`, border: `1px solid ${sec.color}30` }}>
                  {sec.emoji}
                </div>

                {/* Título */}
                <div>
                  <h2 className="font-bebas text-3xl tracking-widest text-white" style={{ lineHeight: 1 }}>
                    {sec.titulo}
                  </h2>
                  <p className="font-dm text-xs mt-1 uppercase tracking-widest" style={{ color: sec.color }}>
                    {sec.subtitulo}
                  </p>
                </div>

                {/* Descripción */}
                <p className="font-dm text-sm leading-relaxed text-white/50">
                  {sec.descripcion}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {sec.tags.map((t) => (
                    <span key={t} className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: sec.tagBg, color: sec.tagText }}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="font-dm text-xs uppercase tracking-widest text-white/20 flex items-center gap-1">
                  <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                  <span>Entrar</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
