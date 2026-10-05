'use client';
import { useState, useEffect, useCallback } from 'react';

interface Item {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  incluye: string;
  precio_desde: number;
  imagen_url: string;
  activo: boolean;
  orden: number;
}

const GU = '#db2777';
const CATEGORIAS = [
  'Arcos y estructuras',
  'Mesas dulces',
  'Globos',
  'Decoración floral',
  'Temáticas',
  'Baby shower',
  'Casamientos',
  'Corporativos',
  'Otros',
];

export default function GUCatalogo() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [desc, setDesc] = useState('');
  const [incluyeRaw, setIncluyeRaw] = useState('');
  const [precioDesde, setPrecioDesde] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/glowup/catalogo');
      if (r.ok) setItems(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setNombre(''); setCategoria(CATEGORIAS[0]); setDesc('');
    setIncluyeRaw(''); setPrecioDesde(''); setImagenUrl('');
    setEditId(null); setShowForm(false);
  }

  function startEdit(item: Item) {
    setNombre(item.nombre);
    setCategoria(item.categoria || CATEGORIAS[0]);
    setDesc(item.descripcion);
    const parsed: string[] = (() => { try { return JSON.parse(item.incluye); } catch { return []; } })();
    setIncluyeRaw(parsed.join('\n'));
    setPrecioDesde(item.precio_desde > 0 ? String(item.precio_desde) : '');
    setImagenUrl(item.imagen_url || '');
    setEditId(item.id);
    setShowForm(true);
  }

  async function save() {
    if (!nombre.trim()) return;
    setSaving(true);
    const incluye = JSON.stringify(incluyeRaw.split('\n').map(l => l.trim()).filter(Boolean));
    const body = {
      nombre, categoria, descripcion: desc, incluye,
      precio_desde: parseInt(precioDesde) || 0,
      imagen_url: imagenUrl,
    };
    const url = editId ? `/api/glowup/catalogo/${editId}` : '/api/glowup/catalogo';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await load(); resetForm(); setSaving(false);
  }

  async function toggleActivo(item: Item) {
    await fetch(`/api/glowup/catalogo/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !item.activo }),
    });
    await load();
  }

  async function del(id: number) {
    if (!confirm('¿Eliminar este ítem del catálogo?')) return;
    await fetch(`/api/glowup/catalogo/${id}`, { method: 'DELETE' });
    await load();
  }

  const catUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/catalogo/glowup`
    : '/catalogo/glowup';

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">

      {/* Header + acciones */}
      <div className="flex items-start justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h2 className="font-bebas text-2xl tracking-widest text-gray-800">✨ CATÁLOGO</h2>
          <p className="font-dm text-xs text-gray-400 mt-1">
            Lo que agregues aquí aparece en la página pública para compartirle a los clientes.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <a href="/catalogo/glowup" target="_blank"
            className="font-dm text-xs font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
            style={{ background: '#fce7f3', color: GU }}>
            🔗 Ver catálogo público
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(catUrl)}
            className="font-dm text-xs font-semibold px-4 py-2 rounded-xl border transition-opacity hover:opacity-70"
            style={{ borderColor: '#fbcfe8', color: '#6b7280' }}>
            📋 Copiar link
          </button>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="font-dm text-sm font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-85"
            style={{ background: GU }}>
            + Nuevo ítem
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#fdf2f8', border: '2px solid #fbcfe8' }}>
          <h3 className="font-bebas text-xl tracking-widest mb-4" style={{ color: GU }}>
            {editId ? 'EDITAR ÍTEM' : 'NUEVO ÍTEM'}
          </h3>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Nombre</label>
                <input value={nombre} onChange={e => setNombre(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                  style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }}
                  placeholder="Arco de globos orgánico" />
              </div>
              <div>
                <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Categoría</label>
                <select value={categoria} onChange={e => setCategoria(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                  style={{ borderColor: '#fbcfe8', color: '#1f2937' }}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Descripción</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }}
                placeholder="Descripción breve para el catálogo…" />
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                Incluye (una línea por ítem)
              </label>
              <textarea value={incluyeRaw} onChange={e => setIncluyeRaw(e.target.value)} rows={4}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }}
                placeholder={'Arco orgánico\nMesa decorativa\nGlobos en tono pastel…'} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Precio desde $</label>
                <input type="number" value={precioDesde} onChange={e => setPrecioDesde(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                  style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }}
                  placeholder="80000" />
              </div>
              <div>
                <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                  URL de imagen <span className="text-gray-400 normal-case font-normal">(Drive, Cloudinary, etc.)</span>
                </label>
                <input value={imagenUrl} onChange={e => setImagenUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                  style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }}
                  placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={save} disabled={saving}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-white"
                style={{ background: GU, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Agregar al catálogo'}
              </button>
              <button onClick={resetForm}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-gray-500 border border-gray-200 bg-white">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="font-dm text-sm text-gray-400 py-6 text-center">Cargando catálogo…</p>}

      {/* Lista */}
      <div className="flex flex-col gap-4">
        {items.map(item => {
          const incluye: string[] = (() => { try { return JSON.parse(item.incluye); } catch { return []; } })();
          return (
            <div key={item.id} className="rounded-2xl overflow-hidden"
              style={{ background: item.activo ? '#fdf2f8' : '#f9fafb', border: `1.5px solid ${item.activo ? '#fbcfe8' : '#e5e7eb'}` }}>

              <div className="flex gap-4 p-5">
                {/* Imagen */}
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt={item.nombre}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center text-3xl"
                    style={{ background: '#fce7f3' }}>🎀</div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="font-dm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full mr-2"
                        style={{ background: '#fce7f3', color: '#be185d' }}>{item.categoria}</span>
                      <h3 className="font-bebas text-xl tracking-widest inline"
                        style={{ color: item.activo ? GU : '#9ca3af' }}>{item.nombre}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => toggleActivo(item)}
                        className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: item.activo ? '#dcfce7' : '#f3f4f6', color: item.activo ? '#16a34a' : '#9ca3af' }}>
                        {item.activo ? 'Visible' : 'Oculto'}
                      </button>
                      <button onClick={() => startEdit(item)} className="font-dm text-xs text-gray-400 hover:text-gray-700 px-1.5 py-1">✏️</button>
                      <button onClick={() => del(item.id)} className="font-dm text-xs text-red-300 hover:text-red-500 px-1.5 py-1">🗑</button>
                    </div>
                  </div>

                  {item.descripcion && (
                    <p className="font-dm text-sm text-gray-500 leading-relaxed mb-2">{item.descripcion}</p>
                  )}

                  {incluye.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {incluye.map((inc, i) => (
                        <span key={i} className="font-dm text-xs px-2 py-0.5 rounded-full"
                          style={{ background: '#fce7f3', color: '#be185d' }}>{inc}</span>
                      ))}
                    </div>
                  )}

                  {item.precio_desde > 0 && (
                    <p className="font-bebas text-lg" style={{ color: GU }}>
                      Desde ${item.precio_desde.toLocaleString('es-AR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!loading && items.length === 0 && (
          <p className="font-dm text-sm text-gray-400 py-10 text-center">
            El catálogo está vacío. ¡Agregá el primer ítem! ✨
          </p>
        )}
      </div>
    </div>
  );
}
