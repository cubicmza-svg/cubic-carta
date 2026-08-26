'use client';

import { useState, useEffect, useCallback } from 'react';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  incluye: string; // JSON array
  precio: number;
  activo: boolean;
  orden: number;
}

export default function BBServicios() {
  const [items, setItems]       = useState<Servicio[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<number | null>(null);
  const [saving, setSaving]     = useState(false);

  const [nombre, setNombre]     = useState('');
  const [desc, setDesc]         = useState('');
  const [precio, setPrecio]     = useState('');
  const [orden, setOrden]       = useState('0');
  const [incluyeInput, setIncluyeInput] = useState('');
  const [incluye, setIncluye]   = useState<string[]>([]);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/bigbang/servicios');
      if (r.ok) setItems(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const reset = () => {
    setNombre(''); setDesc(''); setPrecio(''); setOrden('0');
    setIncluye([]); setIncluyeInput(''); setEditId(null); setShowForm(false);
  };

  const openEdit = (s: Servicio) => {
    setNombre(s.nombre); setDesc(s.descripcion);
    setPrecio(String(s.precio)); setOrden(String(s.orden));
    setIncluye(JSON.parse(s.incluye || '[]'));
    setEditId(s.id); setShowForm(true);
  };

  const addIncluye = () => {
    const v = incluyeInput.trim();
    if (v && !incluye.includes(v)) setIncluye([...incluye, v]);
    setIncluyeInput('');
  };

  const save = async () => {
    if (!nombre.trim() || saving) return;
    setSaving(true);
    try {
      const body = { nombre: nombre.trim(), descripcion: desc.trim(), incluye: JSON.stringify(incluye), precio: parseInt(precio) || 0, orden: parseInt(orden) || 0 };
      if (editId !== null) {
        await fetch(`/api/bigbang/servicios/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      } else {
        await fetch('/api/bigbang/servicios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      }
      await fetch_(); reset();
    } finally { setSaving(false); }
  };

  const toggleActivo = async (s: Servicio) => {
    await fetch(`/api/bigbang/servicios/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ activo: !s.activo }) });
    setItems(prev => prev.map(x => x.id === s.id ? { ...x, activo: !s.activo } : x));
  };

  const del = async (id: number) => {
    await fetch(`/api/bigbang/servicios/${id}`, { method: 'DELETE' });
    await fetch_(); reset();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800 flex items-center gap-2">
          ⭐ SERVICIOS & PAQUETES
          {loading && <span className="font-dm text-xs text-gray-400">Cargando…</span>}
        </h2>
        <button onClick={() => { reset(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          style={{ background: '#f97316', color: '#000' }}>
          + Nuevo servicio
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(2,8,24,0.9)', backdropFilter: 'blur(8px)' }}
          onClick={reset}>
          <div className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: '#0d1a30', border: '1px solid rgba(249,115,22,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest text-gray-800">
              {editId ? 'Editar servicio' : 'Nuevo servicio'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Nombre del paquete</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)} autoFocus
                  placeholder="Ej: Paquete Premium"
                  className="px-3 py-2 rounded-lg font-dm text-sm text-gray-800 placeholder-white/20 outline-none"
                  style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Precio base ($)</label>
                <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
                  placeholder="0"
                  className="px-3 py-2 rounded-lg font-dm text-sm text-gray-800 placeholder-white/20 outline-none"
                  style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Orden</label>
                <input type="number" value={orden} onChange={e => setOrden(e.target.value)}
                  className="px-3 py-2 rounded-lg font-dm text-sm text-gray-800 outline-none"
                  style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Descripción</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                  placeholder="Descripción breve del paquete…"
                  className="px-3 py-2 rounded-lg font-dm text-sm text-gray-800 placeholder-white/20 outline-none resize-none"
                  style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="col-span-2 flex flex-col gap-2">
                <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Qué incluye</label>
                <div className="flex gap-2">
                  <input value={incluyeInput} onChange={e => setIncluyeInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIncluye(); } }}
                    placeholder="Ej: 3 horas de salón"
                    className="flex-1 px-3 py-2 rounded-lg font-dm text-sm text-gray-800 placeholder-white/20 outline-none"
                    style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <button onClick={addIncluye} type="button"
                    className="px-3 py-2 rounded-lg font-dm text-sm font-semibold text-black"
                    style={{ background: '#f97316' }}>+</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {incluye.map((item, i) => (
                    <span key={i} className="flex items-center gap-1 font-dm text-xs px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c' }}>
                      ✓ {item}
                      <button onClick={() => setIncluye(incluye.filter((_, j) => j !== i))}
                        className="ml-1 text-gray-400 hover:text-gray-800">✕</button>
                    </span>
                  ))}
                </div>
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
              <button onClick={reset}
                className="font-dm text-sm px-4 py-2 rounded-lg text-gray-400 hover:text-gray-800 transition-colors">
                Cancelar
              </button>
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
      {!loading && items.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-bebas text-2xl text-gray-300 tracking-widest">Sin servicios todavía</p>
          <p className="font-dm text-sm text-gray-400 mt-2">Cargá los paquetes que ofrecen para usarlos en reservas y presupuestos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(s => (
            <div key={s.id} className="rounded-2xl p-5 flex flex-col gap-3"
              style={{ background: '#ffffff', border: `1px solid ${s.activo ? 'rgba(249,115,22,0.2)' : '#e5e7eb'}` }}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bebas text-xl tracking-widest text-gray-800">{s.nombre}</h3>
                  {s.descripcion && <p className="font-dm text-xs text-gray-400 mt-0.5">{s.descripcion}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bebas text-2xl" style={{ color: '#f97316' }}>
                    ${s.precio.toLocaleString('es-AR')}
                  </p>
                  <p className="font-dm text-[10px] text-gray-400">precio base</p>
                </div>
              </div>

              {JSON.parse(s.incluye || '[]').length > 0 && (
                <div className="flex flex-col gap-1">
                  {(JSON.parse(s.incluye) as string[]).map((inc, i) => (
                    <p key={i} className="font-dm text-xs text-gray-500 flex items-center gap-1.5">
                      <span style={{ color: '#f97316' }}>✓</span> {inc}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mt-auto pt-2" style={{ borderTop: '1px solid #e5e7eb' }}>
                <button onClick={() => toggleActivo(s)}
                  className="font-dm text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full transition-all"
                  style={s.activo
                    ? { background: 'rgba(34,197,94,0.12)', color: '#4ade80' }
                    : { background: '#e5e7eb', color: '#9ca3af' }}>
                  {s.activo ? '● Activo' : '○ Inactivo'}
                </button>
                <button onClick={() => openEdit(s)}
                  className="font-dm text-[10px] text-gray-400 hover:text-gray-800 transition-colors ml-auto">
                  ✏️ Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

