'use client';
import { useState } from 'react';
import Link from 'next/link';
import GUDiseno from './GUDiseno';
import GURedes from './GURedes';

type Tab = 'diseno' | 'redes';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'diseno', label: 'Diseño', emoji: '🎨' },
  { id: 'redes', label: 'Redes', emoji: '📲' },
];

const PASTEL_DOTS = [
  { color: '#fbcfe8', x: '3%',  y: '20%', size: 200 },
  { color: '#ddd6fe', x: '78%', y: '5%',  size: 180 },
  { color: '#bfdbfe', x: '85%', y: '65%', size: 160 },
];

export default function GUMarketing() {
  const [tab, setTab] = useState<Tab>('redes');
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: '#fefcff' }}>

      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {PASTEL_DOTS.map((d, i) => (
          <div key={i} style={{
            position: 'absolute', left: d.x, top: d.y,
            width: d.size, height: d.size, borderRadius: '50%',
            background: d.color, opacity: 0.3, filter: 'blur(70px)',
          }} />
        ))}
      </div>

      <div className="h-2 w-full" style={{
        background: 'linear-gradient(90deg,#fbcfe8,#ddd6fe,#bfdbfe,#bbf7d0,#fef08a,#fbcfe8)',
        position: 'relative', zIndex: 2,
      }} />

      <header className="relative flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #f3e8ff', background: 'rgba(254,252,255,0.9)', zIndex: 2 }}>
        <div className="flex items-center gap-3">
          <Link href="/hub/glowup" className="font-dm text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
            ← Glow Up
          </Link>
          <span className="text-gray-200">|</span>
          <span className="text-xl">✨</span>
          <span className="font-bebas text-xl tracking-widest text-gray-800">MARKETING</span>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button type="submit" className="font-dm text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
            Salir
          </button>
        </form>
      </header>

      <div className="relative flex gap-1 px-6 pt-4"
        style={{ borderBottom: '2px solid #f3e8ff', background: 'rgba(254,252,255,0.9)', zIndex: 2 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-5 py-3 font-dm text-sm font-semibold transition-all rounded-t-xl"
            style={tab === t.id ? {
              background: '#f5f3ff', color: '#7c3aed',
              borderBottom: '2px solid #7c3aed', marginBottom: '-2px',
            } : {
              color: '#9ca3af', borderBottom: '2px solid transparent', marginBottom: '-2px',
            }}>
            <span>{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="relative flex-1 overflow-auto" style={{ zIndex: 1 }}>
        {tab === 'diseno' && <GUDiseno />}
        {tab === 'redes'  && <GURedes />}
      </div>
    </div>
  );
}
