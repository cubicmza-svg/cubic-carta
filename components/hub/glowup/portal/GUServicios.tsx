'use client';
import { useState, useEffect, useCallback } from 'react';

interface Servicio {
  id: number; nombre: string; descripcion: string;
  incluye: string; condiciones: string;
  precio_min: number; precio_max: number;
  tiempo: string; activo: boolean; orden: number;
}

export default function GUServicios() {
  const [items, setItems] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState('');
  const [desc, setDesc] = useState('');
  const [incluyeRaw, setIncluyeRaw] = useState('');
  const [condiciones, setCondiciones] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [tiempo, setTiempo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/glowup/servicios');
      if (r.ok) setItems(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setNombre(''); setDesc(''); setIncluyeRaw(''); setCondiciones('');
    setPrecioMin(''); setPrecioMax(''); setTiempo('');
    setEditId(null); setShowForm(false);
  }

  function startEdit(s: Servicio) {
    setNombre(s.nombre); setDesc(s.descripcion);
    const parsed: string[] = (() => { try { return JSON.parse(s.incluye); } catch { return []; } })();
    setIncluyeRaw(parsed.join('\n'));
    setCondiciones(s.condiciones);
    setPrecioMin(s.precio_min > 0 ? String(s.precio_min) : '');
    setPrecioMax(s.precio_max > 0 ? String(s.precio_max) : '');
    setTiempo(s.tiempo);
    setEditId(s.id); setShowForm(true);
  }

  async function save() {
    if (!nombre.trim()) return;
    setSaving(true);
    const incluye = JSON.stringify(incluyeRaw.split('\n').map(l => l.trim()).filter(Boolean));
    const body = {
      nombre, descripcion: desc, incluye, condiciones,
      precio_min: parseInt(precioMin) || 0,
      precio_max: parseInt(precioMax) || 0,
      tiempo,
    };
    const url = editId ? `/api/glowup/servicios/${editId}` : '/api/glowup/servicios';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await load(); resetForm(); setSaving(false);
  }

  async function toggleActivo(s: Servicio) {
    await fetch(`/api/glowup/servicios/${s.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !s.activo }),
    });
    await load();
  }

  async function del(id: number) {
    if (!confirm('¿Eliminar este servicio?')) return;
    await fetch(`/api/glowup/servicios/${id}`, { method: 'DELETE' });
    await load();
  }

  const GU = '#db2777';

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800">🌸 SERVICIOS</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-85"
          style={{ background: GU }}>
          + Nuevo servicio
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#fdf2f8', border: `2px solid #fbcfe8` }}>
          <h3 className="font-bebas text-xl tracking-widest mb-4" style={{ color: GU }}>
            {editId ? 'EDITAR SERVICIO' : 'NUEVO SERVICIO'}
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#fbcfe8' }} placeholder="Nombre del servicio" />
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Descripción</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#fbcfe8' }} placeholder="Descripción del servicio para el catálogo..." />
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                Incluye (una línea por ítem)
              </label>
              <textarea value={incluyeRaw} onChange={e => setIncluyeRaw(e.target.value)} rows={5}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#fbcfe8' }} placeholder="Mesas decorativas&#10;Alfombra&#10;Arco de globos..." />
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Condiciones</label>
              <textarea value={condiciones} onChange={e => setCondiciones(e.target.value)} rows={4}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#fbcfe8' }} placeholder="Seña, zona de trabajo, política de alquiler..." />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Precio desde $</label>
                <input type="number" value={precioMin} onChange={e => setPrecioMin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                  style={{ borderColor: '#fbcfe8' }} placeholder="100000" />
              </div>
              <div>
                <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Precio hasta $</label>
                <input type="number" value={precioMax} onChange={e => setPrecioMax(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                  style={{ borderColor: '#fbcfe8' }} placeholder="300000" />
              </div>
              <div>
                <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Tiempo armado</label>
                <input value={tiempo} onChange={e => setTiempo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                  style={{ borderColor: '#fbcfe8' }} placeholder="2–3 horas" />
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={save} disabled={saving}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-white"
                style={{ background: GU, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear servicio'}
              </button>
              <button onClick={resetForm}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-gray-500 border border-gray-200 bg-white">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="font-dm text-sm text-gray-400 py-6 text-center">Cargando servicios…</p>}

      <div className="flex flex-col gap-4">
        {items.map(s => {
          const incluye: string[] = (() => { try { return JSON.parse(s.incluye); } catch { return []; } })();
          return (
            <div key={s.id} className="rounded-2xl p-5"
              style={{ background: s.activo ? '#fdf2f8' : '#f9fafb', border: `1.5px solid ${s.activo ? '#fbcfe8' : '#e5e7eb'}` }}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bebas text-xl tracking-widest" style={{ color: s.activo ? GU : '#9ca3af' }}>
                    {s.nombre}
                  </h3>
                  {s.tiempo && <p className="font-dm text-xs text-gray-400">⏱ {s.tiempo}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggleActivo(s)}
                    className="font-dm text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-semibold"
                    style={{ background: s.activo ? '#dcfce7' : '#f3f4f6', color: s.activo ? '#16a34a' : '#9ca3af' }}>
                    {s.activo ? 'Activo' : 'Inactivo'}
                  </button>
                  <button onClick={() => startEdit(s)} className="font-dm text-xs text-gray-400 hover:text-gray-700 px-2 py-1">✏️</button>
                  <button onClick={() => del(s.id)} className="font-dm text-xs text-red-300 hover:text-red-500 px-2 py-1">🗑</button>
                </div>
              </div>

              {s.descripcion && <p className="font-dm text-sm text-gray-600 mb-3 leading-relaxed">{s.descripcion}</p>}

              {incluye.length > 0 && (
                <div className="mb-3">
                  <p className="font-dm text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Incluye</p>
                  <div className="flex flex-wrap gap-1.5">
                    {incluye.map((item, i) => (
                      <span key={i} className="font-dm text-xs px-2.5 py-1 rounded-full"
                        style={{ background: '#fce7f3', color: '#be185d' }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 items-center">
                {(s.precio_min > 0 || s.precio_max > 0) && (
                  <p className="font-bebas text-xl" style={{ color: GU }}>
                    {s.precio_min > 0 && s.precio_max > 0
                      ? `$${s.precio_min.toLocaleString('es-AR')} – $${s.precio_max.toLocaleString('es-AR')}`
                      : s.precio_min > 0 ? `Desde $${s.precio_min.toLocaleString('es-AR')}` : 'Consultar'}
                  </p>
                )}
                {!s.precio_min && !s.precio_max && (
                  <p className="font-dm text-sm text-gray-400">Precio: Consultar</p>
                )}
              </div>

              {s.condiciones && (
                <details className="mt-3">
                  <summary className="font-dm text-xs text-gray-400 cursor-pointer hover:text-gray-600 uppercase tracking-wider font-semibold">
                    Ver condiciones
                  </summary>
                  <p className="font-dm text-xs text-gray-500 mt-2 leading-relaxed whitespace-pre-line pl-2"
                    style={{ borderLeft: `2px solid #fbcfe8` }}>{s.condiciones}</p>
                </details>
              )}
            </div>
          );
        })}
        {!loading && items.length === 0 && (
          <p className="font-dm text-sm text-gray-400 py-10 text-center">
            Sin servicios aún. ¡Creá el primero! 🌸
          </p>
        )}
      </div>
    </div>
  );
}
