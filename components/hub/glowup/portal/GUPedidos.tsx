'use client';
import { useState, useEffect, useCallback } from 'react';

interface Servicio { id: number; nombre: string; }
interface Pedido {
  id: number; cliente: string; telefono: string;
  fecha_evento: string; hora: string; lugar: string;
  nombre_cumple: string; edad: number; tematica: string;
  servicio_id: number | null; servicio_nombre: string;
  colores: string; total: number; sena: number;
  sena_pagada: boolean; estado: string; notas: string;
}

const ESTADOS = ['pendiente', 'confirmado', 'entregado', 'cancelado'];
const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#fef3c7', confirmado: '#dcfce7', entregado: '#dbeafe', cancelado: '#fee2e2',
};
const ESTADO_TEXT: Record<string, string> = {
  pendiente: '#92400e', confirmado: '#166534', entregado: '#1e40af', cancelado: '#991b1b',
};
const GU = '#db2777';

const EMPTY: Omit<Pedido, 'id'> = {
  cliente: '', telefono: '', fecha_evento: '', hora: '', lugar: '',
  nombre_cumple: '', edad: 0, tematica: '', servicio_id: null,
  servicio_nombre: '', colores: '', total: 0, sena: 0,
  sena_pagada: false, estado: 'pendiente', notas: '',
};

export default function GUPedidos() {
  const [items, setItems] = useState<Pedido[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandId, setExpandId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [form, setForm] = useState({ ...EMPTY });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rp, rs] = await Promise.all([fetch('/api/glowup/pedidos'), fetch('/api/glowup/servicios')]);
      if (rp.ok) setItems(await rp.json());
      if (rs.ok) setServicios(await rs.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() { setForm({ ...EMPTY }); setEditId(null); setShowForm(false); }

  function startEdit(p: Pedido) {
    setForm({
      cliente: p.cliente, telefono: p.telefono,
      fecha_evento: p.fecha_evento?.split('T')[0] || '',
      hora: p.hora, lugar: p.lugar,
      nombre_cumple: p.nombre_cumple, edad: p.edad || 0,
      tematica: p.tematica, servicio_id: p.servicio_id,
      servicio_nombre: p.servicio_nombre, colores: p.colores,
      total: p.total || 0, sena: p.sena || 0,
      sena_pagada: p.sena_pagada || false,
      estado: p.estado, notas: p.notas,
    });
    setEditId(p.id); setShowForm(true); setExpandId(null);
  }

  function setF<K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) {
    setForm(f => ({ ...f, [k]: v }));
    if (k === 'servicio_id') {
      const srv = servicios.find(s => s.id === Number(v));
      setForm(f => ({ ...f, servicio_id: Number(v) || null, servicio_nombre: srv?.nombre || '' }));
    }
  }

  async function save() {
    if (!form.cliente.trim()) return;
    setSaving(true);
    const body = {
      ...form,
      total: Number(form.total) || 0,
      sena: Number(form.sena) || 0,
      edad: Number(form.edad) || 0,
    };
    const url = editId ? `/api/glowup/pedidos/${editId}` : '/api/glowup/pedidos';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await load(); resetForm(); setSaving(false);
  }

  async function del(id: number) {
    if (!confirm('¿Eliminar este pedido?')) return;
    await fetch(`/api/glowup/pedidos/${id}`, { method: 'DELETE' });
    await load();
  }

  async function cambiarEstado(p: Pedido, estado: string) {
    await fetch(`/api/glowup/pedidos/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    await load();
  }

  const filtered = filtroEstado === 'todos' ? items : items.filter(p => p.estado === filtroEstado);

  const Input = ({ label, val, onChange, type = 'text', ph = '' }: {
    label: string; val: string | number; onChange: (v: string) => void; type?: string; ph?: string;
  }) => (
    <div>
      <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">{label}</label>
      <input type={type} value={val} onChange={e => onChange(e.target.value)} placeholder={ph}
        className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
        style={{ borderColor: '#fbcfe8' }} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800">🎀 PEDIDOS</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-85 transition-opacity"
          style={{ background: GU }}>
          + Nuevo pedido
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['todos', ...ESTADOS].map(e => (
          <button key={e} onClick={() => setFiltroEstado(e)}
            className="font-dm text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all"
            style={filtroEstado === e
              ? { background: GU, color: '#fff' }
              : { background: '#f3f4f6', color: '#6b7280' }}>
            {e}
          </button>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#fdf2f8', border: '2px solid #fbcfe8' }}>
          <h3 className="font-bebas text-xl tracking-widest mb-4" style={{ color: GU }}>
            {editId ? 'EDITAR PEDIDO' : 'NUEVO PEDIDO'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Cliente" val={form.cliente} onChange={v => setF('cliente', v)} ph="Nombre y apellido" />
            <Input label="Teléfono" val={form.telefono} onChange={v => setF('telefono', v)} ph="261..." />
            <Input label="Fecha del evento" val={form.fecha_evento} onChange={v => setF('fecha_evento', v)} type="date" />
            <Input label="Hora" val={form.hora} onChange={v => setF('hora', v)} ph="18:00" />
            <div className="sm:col-span-2">
              <Input label="Lugar del evento" val={form.lugar} onChange={v => setF('lugar', v)} ph="Salón, dirección..." />
            </div>
            <Input label="Nombre del cumpleañero/a" val={form.nombre_cumple} onChange={v => setF('nombre_cumple', v)} ph="Agus, Emma..." />
            <Input label="Edad" val={form.edad || ''} onChange={v => setF('edad', Number(v) as any)} type="number" ph="5" />
            <div className="sm:col-span-2">
              <Input label="Temática" val={form.tematica} onChange={v => setF('tematica', v)} ph="Disney, Sirena, Astronauta..." />
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Servicio</label>
              <select value={form.servicio_id || ''} onChange={e => setF('servicio_id', e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#fbcfe8' }}>
                <option value="">Seleccionar...</option>
                {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <Input label="Colores" val={form.colores} onChange={v => setF('colores', v)} ph="Rosa, lila, dorado..." />
            <Input label="Total $" val={form.total || ''} onChange={v => setF('total', Number(v) as any)} type="number" ph="200000" />
            <Input label="Seña $" val={form.sena || ''} onChange={v => setF('sena', Number(v) as any)} type="number" ph="100000" />
            <div className="flex items-center gap-3 pt-4">
              <input type="checkbox" id="sena_pagada" checked={form.sena_pagada}
                onChange={e => setF('sena_pagada', e.target.checked as any)}
                className="w-4 h-4 accent-pink-500" />
              <label htmlFor="sena_pagada" className="font-dm text-sm text-gray-600">Seña cobrada</label>
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Estado</label>
              <select value={form.estado} onChange={e => setF('estado', e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#fbcfe8' }}>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Notas</label>
              <textarea value={form.notas} onChange={e => setF('notas', e.target.value as any)} rows={3}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#fbcfe8' }} placeholder="Cualquier detalle importante..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving}
              className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-white"
              style={{ background: GU, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear pedido'}
            </button>
            <button onClick={resetForm}
              className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-gray-500 border border-gray-200 bg-white">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading && <p className="font-dm text-sm text-gray-400 py-6 text-center">Cargando pedidos…</p>}

      <div className="flex flex-col gap-3">
        {filtered.map(p => {
          const expanded = expandId === p.id;
          const saldo = (p.total || 0) - (p.sena || 0);
          return (
            <div key={p.id} className="rounded-2xl overflow-hidden"
              style={{ border: '1.5px solid #fbcfe8', background: '#fdf2f8' }}>
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() => setExpandId(expanded ? null : p.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-dm text-sm font-semibold text-gray-800">{p.cliente}</p>
                    {p.nombre_cumple && (
                      <span className="font-dm text-xs text-gray-400">🎂 {p.nombre_cumple}{p.edad ? ` (${p.edad})` : ''}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {p.fecha_evento && (
                      <span className="font-dm text-xs text-gray-500">
                        📅 {new Date(p.fecha_evento + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {p.hora ? ` · ${p.hora}` : ''}
                      </span>
                    )}
                    {p.servicio_nombre && <span className="font-dm text-xs text-gray-400">✨ {p.servicio_nombre}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: ESTADO_COLOR[p.estado] || '#f3f4f6', color: ESTADO_TEXT[p.estado] || '#6b7280' }}>
                    {p.estado}
                  </span>
                  <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded && (
                <div className="px-5 pb-5 pt-1 border-t" style={{ borderColor: '#fbcfe8', background: 'white' }}>
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-dm text-gray-600">
                    {p.telefono && <div><span className="text-gray-400">Tel: </span>{p.telefono}</div>}
                    {p.lugar && <div><span className="text-gray-400">Lugar: </span>{p.lugar}</div>}
                    {p.tematica && <div><span className="text-gray-400">Temática: </span>{p.tematica}</div>}
                    {p.colores && <div><span className="text-gray-400">Colores: </span>{p.colores}</div>}
                    {p.total > 0 && <div><span className="text-gray-400">Total: </span><strong>${p.total.toLocaleString('es-AR')}</strong></div>}
                    {p.sena > 0 && (
                      <div>
                        <span className="text-gray-400">Seña: </span>
                        <strong>${p.sena.toLocaleString('es-AR')}</strong>
                        {' '}
                        <span className={p.sena_pagada ? 'text-green-600' : 'text-orange-500'}>
                          ({p.sena_pagada ? '✓ cobrada' : 'pendiente'})
                        </span>
                      </div>
                    )}
                    {saldo > 0 && <div><span className="text-gray-400">Saldo: </span><strong style={{ color: GU }}>${saldo.toLocaleString('es-AR')}</strong></div>}
                    {p.notas && <div className="col-span-2"><span className="text-gray-400">Notas: </span>{p.notas}</div>}
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-dm text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Mover a:</span>
                    {ESTADOS.filter(e => e !== p.estado).map(e => (
                      <button key={e} onClick={() => cambiarEstado(p, e)}
                        className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: ESTADO_COLOR[e], color: ESTADO_TEXT[e] }}>
                        {e}
                      </button>
                    ))}
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => startEdit(p)} className="font-dm text-xs text-gray-400 hover:text-gray-700 px-2">✏️ Editar</button>
                      <button onClick={() => del(p.id)} className="font-dm text-xs text-red-300 hover:text-red-500 px-2">🗑 Eliminar</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <p className="font-dm text-sm text-gray-400 py-10 text-center">
            {filtroEstado === 'todos' ? 'Sin pedidos aún 🎀' : `Sin pedidos en estado "${filtroEstado}"`}
          </p>
        )}
      </div>
    </div>
  );
}
