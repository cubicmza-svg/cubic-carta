'use client';

import { useState, useEffect, useCallback } from 'react';

interface Servicio { id: number; nombre: string; precio: number; activo: boolean; }
interface Reserva {
  id: number; cliente: string; telefono: string;
  fecha_evento: string; hora_inicio: string; hora_fin: string;
  tipo_evento: string; servicio_nombre: string;
  cant_chicos: number; cant_adultos: number;
  total: number; sena: number; sena_pagada: boolean;
  estado: string; notas: string; creado_el: string;
}

const ESTADOS = ['pendiente','confirmada','señada','cancelada'];
const ESTADO_STYLE: Record<string, string> = {
  pendiente:  'rgba(234,179,8,0.12)|#fbbf24',
  confirmada: 'rgba(34,197,94,0.12)|#4ade80',
  señada:     'rgba(56,189,248,0.12)|#38bdf8',
  cancelada:  'rgba(239,68,68,0.12)|#f87171',
};

function estadoStyle(e: string) {
  const [bg, color] = (ESTADO_STYLE[e] || 'rgba(255,255,255,0.06)|rgba(255,255,255,0.4)').split('|');
  return { background: bg, color };
}

export default function BBReservas() {
  const [reservas, setReservas]   = useState<Reserva[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);
  const [filtro, setFiltro]       = useState('todos');

  const [form, setForm] = useState({
    cliente: '', telefono: '', fecha_evento: '', hora_inicio: '', hora_fin: '',
    tipo_evento: 'cumpleaños', servicio_id: '', servicio_nombre: '',
    cant_chicos: '', cant_adultos: '', total: '', sena: '',
    sena_pagada: false, estado: 'pendiente', notas: '',
  });

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([fetch('/api/bigbang/reservas'), fetch('/api/bigbang/servicios')]);
      if (r1.ok) setReservas(await r1.json());
      if (r2.ok) setServicios(await r2.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const reset = () => {
    setForm({ cliente: '', telefono: '', fecha_evento: '', hora_inicio: '', hora_fin: '', tipo_evento: 'cumpleaños', servicio_id: '', servicio_nombre: '', cant_chicos: '', cant_adultos: '', total: '', sena: '', sena_pagada: false, estado: 'pendiente', notas: '' });
    setEditId(null); setShowForm(false);
  };

  const openEdit = (r: Reserva) => {
    setForm({ cliente: r.cliente, telefono: r.telefono, fecha_evento: String(r.fecha_evento).substring(0,10), hora_inicio: r.hora_inicio, hora_fin: r.hora_fin, tipo_evento: r.tipo_evento, servicio_id: '', servicio_nombre: r.servicio_nombre, cant_chicos: String(r.cant_chicos), cant_adultos: String(r.cant_adultos), total: String(r.total), sena: String(r.sena), sena_pagada: r.sena_pagada, estado: r.estado, notas: r.notas });
    setEditId(r.id); setShowForm(true);
  };

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.cliente.trim() || !form.fecha_evento || saving) return;
    setSaving(true);
    try {
      const body = { ...form, cant_chicos: parseInt(form.cant_chicos)||0, cant_adultos: parseInt(form.cant_adultos)||0, total: parseInt(form.total)||0, sena: parseInt(form.sena)||0, servicio_id: form.servicio_id ? parseInt(form.servicio_id) : null };
      if (editId) await fetch(`/api/bigbang/reservas/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      else await fetch('/api/bigbang/reservas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      await fetch_(); reset();
    } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    await fetch(`/api/bigbang/reservas/${id}`, { method: 'DELETE' });
    await fetch_(); reset();
  };

  const toggleSena = async (r: Reserva) => {
    await fetch(`/api/bigbang/reservas/${r.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sena_pagada: !r.sena_pagada }) });
    setReservas(prev => prev.map(x => x.id === r.id ? { ...x, sena_pagada: !r.sena_pagada } : x));
  };

  const filtradas = filtro === 'todos' ? reservas : reservas.filter(r => r.estado === filtro);
  const pendienteSena = reservas.filter(r => !r.sena_pagada && r.estado !== 'cancelada').length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-bebas text-2xl tracking-widest text-white">🎉 RESERVAS</h2>
          {pendienteSena > 0 && (
            <span className="font-dm text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(234,179,8,0.15)', color: '#fbbf24' }}>
              {pendienteSena} sin seña
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select value={filtro} onChange={e => setFiltro(e.target.value)}
            className="font-dm text-xs px-3 py-2 rounded-lg outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
            <option value="todos">Todos</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <button onClick={() => { reset(); setShowForm(true); }}
            className="font-dm text-sm font-semibold px-4 py-2 rounded-lg text-black"
            style={{ background: '#f97316' }}>
            + Nueva reserva
          </button>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(2,8,24,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={reset}>
          <div className="w-full max-w-xl rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[90vh]"
            style={{ background: '#0d1a30', border: '1px solid rgba(249,115,22,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest text-white">
              {editId ? 'Editar reserva' : 'Nueva reserva'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Cliente', key: 'cliente', placeholder: 'Nombre completo', span: 2 },
                { label: 'Teléfono', key: 'telefono', placeholder: '261 000 0000' },
                { label: 'Tipo de evento', key: 'tipo_evento', placeholder: 'cumpleaños' },
              ].map(f => (
                <div key={f.key} className={`flex flex-col gap-1 ${f.span === 2 ? 'col-span-2' : ''}`}>
                  <label className="font-dm text-[10px] text-white/40 uppercase tracking-widest">{f.label}</label>
                  <input value={(form as Record<string,unknown>)[f.key] as string} onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder} autoFocus={f.key === 'cliente'}
                    className="px-3 py-2 rounded-lg font-dm text-sm text-white placeholder-white/20 outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              ))}

              <div className="flex flex-col gap-1">
                <label className="font-dm text-[10px] text-white/40 uppercase tracking-widest">Fecha</label>
                <input type="date" value={form.fecha_evento} onChange={e => set('fecha_evento', e.target.value)}
                  className="px-3 py-2 rounded-lg font-dm text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-dm text-[10px] text-white/40 uppercase tracking-widest">Horario</label>
                <div className="flex gap-1">
                  <input type="time" value={form.hora_inicio} onChange={e => set('hora_inicio', e.target.value)}
                    className="flex-1 px-2 py-2 rounded-lg font-dm text-xs text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
                  <span className="text-white/30 self-center">→</span>
                  <input type="time" value={form.hora_fin} onChange={e => set('hora_fin', e.target.value)}
                    className="flex-1 px-2 py-2 rounded-lg font-dm text-xs text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
                </div>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-dm text-[10px] text-white/40 uppercase tracking-widest">Paquete / Servicio</label>
                <select value={form.servicio_id} onChange={e => {
                  const s = servicios.find(x => x.id === parseInt(e.target.value));
                  set('servicio_id', e.target.value);
                  if (s) { set('servicio_nombre', s.nombre); set('total', String(s.precio)); }
                }}
                  className="px-3 py-2 rounded-lg font-dm text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="">Sin paquete fijo</option>
                  {servicios.filter(s => s.activo !== false).map(s => (
                    <option key={s.id} value={s.id}>{s.nombre} — ${s.precio.toLocaleString('es-AR')}</option>
                  ))}
                </select>
              </div>

              {[
                { label: 'Chicos', key: 'cant_chicos', type: 'number' },
                { label: 'Adultos', key: 'cant_adultos', type: 'number' },
                { label: 'Total ($)', key: 'total', type: 'number' },
                { label: 'Seña ($)', key: 'sena', type: 'number' },
              ].map(f => (
                <div key={f.key} className="flex flex-col gap-1">
                  <label className="font-dm text-[10px] text-white/40 uppercase tracking-widest">{f.label}</label>
                  <input type={f.type} value={(form as Record<string,unknown>)[f.key] as string} onChange={e => set(f.key, e.target.value)}
                    className="px-3 py-2 rounded-lg font-dm text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              ))}

              <div className="flex flex-col gap-1">
                <label className="font-dm text-[10px] text-white/40 uppercase tracking-widest">Estado</label>
                <select value={form.estado} onChange={e => set('estado', e.target.value)}
                  className="px-3 py-2 rounded-lg font-dm text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 self-end pb-2">
                <input type="checkbox" id="sena_pagada" checked={form.sena_pagada} onChange={e => set('sena_pagada', e.target.checked)}
                  className="w-4 h-4 accent-orange-400" />
                <label htmlFor="sena_pagada" className="font-dm text-sm text-white/60 cursor-pointer">Seña cobrada</label>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-dm text-[10px] text-white/40 uppercase tracking-widest">Notas</label>
                <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={2}
                  placeholder="Observaciones, pedidos especiales…"
                  className="px-3 py-2 rounded-lg font-dm text-sm text-white placeholder-white/20 outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-2">
              {editId && (
                <button onClick={() => del(editId)}
                  className="font-dm text-sm px-4 py-2 rounded-lg mr-auto"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                  Eliminar
                </button>
              )}
              <button onClick={reset} className="font-dm text-sm px-4 py-2 rounded-lg text-white/40 hover:text-white transition-colors">Cancelar</button>
              <button onClick={save} disabled={saving}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-lg text-black disabled:opacity-50"
                style={{ background: '#f97316' }}>
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {!loading && filtradas.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-bebas text-2xl text-white/20 tracking-widest">Sin reservas</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map(r => (
            <div key={r.id} className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-dm font-semibold text-white">{r.cliente}</h3>
                    <span className="font-dm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={estadoStyle(r.estado)}>
                      {r.estado}
                    </span>
                  </div>
                  <p className="font-dm text-xs text-white/40">{r.telefono} · {r.tipo_evento}</p>
                  <p className="font-dm text-xs text-white/50">
                    📅 {new Date(r.fecha_evento).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {r.hora_inicio && ` · ${r.hora_inicio}${r.hora_fin ? ' - ' + r.hora_fin : ''}`}
                  </p>
                  {r.servicio_nombre && <p className="font-dm text-xs" style={{ color: '#fb923c' }}>📦 {r.servicio_nombre}</p>}
                  {r.notas && <p className="font-dm text-xs text-white/30 mt-1">💬 {r.notas}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="font-bebas text-2xl" style={{ color: '#f97316' }}>
                    ${r.total.toLocaleString('es-AR')}
                  </p>
                  <button onClick={() => toggleSena(r)}
                    className="font-dm text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full transition-all"
                    style={r.sena_pagada
                      ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80' }
                      : { background: 'rgba(234,179,8,0.12)', color: '#fbbf24' }}>
                    {r.sena_pagada ? `✓ Seña $${r.sena.toLocaleString('es-AR')}` : `⚠ Seña $${r.sena.toLocaleString('es-AR')} pendiente`}
                  </button>
                  {r.cant_chicos > 0 && (
                    <p className="font-dm text-[10px] text-white/30">{r.cant_chicos} chicos · {r.cant_adultos} adultos</p>
                  )}
                  <button onClick={() => openEdit(r)} className="font-dm text-[10px] text-white/30 hover:text-white transition-colors">✏️ Editar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
