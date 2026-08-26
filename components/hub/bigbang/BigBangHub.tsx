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
    bg: '#eff6ff',
    border: '#bfdbfe',
    accent: '#3b82f6',
    tagBg: '#dbeafe',
    tagText: '#1d4ed8',
  },
  {
    id: 'portal',
    titulo: 'PORTAL',
    subtitulo: 'Big Bang',
    descripcion: 'Herramientas internas — reservas, eventos, presupuestos, gestión del salón.',
    href: '/hub/bigbang/portal',
    emoji: '🚀',
    tags: ['Reservas', 'Eventos', 'Presupuestos', 'Clientes'],
    bg: '#fff7ed',
    border: '#fed7aa',
    accent: '#f97316',
    tagBg: '#ffedd5',
    tagText: '#c2410c',
  },
  {
    id: 'marketing',
    titulo: 'MARKETING',
    subtitulo: 'Contenido & Redes',
    descripcion: 'Calendario de contenido, pedidos de diseño, planificación de redes sociales.',
    href: '/hub/bigbang/marketing',
    emoji: '🎯',
    tags: ['Calendario', 'Diseño', 'Redes', 'Campañas'],
    bg: '#faf5ff',
    border: '#e9d5ff',
    accent: '#a855f7',
    tagBg: '#f3e8ff',
    tagText: '#7e22ce',
  },
];

export default function BigBangHub() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#ffffff' }}>

      {/* Arco iris top — más grueso */}
      <div className="h-2 w-full"
        style={{ background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899)' }} />

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className="flex items-center gap-3">
          <Link href="/hub"
            className="font-dm text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
            ← Hub
          </Link>
          <span className="text-gray-200">|</span>
          <span className="text-2xl">🚀</span>
          <div>
            <span className="font-bebas text-xl tracking-widest text-gray-800">BIG BANG</span>
            <span className="font-dm text-[10px] text-gray-400 ml-2 uppercase tracking-widest">Eventos</span>
          </div>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button type="submit"
            className="font-dm text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
            Salir
          </button>
        </form>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">

          {/* Título */}
          <div className="text-center mb-12">
            <p className="font-dm text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">
              Seleccioná una sección
            </p>
            <h1 className="font-bebas text-5xl md:text-6xl text-gray-800 tracking-widest">
              ¿QUÉ VAMOS A GESTIONAR?
            </h1>
            {/* Mini arcoíris decorativo */}
            <div className="mx-auto mt-4 h-1 w-24 rounded-full"
              style={{ background: 'linear-gradient(90deg, #f97316, #eab308, #22c55e, #3b82f6, #a855f7)' }} />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SECTIONS.map((sec) => (
              <Link key={sec.id} href={sec.href}
                className="group flex flex-col gap-5 p-7 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  background: sec.bg,
                  border: `2px solid ${sec.border}`,
                }}>

                {/* Ícono */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white shadow-sm">
                  {sec.emoji}
                </div>

                {/* Título */}
                <div>
                  <h2 className="font-bebas text-3xl tracking-widest text-gray-800" style={{ lineHeight: 1 }}>
                    {sec.titulo}
                  </h2>
                  <p className="font-dm text-xs mt-1 uppercase tracking-widest font-semibold" style={{ color: sec.accent }}>
                    {sec.subtitulo}
                  </p>
                </div>

                {/* Descripción */}
                <p className="font-dm text-sm leading-relaxed text-gray-500">
                  {sec.descripcion}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {sec.tags.map((t) => (
                    <span key={t} className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-medium"
                      style={{ background: sec.tagBg, color: sec.tagText }}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="font-dm text-xs uppercase tracking-widest flex items-center gap-1 font-semibold"
                  style={{ color: sec.accent }}>
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
