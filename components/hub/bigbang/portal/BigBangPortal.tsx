'use client';

import { useState } from 'react';
import Link from 'next/link';
import BBServicios from './BBServicios';
import BBAgenda from './BBAgenda';
import BBReservas from './BBReservas';
import BBPresupuestos from './BBPresupuestos';

type Tab = 'agenda' | 'reservas' | 'presupuestos' | 'servicios';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'agenda',       label: 'Agenda',       emoji: '📅' },
  { id: 'reservas',     label: 'Reservas',     emoji: '🎉' },
  { id: 'presupuestos', label: 'Presupuestos', emoji: '📋' },
  { id: 'servicios',    label: 'Servicios',    emoji: '⭐' },
];

export default function BigBangPortal() {
  const [tab, setTab] = useState<Tab>('agenda');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#ffffff' }}>

      {/* Arco iris top */}
      <div className="h-2 w-full"
        style={{ background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899)' }} />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className="flex items-center gap-3">
          <Link href="/hub/bigbang"
            className="font-dm text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
            ← Big Bang
          </Link>
          <span className="text-gray-200">|</span>
          <span className="text-xl">🚀</span>
          <span className="font-bebas text-xl tracking-widest text-gray-800">PORTAL</span>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button type="submit"
            className="font-dm text-xs uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors">
            Salir
          </button>
        </form>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 px-6 pt-4 pb-0"
        style={{ borderBottom: '2px solid #f3f4f6' }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-5 py-3 font-dm text-sm font-semibold transition-all rounded-t-xl"
            style={tab === t.id ? {
              background: '#fff7ed',
              color: '#f97316',
              borderBottom: '2px solid #f97316',
              marginBottom: '-2px',
            } : {
              color: '#9ca3af',
              borderBottom: '2px solid transparent',
              marginBottom: '-2px',
            }}>
            <span>{t.emoji}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {tab === 'agenda'       && <BBAgenda />}
        {tab === 'reservas'     && <BBReservas />}
        {tab === 'presupuestos' && <BBPresupuestos />}
        {tab === 'servicios'    && <BBServicios />}
      </div>
    </div>
  );
}
