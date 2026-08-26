import Link from 'next/link';

const BRANDS = [
  {
    id: 'cubic',
    nombre: 'CUBIC',
    subtitulo: 'Café & Bar',
    descripcion: 'Carta digital, gestión de menú, contenido y redes.',
    href: '/admin',
    emoji: '☕',
    gradient: 'linear-gradient(135deg, #1a2e1a 0%, #0d1f0d 100%)',
    accentColor: '#4ADE80',
    borderColor: 'rgba(74,222,128,0.25)',
    hoverBorder: 'rgba(74,222,128,0.6)',
    tagBg: 'rgba(74,222,128,0.12)',
    tagText: '#4ADE80',
    sections: ['Carta digital', 'Orden & Redes', 'Excel precios'],
  },
  {
    id: 'bigbang',
    nombre: 'BIG BANG',
    subtitulo: 'Pelotero & Eventos',
    descripcion: 'Gestión del salón, eventos infantiles, app interactiva y contenido.',
    href: '/hub/bigbang',
    emoji: '🎈',
    gradient: 'linear-gradient(135deg, #1e1a2e 0%, #120d1f 100%)',
    accentColor: '#a855f7',
    borderColor: 'rgba(168,85,247,0.25)',
    hoverBorder: 'rgba(168,85,247,0.6)',
    tagBg: 'rgba(168,85,247,0.12)',
    tagText: '#a855f7',
    sections: ['Eventos', 'App web', 'Contenido', 'Redes'],
  },
  {
    id: 'glowup',
    nombre: 'GLOW UP',
    subtitulo: 'Deco & Eventos',
    descripcion: 'Presupuestos, portfolio de trabajos, contenido y redes para Tamara.',
    href: '/hub/glowup',
    emoji: '✨',
    gradient: 'linear-gradient(135deg, #2e1a20 0%, #1f0d12 100%)',
    accentColor: '#ec4899',
    borderColor: 'rgba(236,72,153,0.25)',
    hoverBorder: 'rgba(236,72,153,0.6)',
    tagBg: 'rgba(236,72,153,0.12)',
    tagText: '#ec4899',
    sections: ['Portfolio', 'Presupuestos', 'Contenido', 'Redes'],
  },
];

export default function HubLanding() {
  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #0a0812 0%, #0e0b18 60%, #0a0812 100%)' }}>

      {/* Fondo decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #4ADE80, transparent)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(100px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(ellipse, #ec4899, transparent)', filter: 'blur(120px)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #4ADE80, #a855f7)' }}>⚡</div>
          <span className="font-bebas text-xl tracking-widest text-white">PORTAL ADMIN</span>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button type="submit"
            className="font-dm text-xs uppercase tracking-widest transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseOver={e => (e.currentTarget.style.color = 'white')}
            onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
            Salir
          </button>
        </form>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl">

          {/* Título */}
          <div className="text-center mb-12">
            <p className="font-dm text-xs uppercase tracking-[0.3em] mb-3"
              style={{ color: 'rgba(255,255,255,0.3)' }}>Gestión integral de marcas</p>
            <h1 className="font-bebas text-5xl md:text-6xl text-white tracking-widest">
              SELECCIONÁ UNA MARCA
            </h1>
            <div className="mx-auto mt-4 h-px w-24"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BRANDS.map((brand) => (
              <Link key={brand.id} href={brand.href}
                className="group relative flex flex-col gap-5 p-7 rounded-3xl transition-all duration-300 cursor-pointer"
                style={{
                  background: brand.gradient,
                  border: `1px solid ${brand.borderColor}`,
                }}>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: `0 0 40px ${brand.accentColor}22, inset 0 0 40px ${brand.accentColor}08` }} />

                {/* Emoji + accent line */}
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{ background: `${brand.accentColor}18`, border: `1px solid ${brand.accentColor}30` }}>
                    {brand.emoji}
                  </div>
                  <div className="w-2 h-2 rounded-full mt-2"
                    style={{ background: brand.accentColor, boxShadow: `0 0 8px ${brand.accentColor}` }} />
                </div>

                {/* Nombre y subtítulo */}
                <div>
                  <h2 className="font-bebas text-4xl tracking-widest text-white transition-colors duration-300"
                    style={{ lineHeight: 1 }}>
                    {brand.nombre}
                  </h2>
                  <p className="font-dm text-xs mt-1 uppercase tracking-widest"
                    style={{ color: brand.accentColor }}>
                    {brand.subtitulo}
                  </p>
                </div>

                {/* Descripción */}
                <p className="font-dm text-sm leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {brand.descripcion}
                </p>

                {/* Tags de secciones */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {brand.sections.map((s) => (
                    <span key={s} className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: brand.tagBg, color: brand.tagText }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Flecha */}
                <div className="flex items-center gap-1.5 font-dm text-xs uppercase tracking-widest transition-all duration-300"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                  <span>Entrar</span>
                </div>

              </Link>
            ))}
          </div>

          {/* Footer info */}
          <p className="text-center font-dm text-[11px] mt-10"
            style={{ color: 'rgba(255,255,255,0.15)' }}>
            Portal Admin · Nati Flakes Studio
          </p>
        </div>
      </main>
    </div>
  );
}
