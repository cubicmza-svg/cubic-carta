'use client';
import Link from 'next/link';
import BellNotif from '@/components/BellNotif';
import GUCatalogo from '@/components/hub/glowup/catalogo/GUCatalogo';

export default function Page() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#fefcff' }}>

      {/* Manchas pastel */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {[
          { color: '#fbcfe8', x: '3%',  y: '15%', size: 200 },
          { color: '#ddd6fe', x: '80%', y: '5%',  size: 180 },
          { color: '#bfdbfe', x: '88%', y: '60%', size: 150 },
        ].map((d, i) => (
          <div key={i} style={{
            position: 'absolute', left: d.x, top: d.y,
            width: d.size, height: d.size, borderRadius: '50%',
            background: d.color, opacity: 0.28, filter: 'blur(70px)',
          }} />
        ))}
      </div>

      {/* Franja pastel */}
      <div className="h-2 w-full" style={{
        background: 'linear-gradient(90deg,#fbcfe8,#ddd6fe,#bfdbfe,#bbf7d0,#fef08a,#fbcfe8)',
        position: 'relative', zIndex: 2,
      }} />

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #f3e8ff', background: 'rgba(254,252,255,0.9)', zIndex: 2 }}>
        <div className="flex items-center gap-3">
          <Link href="/hub/glowup" className="font-dm text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
            ← Glow Up
          </Link>
          <span className="text-gray-200">|</span>
          <span className="text-xl">✨</span>
          <span className="font-bebas text-xl tracking-widest text-gray-800">CATÁLOGO</span>
        </div>
        <div className="flex items-center gap-3">
          <BellNotif portal="glowup" accentColor="#db2777" />
          <form action="/api/admin/logout" method="POST">
            <button type="submit" className="font-dm text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
              Salir
            </button>
          </form>
        </div>
      </header>

      <div className="relative flex-1 overflow-auto" style={{ zIndex: 1 }}>
        <GUCatalogo />
      </div>
    </div>
  );
}
