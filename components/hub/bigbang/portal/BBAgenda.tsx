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
  pendiente: '#fbbf24', confirmada: '#4ade80', señada: '#38bdf8', cancelada: '#f87171',
};

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

  function isoDate(d: number) { return `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

  function reservasForDay(d: number) {
    const iso = isoDate(d);
    return reservas.filter(r => String(r.fecha_evento).substring(0,10) === iso);
  }

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const selectedReservas = selected ? reservas.filter(r => String(r.fecha_evento).substring(0,10) === selected) : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800">📅 AGENDA</h2>
        {loading && <span className="font-dm text-xs text-gray-400">Cargando…</span>}
      </div>

      {/* Navegación mes */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="font-dm text-sm text-gray-500 hover:text-gray-800 px-3 py-1 rounded-lg transition-colors"
          style={{ background: '#f3f4f6' }}>← Ant</button>
        <h3 className="font-bebas text-2xl text-gray-800 tracking-widest">{MESES[month]} {year}</h3>
        <button onClick={nextMonth} className="font-dm text-sm text-gray-500 hover:text-gray-800 px-3 py-1 rounded-lg transition-colors"
          style={{ background: '#f3f4f6' }}>Sig →</button>
      </div>

      {/* Días de semana */}
      <div className="grid grid-cols-7 mb-2">
        {DIAS.map(d => (
          <div key={d} className="font-dm text-[10px] text-gray-400 uppercase tracking-widest text-center py-1">{d}</div>
        ))}
      </div>

      {/* Grilla */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i + 1;
          const iso = isoDate(d);
          const rs  = reservasForDay(d);
          const isToday = iso === today.toISOString().substring(0,10);
          const isSel   = iso === selected;

          return (
            <button key={d} onClick={() => setSelected(isSel ? null : iso)}
              className="relative flex flex-col items-center rounded-xl p-1.5 transition-all min-h-[52px]"
              style={{
                background: isSel ? 'rgba(249,115,22,0.15)' : rs.length > 0 ? '#f9fafb' : 'transparent',
                border: isToday ? '1px solid rgba(249,115,22,0.5)' : isSel ? '1px solid rgba(249,115,22,0.4)' : '1px solid transparent',
              }}>
              <span className="font-dm text-xs font-semibold"
                style={{ color: isToday ? '#f97316' : rs.length > 0 ? 'white' : 'rgba(255,255,255,0.35)' }}>
                {d}
              </span>
              {rs.length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-1 justify-center">
                  {rs.slice(0, 3).map(r => (
                    <div key={r.id} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: ESTADO_COLOR[r.estado] || '#9ca3af' }} />
                  ))}
                  {rs.length > 3 && <span className="font-dm text-[8px] text-gray-400">+{rs.length-3}</span>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Panel del día seleccionado */}
      {selected && (
        <div className="mt-6 rounded-2xl p-5"
          style={{ background: '#ffffff', border: '1px solid rgba(249,115,22,0.2)' }}>
          <h4 className="font-bebas text-lg text-gray-800 tracking-widest mb-3">
            {new Date(selected + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h4>
          {selectedReservas.length === 0 ? (
            <p className="font-dm text-sm text-gray-400">Sin reservas este día.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {selectedReservas.map(r => (
                <div key={r.id} className="flex items-start justify-between gap-3 pb-3"
                  style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: ESTADO_COLOR[r.estado] || '#9ca3af' }} />
                      <p className="font-dm font-semibold text-sm text-gray-800">{r.cliente}</p>
                      <span className="font-dm text-[10px] text-gray-400">{r.tipo_evento}</span>
                    </div>
                    {(r.hora_inicio || r.hora_fin) && (
                      <p className="font-dm text-xs text-gray-400 ml-4">
                        {r.hora_inicio}{r.hora_fin ? ' → ' + r.hora_fin : ''}
                      </p>
                    )}
                    {r.servicio_nombre && <p className="font-dm text-xs ml-4" style={{ color: '#fb923c' }}>📦 {r.servicio_nombre}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bebas text-xl" style={{ color: '#f97316' }}>${r.total.toLocaleString('es-AR')}</p>
                    <p className="font-dm text-[10px]" style={{ color: r.sena_pagada ? '#4ade80' : '#fbbf24' }}>
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
        <h3 className="font-bebas text-lg tracking-widest text-gray-500 mb-3">PRÓXIMAS FECHAS</h3>
        <div className="flex flex-col gap-2">
          {reservas
            .filter(r => String(r.fecha_evento).substring(0,10) >= today.toISOString().substring(0,10) && r.estado !== 'cancelada')
            .slice(0, 5)
            .map(r => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: '#ffffff', border: '1px solid #e5e7eb' }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ESTADO_COLOR[r.estado] }} />
                <div className="flex-1">
                  <p className="font-dm text-sm font-semibold text-gray-800">{r.cliente}</p>
                  <p className="font-dm text-xs text-gray-400">
                    {new Date(r.fecha_evento).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {r.hora_inicio ? ` · ${r.hora_inicio}` : ''}
                  </p>
                </div>
                <p className="font-bebas text-lg shrink-0" style={{ color: '#f97316' }}>${r.total.toLocaleString('es-AR')}</p>
              </div>
            ))}
          {reservas.filter(r => String(r.fecha_evento).substring(0,10) >= today.toISOString().substring(0,10) && r.estado !== 'cancelada').length === 0 && (
            <p className="font-dm text-sm text-gray-300">Sin reservas próximas.</p>
          )}
        </div>
      </div>
    </div>
  );
}

