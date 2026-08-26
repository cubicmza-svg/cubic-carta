'use client';

import { useState, useEffect, useCallback } from 'react';

interface Reserva {
  id: number; cliente: string; fecha_evento: string;
  hora_inicio: string; hora_fin: string; tipo_evento: string;
  servicio_nombre: string; estado: string; total: number; sena_pagada: boolean;
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#fbbf24', confirmada: '#22c55e', señada: '#3b82f6', cancelada: '#f87171',
};

const FLOATERS = [
  { emoji: '🚀', top: '8%',  left: '5%',  size: 28, dur: 8,  delay: 0   },
  { emoji: '🪐', top: '15%', left: '88%', size: 36, dur: 12, delay: 2   },
  { emoji: '⭐', top: '35%', left: '3%',  size: 16, dur: 6,  delay: 1   },
  { emoji: '🌙', top: '60%', left: '92%', size: 22, dur: 10, delay: 3   },
  { emoji: '👨‍🚀', top: '75%', left: '7%',  size: 30, dur: 14, delay: 1.5 },
  { emoji: '✨', top: '20%', left: '50%', size: 14, dur: 5,  delay: 0.5 },
  { emoji: '🌟', top: '50%', left: '80%', size: 18, dur: 7,  delay: 2.5 },
  { emoji: '🛸', top: '85%', left: '60%', size: 26, dur: 11, delay: 0.8 },
  { emoji: '💫', top: '40%', left: '96%', size: 14, dur: 6,  delay: 3.5 },
];

export default function BBAgenda() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading]   = useState(true);
  const today = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/bigbang/reservas');
      if (r.ok) setReservas(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function isoDate(d: number) {
    return `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }

  function reservasForDay(d: number) {
    const iso = isoDate(d);
    return reservas.filter(r => String(r.fecha_evento).substring(0,10) === iso);
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const todayIso = today.toISOString().substring(0,10);
  const selectedReservas = selected ? reservas.filter(r => String(r.fecha_evento).substring(0,10) === selected) : [];

  return (
    <div className="relative min-h-screen" style={{ background: '#ffffff' }}>

      {/* CSS animations */}
      <style>{`
        @keyframes bb-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-12px) rotate(4deg); }
          66%       { transform: translateY(6px) rotate(-3deg); }
        }
        @keyframes bb-spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* Floaters espaciales */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {FLOATERS.map((f, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: f.top,
            left: f.left,
            fontSize: f.size,
            opacity: 0.10,
            animation: `bb-float ${f.dur}s ease-in-out ${f.delay}s infinite`,
          }}>
            {f.emoji}
          </div>
        ))}
        {/* Gradientes de color suaves */}
        <div style={{
          position: 'absolute', top: '0', right: '0',
          width: 400, height: 400, borderRadius: '50%', opacity: 0.04,
          background: 'radial-gradient(circle, #f97316, transparent)',
          filter: 'blur(80px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '0',
          width: 350, height: 350, borderRadius: '50%', opacity: 0.04,
          background: 'radial-gradient(circle, #3b82f6, transparent)',
          filter: 'blur(80px)',
        }} />
      </div>

      {/* Contenido */}
      <div className="relative max-w-3xl mx-auto px-6 py-8" style={{ zIndex: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bebas text-2xl tracking-widest text-gray-800">📅 AGENDA</h2>
          {loading && <span className="font-dm text-xs text-gray-400">Cargando…</span>}
        </div>

        {/* Navegación mes */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={prevMonth}
            className="font-dm text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-xl transition-colors"
            style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            ← Ant
          </button>
          <h3 className="font-bebas text-3xl text-gray-800 tracking-widest">{MESES[month].toUpperCase()} {year}</h3>
          <button onClick={nextMonth}
            className="font-dm text-sm text-gray-500 hover:text-gray-800 px-4 py-2 rounded-xl transition-colors"
            style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
            Sig →
          </button>
        </div>

        {/* Días de semana */}
        <div className="grid grid-cols-7 mb-2">
          {DIAS.map(d => (
            <div key={d} className="font-dm text-[10px] text-gray-400 uppercase tracking-widest text-center py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Grilla */}
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d   = i + 1;
            const iso = isoDate(d);
            const rs  = reservasForDay(d);
            const isToday = iso === todayIso;
            const isSel   = iso === selected;
            const hasEvents = rs.length > 0;

            return (
              <button key={d} onClick={() => setSelected(isSel ? null : iso)}
                className="relative flex flex-col items-center rounded-2xl transition-all duration-200 hover:scale-105"
                style={{
                  minHeight: 56,
                  padding: '6px 4px',
                  background: isSel
                    ? 'linear-gradient(135deg, #fff7ed, #ffedd5)'
                    : hasEvents
                    ? '#f9fafb'
                    : 'transparent',
                  border: isToday
                    ? '2px solid #f97316'
                    : isSel
                    ? '2px solid #fb923c'
                    : hasEvents
                    ? '1px solid #e5e7eb'
                    : '1px solid transparent',
                  boxShadow: isSel ? '0 2px 12px rgba(249,115,22,0.15)' : 'none',
                }}>
                <span className="font-dm text-sm font-semibold"
                  style={{ color: isToday ? '#f97316' : isSel ? '#ea580c' : '#374151' }}>
                  {d}
                </span>
                {hasEvents && (
                  <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                    {rs.slice(0, 3).map(r => (
                      <div key={r.id} className="w-2 h-2 rounded-full"
                        style={{ background: ESTADO_COLOR[r.estado] || '#9ca3af' }} />
                    ))}
                    {rs.length > 3 && (
                      <span className="font-dm text-[7px] text-gray-400 font-semibold">+{rs.length-3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 mt-4 px-1">
          {Object.entries(ESTADO_COLOR).map(([estado, color]) => (
            <div key={estado} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="font-dm text-[10px] text-gray-400 capitalize">{estado}</span>
            </div>
          ))}
        </div>

        {/* Panel del día seleccionado */}
        {selected && (
          <div className="mt-6 rounded-2xl p-5"
            style={{ background: '#fff7ed', border: '2px solid #fed7aa' }}>
            <h4 className="font-bebas text-xl text-gray-800 tracking-widest mb-4">
              {new Date(selected + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h4>
            {selectedReservas.length === 0 ? (
              <p className="font-dm text-sm text-gray-400">Sin reservas este día. 🎉</p>
            ) : (
              <div className="flex flex-col gap-3">
                {selectedReservas.map((r, idx) => (
                  <div key={r.id} className="flex items-start justify-between gap-3 pb-3"
                    style={{ borderBottom: idx < selectedReservas.length - 1 ? '1px solid #fed7aa' : 'none' }}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: ESTADO_COLOR[r.estado] || '#9ca3af' }} />
                        <p className="font-dm font-bold text-sm text-gray-800">{r.cliente}</p>
                        <span className="font-dm text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full">{r.tipo_evento}</span>
                      </div>
                      {(r.hora_inicio || r.hora_fin) && (
                        <p className="font-dm text-xs text-gray-500 ml-4">
                          🕐 {r.hora_inicio}{r.hora_fin ? ' → ' + r.hora_fin : ''}
                        </p>
                      )}
                      {r.servicio_nombre && (
                        <p className="font-dm text-xs ml-4 font-medium" style={{ color: '#f97316' }}>
                          📦 {r.servicio_nombre}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bebas text-2xl" style={{ color: '#f97316' }}>
                        ${r.total.toLocaleString('es-AR')}
                      </p>
                      <p className="font-dm text-[10px] font-semibold"
                        style={{ color: r.sena_pagada ? '#16a34a' : '#d97706' }}>
                        {r.sena_pagada ? '✓ Seña cobrada' : '⚠ Seña pendiente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Próximas reservas */}
        <div className="mt-8">
          <h3 className="font-bebas text-lg tracking-widest text-gray-500 mb-3 uppercase">
            🚀 Próximas fechas
          </h3>
          <div className="flex flex-col gap-2">
            {reservas
              .filter(r => String(r.fecha_evento).substring(0,10) >= todayIso && r.estado !== 'cancelada')
              .sort((a, b) => a.fecha_evento.localeCompare(b.fecha_evento))
              .slice(0, 6)
              .map(r => (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors hover:bg-gray-50"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: ESTADO_COLOR[r.estado] || '#9ca3af' }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-dm text-sm font-semibold text-gray-800 truncate">{r.cliente}</p>
                    <p className="font-dm text-xs text-gray-400">
                      {new Date(r.fecha_evento + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {r.hora_inicio ? ` · ${r.hora_inicio}` : ''}
                    </p>
                  </div>
                  <p className="font-bebas text-lg shrink-0" style={{ color: '#f97316' }}>
                    ${r.total.toLocaleString('es-AR')}
                  </p>
                </div>
              ))}
            {reservas.filter(r =>
              String(r.fecha_evento).substring(0,10) >= todayIso && r.estado !== 'cancelada'
            ).length === 0 && (
              <p className="font-dm text-sm text-gray-400 py-4 text-center">Sin reservas próximas. 🌟</p>
            )}
          </div>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
}
