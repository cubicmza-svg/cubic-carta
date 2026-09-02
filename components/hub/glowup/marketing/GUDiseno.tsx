'use client';
import { useState, useEffect, useCallback } from 'react';

interface Diseno {
  id: number; cliente: string; tipo: string;
  descripcion: string; formato: string;
  estado: string; notas: string; created_at: string;
}

function SelectField({ label, val, opts, set, borderColor = '#ddd6fe' }: {
  label: string; val: string; opts: string[]; set: (v: string) => void; borderColor?: string;
}) {
  return (
    <div>
      <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">{label}</label>
      <select value={val} onChange={e => set(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
        style={{ borderColor }}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

const TIPOS = ['Post', 'Story', 'Reels', 'Flyer', 'Sticker', 'Logo', 'Otro'];
const FORMATOS = ['1:1 (cuadrado)', '4:5 (vertical)', '9:16 (story)', 'A4', 'Libre'];
const ESTADOS_D = ['pendiente', 'en proceso', 'revisión', 'entregado'];
const ESTADO_COLOR: Record<string, string> = {
  pendiente: '#fef3c7', 'en proceso': '#dbeafe', revisión: '#fde8ff', entregado: '#dcfce7',
};
const ESTADO_TEXT: Record<string, string> = {
  pendiente: '#92400e', 'en proceso': '#1e40af', revisión: '#7c3aed', entregado: '#166534',
};
const GU_MKT = '#7c3aed';

export default function GUDiseno() {
  const [items, setItems] = useState<Diseno[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [cliente, setCliente] = useState('');
  const [tipo, setTipo] = useState('Post');
  const [descripcion, setDescripcion] = useState('');
  const [formato, setFormato] = useState('1:1 (cuadrado)');
  const [estado, setEstado] = useState('pendiente');
  const [notas, setNotas] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/glowup/diseno');
      if (r.ok) setItems(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setCliente(''); setTipo('Post'); setDescripcion('');
    setFormato('1:1 (cuadrado)'); setEstado('pendiente'); setNotas('');
    setEditId(null); setShowForm(false);
  }

  function startEdit(d: Diseno) {
    setCliente(d.cliente); setTipo(d.tipo); setDescripcion(d.descripcion);
    setFormato(d.formato); setEstado(d.estado); setNotas(d.notas);
    setEditId(d.id); setShowForm(true);
  }

  async function save() {
    if (!descripcion.trim()) return;
    setSaving(true);
    const body = { cliente, tipo, descripcion, formato, estado, notas };
    const url = editId ? `/api/glowup/diseno/${editId}` : '/api/glowup/diseno';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await load(); resetForm(); setSaving(false);
  }

  async function del(id: number) {
    if (!confirm('¿Eliminar?')) return;
    await fetch(`/api/glowup/diseno/${id}`, { method: 'DELETE' });
    await load();
  }

  async function cambiarEstado(d: Diseno, nuevoEstado: string) {
    await fetch(`/api/glowup/diseno/${d.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    await load();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800">🎨 DISEÑO</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-85 transition-opacity"
          style={{ background: GU_MKT }}>
          + Nuevo pedido
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#f5f3ff', border: '2px solid #ddd6fe' }}>
          <h3 className="font-bebas text-xl tracking-widest mb-4" style={{ color: GU_MKT }}>
            {editId ? 'EDITAR PEDIDO' : 'NUEVO PEDIDO DE DISEÑO'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Cliente (opcional)</label>
              <input value={cliente} onChange={e => setCliente(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#ddd6fe' }} placeholder="Nombre o "Glow Up Deco"" />
            </div>
            <SelectField label="Tipo" val={tipo} opts={TIPOS} set={setTipo} />
            <SelectField label="Formato" val={formato} opts={FORMATOS} set={setFormato} />
            <SelectField label="Estado" val={estado} opts={ESTADOS_D} set={setEstado} />
            <div className="sm:col-span-2">
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Descripción / Brief</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#ddd6fe' }} placeholder="Qué querés mostrar, colores, texto, referencias..." />
            </div>
            <div className="sm:col-span-2">
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Notas</label>
              <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#ddd6fe' }} placeholder="Fecha límite, link de referencia..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving}
              className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-white"
              style={{ background: GU_MKT, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando…' : editId ? 'Guardar' : 'Crear pedido'}
            </button>
            <button onClick={resetForm}
              className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-gray-500 border border-gray-200 bg-white">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading && <p className="font-dm text-sm text-gray-400 py-6 text-center">Cargando…</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map(d => (
          <div key={d.id} className="rounded-2xl p-4"
            style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe' }}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-dm text-sm font-semibold text-gray-800">{d.tipo} {d.formato ? `· ${d.formato}` : ''}</p>
                {d.cliente && <p className="font-dm text-xs text-gray-400">{d.cliente}</p>}
              </div>
              <span className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold shrink-0"
                style={{ background: ESTADO_COLOR[d.estado] || '#f3f4f6', color: ESTADO_TEXT[d.estado] || '#6b7280' }}>
                {d.estado}
              </span>
            </div>
            <p className="font-dm text-xs text-gray-600 mb-3 leading-relaxed line-clamp-3">{d.descripcion}</p>
            {d.notas && <p className="font-dm text-[10px] text-gray-400 mb-3 italic">{d.notas}</p>}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {ESTADOS_D.filter(e => e !== d.estado).map(e => (
                <button key={e} onClick={() => cambiarEstado(d, e)}
                  className="font-dm text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: ESTADO_COLOR[e], color: ESTADO_TEXT[e] }}>
                  {e}
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => startEdit(d)} className="font-dm text-xs text-gray-400 hover:text-gray-700">✏️</button>
              <button onClick={() => del(d.id)} className="font-dm text-xs text-red-300 hover:text-red-500">🗑</button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="font-dm text-sm text-gray-400 py-10 text-center sm:col-span-2">Sin pedidos de diseño aún 🎨</p>
        )}
      </div>
    </div>
  );
}
