'use client';
import { useState, useEffect, useCallback } from 'react';

interface Pedido {
  id: number; cliente: string; fecha_evento: string;
  hora: string; lugar: string; nombre_cumple: string;
  servicio_nombre: string; estado: string;
}

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const GU = '#db2777';

export default function GUAgenda() {
  const hoy = new Date();
  const [year, setYear] = useState(hoy.getFullYear());
  const [month, setMonth] = useState(hoy.getMonth());
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [sel, setSel] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/glowup/pedidos');
      if (r.ok) setPedidos(await r.json());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function eventosDelDia(day: number) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return pedidos.filter(p => p.fecha_evento?.startsWith(iso) && p.estado !== 'cancelado');
  }

  const selDate = sel ? `${year}-${String(month + 1).padStart(2, '0')}-${String(sel).padStart(2, '0')}` : null;
  const eventosSel = selDate ? pedidos.filter(p => p.fecha_evento?.startsWith(selDate) && p.estado !== 'cancelado') : [];

  const ESTADO_COLOR: Record<string, string> = {
    pendiente: '#fef3c7',
    confirmado: '#dcfce7',
    cancelado: '#fee2e2',
    entregado: '#dbeafe',
  };
  const ESTADO_TEXT: Record<string, string> = {
    pendiente: '#92400e',
    confirmado: '#166534',
    cancelado: '#991b1b',
    entregado: '#1e40af',
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="font-bebas text-2xl tracking-widest text-gray-800 mb-6">📅 AGENDA</h2>

      {/* Navegación mes */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="font-dm text-sm text-gray-400 hover:text-gray-700 px-3 py-1">← Ant</button>
        <h3 className="font-bebas text-2xl tracking-widest" style={{ color: GU }}>
          {MESES[month].toUpperCase()} {year}
        </h3>
        <button onClick={nextMonth} className="font-dm text-sm text-gray-400 hover:text-gray-700 px-3 py-1">Sig →</button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-1">
        {DIAS_SEMANA.map(d => (
          <div key={d} className="text-center font-dm text-[10px] uppercase tracking-wider text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = year === hoy.getFullYear() && month === hoy.getMonth() && day === hoy.getDate();
          const isSel = sel === day;
          const eventos = eventosDelDia(day);
          return (
            <button key={day} onClick={() => setSel(isSel ? null : day)}
              className="flex flex-col items-center py-1.5 rounded-xl transition-all"
              style={{
                background: isSel ? '#fdf2f8' : isToday ? '#fce7f3' : 'transparent',
                border: isSel ? `2px solid ${GU}` : isToday ? '2px solid #fbcfe8' : '2px solid transparent',
              }}>
              <span className="font-dm text-sm font-semibold"
                style={{ color: isToday ? GU : isSel ? '#be185d' : '#374151' }}>
                {day}
              </span>
              {eventos.length > 0 && (
                <span className="font-dm text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: GU }}>
                  {eventos.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Detalle día seleccionado */}
      {sel && (
        <div className="rounded-2xl p-5" style={{ background: '#fdf2f8', border: '1.5px solid #fbcfe8' }}>
          <h4 className="font-bebas text-lg tracking-widest mb-3" style={{ color: GU }}>
            {sel} DE {MESES[month].toUpperCase()} — {eventosSel.length} evento{eventosSel.length !== 1 ? 's' : ''}
          </h4>
          {eventosSel.length === 0 && (
            <p className="font-dm text-sm text-gray-400">Sin eventos para este día 🌸</p>
          )}
          <div className="flex flex-col gap-3">
            {eventosSel.map(p => (
              <div key={p.id} className="rounded-xl p-4 bg-white" style={{ border: '1px solid #f3e8ff' }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-dm text-sm font-semibold text-gray-800">{p.cliente}</p>
                    {p.nombre_cumple && (
                      <p className="font-dm text-xs text-gray-400">🎂 {p.nombre_cumple}</p>
                    )}
                  </div>
                  <span className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: ESTADO_COLOR[p.estado] || '#f3f4f6', color: ESTADO_TEXT[p.estado] || '#6b7280' }}>
                    {p.estado}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {p.hora && <span className="font-dm text-xs text-gray-500">🕐 {p.hora}</span>}
                  {p.lugar && <span className="font-dm text-xs text-gray-500">📍 {p.lugar}</span>}
                  {p.servicio_nombre && <span className="font-dm text-xs text-gray-500">✨ {p.servicio_nombre}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Próximos eventos */}
      {!sel && (
        <div>
          <h4 className="font-bebas text-lg tracking-widest mb-3 text-gray-700">PRÓXIMOS EVENTOS</h4>
          <div className="flex flex-col gap-3">
            {pedidos
              .filter(p => p.estado !== 'cancelado' && p.fecha_evento && new Date(p.fecha_evento) >= hoy)
              .sort((a, b) => a.fecha_evento.localeCompare(b.fecha_evento))
              .slice(0, 5)
              .map(p => (
                <div key={p.id} className="rounded-xl p-4"
                  style={{ background: '#fdf2f8', border: '1px solid #fbcfe8' }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-dm text-sm font-semibold text-gray-800">{p.cliente}</p>
                      {p.nombre_cumple && <p className="font-dm text-xs text-gray-400">🎂 {p.nombre_cumple}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-bebas text-base" style={{ color: GU }}>
                        {new Date(p.fecha_evento + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      </p>
                      {p.hora && <p className="font-dm text-xs text-gray-400">{p.hora}</p>}
                    </div>
                  </div>
                </div>
              ))}
            {pedidos.filter(p => p.estado !== 'cancelado' && p.fecha_evento && new Date(p.fecha_evento) >= hoy).length === 0 && (
              <p className="font-dm text-sm text-gray-400 py-4 text-center">Sin eventos próximos 🌸</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
