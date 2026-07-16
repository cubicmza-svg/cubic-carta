'use client';

import { useState } from 'react';
import Link from 'next/link';
import StudioCalendario from './studio/StudioCalendario';
import StudioDiseno from './studio/StudioDiseno';
import StudioRedes from './studio/StudioRedes';

type Tab = 'calendario' | 'diseno' | 'redes';

export default function StudioPanel() {
  const [tab, setTab] = useState<Tab>('calendario');

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'calendario', label: 'Calendario', icon: '📅' },
    { id: 'diseno',     label: 'Diseño',     icon: '📐' },
    { id: 'redes',      label: 'Redes',      icon: '📱' },
  ];

  return (
    <div className="min-h-screen bg-cubic-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-cubic-border px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="font-dm text-xs text-cubic-muted hover:text-white transition-colors tracking-widest uppercase"
          >
            ← Admin
          </Link>
          <span className="text-cubic-border">|</span>
          <span className="font-bebas text-xl tracking-widest text-white">
            ORDEN <span className="text-cubic-accent">&</span> REDES
          </span>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="font-dm text-xs text-cubic-muted hover:text-white transition-colors tracking-widest uppercase"
          >
            Salir
          </button>
        </form>
      </header>

      {/* Tabs */}
      <div className="border-b border-cubic-border px-6 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`font-dm text-sm py-3 px-4 border-b-2 transition-all duration-150 flex items-center gap-2 ${
              tab === t.id
                ? 'border-cubic-accent text-white font-semibold'
                : 'border-transparent text-cubic-muted hover:text-white'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === 'calendario' && <StudioCalendario />}
        {tab === 'diseno'     && <StudioDiseno />}
        {tab === 'redes'      && <StudioRedes />}
      </div>
    </div>
  );
}
