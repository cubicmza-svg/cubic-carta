'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { MenuItem } from '@/lib/types';

// ─── Constantes ───────────────────────────────────────────────────────────────
const CATEGORIAS = [
  'BRUNCH', 'PROMOS', 'CAFETERIA E INFUSIONES', 'PARA ACOMPAÑAR',
  'GLUTEN FREE', 'PARA COMER', 'BEBIDAS SIN ALCOHOL', 'BEBIDAS CON ALCOHOL',
];

type FormData = Omit<MenuItem, 'id'>;

const EMPTY_FORM: FormData = {
  categoria: '', subcategoria: '', nombre: '', descripcion: '',
  precio: 0, precio_alternativo: '', imagen_url: '', activo: true, orden: 0,
};

// ─── Compresión de imagen ─────────────────────────────────────────────────────
const MAX_PX = 420;
const QUALITY = 0.72;
const CHAR_WARN = 40000;
const CHAR_LIMIT = 49000;

function compressToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (ev) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_PX) { height = Math.round((height * MAX_PX) / width); width = MAX_PX; }
        } else {
          if (height > MAX_PX) { width = Math.round((width * MAX_PX) / height); height = MAX_PX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.src = ev.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Campo de imagen ──────────────────────────────────────────────────────────
function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [imgMode, setImgMode] = useState<'url' | 'file'>('url');
  const [compressing, setCompressing] = useState(false);
  const [warn, setWarn] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setWarn('Solo JPG, PNG o WebP'); return; }
    setWarn(''); setCompressing(true);
    try {
      const dataUrl = await compressToBase64(file);
      if (dataUrl.length > CHAR_LIMIT) { setWarn(`Imagen demasiado grande (${Math.round(dataUrl.length / 1000)}k). Usá una foto más chica.`); return; }
      if (dataUrl.length > CHAR_WARN) setWarn(`⚠ Grande (${Math.round(dataUrl.length / 1000)}k chars)`);
      onChange(dataUrl);
    } catch { setWarn('Error al procesar'); }
    finally { setCompressing(false); if (fileRef.current) fileRef.current.value = ''; }
  }

  const isBase64 = value.startsWith('data:');
  const ic = 'w-full px-3 py-2.5 rounded-lg bg-[#211D2A] border border-[#2D2840] text-white font-dm text-sm placeholder-[#9B97A8] focus:outline-none focus:border-[#4ADE80] transition-colors';

  return (
    <div className="space-y-2">
      <div className="flex gap-1 p-1 rounded-lg bg-[#211D2A] border border-[#2D2840] w-fit">
        {(['url', 'file'] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setImgMode(m); setWarn(''); }}
            className={`px-3 py-1 rounded-md font-dm text-xs transition-all ${imgMode === m ? 'bg-[#2D2840] text-white' : 'text-[#9B97A8] hover:text-white'}`}>
            {m === 'url' ? '🔗 URL' : '📁 Archivo'}
          </button>
        ))}
      </div>

      {imgMode === 'url' ? (
        <input type="url" value={isBase64 ? '' : value} onChange={(e) => onChange(e.target.value)}
          placeholder="https://..." className={ic} />
      ) : (
        <>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={compressing}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed font-dm text-sm transition-all
              ${compressing ? 'border-[#4ADE80]/40 text-[#4ADE80] animate-pulse' : 'border-[#2D2840] text-[#9B97A8] hover:border-[#4ADE80]/60 hover:text-white'}`}>
            {compressing ? '⏳ Comprimiendo...' : '📷 Seleccionar JPG / PNG'}
          </button>
        </>
      )}

      {value && (
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#211D2A] border border-[#2D2840]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-12 h-12 rounded object-cover bg-[#2D2840] flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <p className="flex-1 font-dm text-xs text-[#9B97A8] truncate min-w-0">
            {isBase64 ? `Base64 · ${Math.round(value.length / 1000)}k chars` : value}
          </p>
          <button type="button" onClick={() => { onChange(''); setWarn(''); }}
            className="text-red-400/60 hover:text-red-400 font-dm text-xs flex-shrink-0">✕</button>
        </div>
      )}
      {warn && <p className={`font-dm text-xs px-3 py-2 rounded-lg ${warn.startsWith('⚠') ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>{warn}</p>}
    </div>
  );
}

// ─── Formulario de ítem (agregar y editar) ────────────────────────────────────
function ItemForm({
  initial, onSave, onCancel, submitLabel,
}: {
  initial: FormData;
  onSave: (data: FormData) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');

  const set = (k: keyof FormData, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const ic = 'w-full px-3 py-2.5 rounded-lg bg-[#211D2A] border border-[#2D2840] text-white font-dm text-sm placeholder-[#9B97A8] focus:outline-none focus:border-[#4ADE80] transition-colors';
  const lc = 'block font-dm text-sm text-[#9B97A8] mb-1.5';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading'); setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      {/* Categoría */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lc}>Categoría *</label>
          <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)} required className={ic}>
            <option value="">Seleccioná...</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            <option value="__nueva__">+ Nueva categoría</option>
          </select>
        </div>
        <div>
          <label className={lc}>Subcategoría</label>
          <input type="text" value={form.subcategoria} onChange={(e) => set('subcategoria', e.target.value)}
            placeholder="Ej: TRADICIONAL" className={ic} />
        </div>
      </div>

      {form.categoria === '__nueva__' && (
        <div>
          <label className={lc}>Nombre de la nueva categoría *</label>
          <input type="text" placeholder="Ej: POSTRES" required className={ic}
            onChange={(e) => set('categoria', e.target.value)} />
        </div>
      )}

      {/* Nombre */}
      <div>
        <label className={lc}>Nombre *</label>
        <input type="text" value={form.nombre} onChange={(e) => set('nombre', e.target.value)}
          placeholder="Ej: Tostón de Campo" required className={ic} />
      </div>

      {/* Descripción */}
      <div>
        <label className={lc}>Descripción</label>
        <textarea value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)}
          placeholder="Ingredientes, variantes..." rows={2} className={`${ic} resize-none`} />
      </div>

      {/* Precios */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lc}>Precio (ARS)</label>
          <input type="number" value={form.precio || ''} onChange={(e) => set('precio', parseFloat(e.target.value) || 0)}
            placeholder="0" min={0} step={100} className={ic} />
        </div>
        <div>
          <label className={lc}>Precio alternativo</label>
          <input type="text" value={form.precio_alternativo} onChange={(e) => set('precio_alternativo', e.target.value)}
            placeholder="Para 2: $20.000" className={ic} />
        </div>
      </div>

      {/* Imagen */}
      <div>
        <label className={lc}>Imagen</label>
        <ImageField value={form.imagen_url} onChange={(v) => set('imagen_url', v)} />
      </div>

      {/* Orden y Activo */}
      <div className="flex items-center gap-6">
        <div className="w-28">
          <label className={lc}>Orden</label>
          <input type="number" value={form.orden || ''} onChange={(e) => set('orden', parseInt(e.target.value) || 0)}
            min={0} placeholder="0" className={ic} />
        </div>
        <div className="flex items-center gap-2 mt-5">
          <input type="checkbox" id="item-activo" checked={form.activo}
            onChange={(e) => set('activo', e.target.checked)} className="w-4 h-4 accent-[#4ADE80]" />
          <label htmlFor="item-activo" className="font-dm text-sm text-[#9B97A8] cursor-pointer">Visible en la carta</label>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="font-dm text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={status === 'loading' || !form.nombre || !form.categoria}
          className="px-6 py-2.5 rounded-lg bg-[#4ADE80] text-black font-dm font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-40">
          {status === 'loading' ? 'Guardando...' : submitLabel}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-[#2D2840] text-[#9B97A8] font-dm text-sm hover:text-white hover:border-white transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ─── Tabla de ítems ───────────────────────────────────────────────────────────
function ItemsTable({ items, onEdit, onDelete, deletingId, onConfirmDelete, onCancelDelete }: {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}) {
  const fmtPrice = (p: number) => p ? `$${p.toLocaleString('es-AR')}` : '—';

  return (
    <div className="overflow-x-auto rounded-xl border border-[#2D2840]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#13101A]">
          <tr>
            {['', 'Nombre', 'Categoría', 'Precio', 'Estado', 'Acciones'].map((h) => (
              <th key={h} className="px-4 py-3 font-bebas text-xs text-[#9B97A8] tracking-widest border-b border-[#2D2840] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.id} className={`border-b border-[#2D2840]/50 transition-colors ${i % 2 === 0 ? 'bg-[#1A1721]' : 'bg-[#1E1929]'} hover:bg-[#2D2840]/40`}>
              {/* Imagen */}
              <td className="px-3 py-2.5 w-12">
                {item.imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imagen_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-[#2D2840]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#2D2840] flex items-center justify-center">
                    <span className="font-bebas text-[#4ADE80] text-sm">{item.nombre[0]}</span>
                  </div>
                )}
              </td>

              {/* Nombre + Subcategoría */}
              <td className="px-4 py-2.5 max-w-[180px]">
                <p className="font-dm font-semibold text-white text-sm truncate">{item.nombre}</p>
                {item.subcategoria && <p className="font-dm text-[#9B97A8] text-xs truncate">{item.subcategoria}</p>}
              </td>

              {/* Categoría */}
              <td className="px-4 py-2.5 hidden md:table-cell max-w-[140px]">
                <p className="font-dm text-[#9B97A8] text-xs truncate">{item.categoria}</p>
              </td>

              {/* Precio */}
              <td className="px-4 py-2.5 whitespace-nowrap">
                <span className="font-bebas text-[#4ADE80] text-base">{fmtPrice(item.precio)}</span>
              </td>

              {/* Estado */}
              <td className="px-4 py-2.5 hidden sm:table-cell">
                <span className={`inline-flex items-center gap-1.5 font-dm text-xs px-2 py-1 rounded-full ${item.activo ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-amber-500/10 text-amber-400'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {item.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>

              {/* Acciones */}
              <td className="px-4 py-2.5">
                {deletingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <span className="font-dm text-xs text-white whitespace-nowrap">¿Eliminar?</span>
                    <button onClick={() => onConfirmDelete(item.id)}
                      className="px-2.5 py-1 rounded-lg bg-red-500 font-dm text-xs text-white hover:bg-red-600 transition-colors">Sí</button>
                    <button onClick={onCancelDelete}
                      className="px-2.5 py-1 rounded-lg border border-[#2D2840] font-dm text-xs text-[#9B97A8] hover:text-white transition-colors">No</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(item)}
                      className="p-2 rounded-lg text-[#9B97A8] hover:text-white hover:bg-[#2D2840] transition-all" title="Editar">
                      ✎
                    </button>
                    <button onClick={() => onDelete(item.id)}
                      className="p-2 rounded-lg text-[#9B97A8] hover:text-red-400 hover:bg-red-500/10 transition-all" title="Eliminar">
                      🗑
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
type Mode = 'lista' | 'agregar' | 'editar';

export default function AdminPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('lista');
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [seeding, setSeeding] = useState(false);

  // ── Fetch de ítems desde KV ──────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/items');
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────
  async function handleAdd(data: FormData) {
    const res = await fetch('/api/admin/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    const newItem: MenuItem = await res.json();
    setItems((prev) => [...prev, newItem]);
    setMode('lista');
    showToast('✓ Ítem agregado');
  }

  async function handleEdit(data: FormData) {
    if (!editingItem) return;
    const res = await fetch(`/api/admin/items/${editingItem.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
    const updated: MenuItem = await res.json();
    setItems((prev) => prev.map((i) => i.id === updated.id ? updated : i));
    setMode('lista');
    showToast('✓ Cambios guardados');
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/items/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); showToast(`✗ ${d.error}`); return; }
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeletingId(null);
    showToast('Ítem eliminado');
  }

  async function handleSeed() {
    if (!confirm('¿Cargar los datos iniciales de la carta? Esto reemplazará todos los ítems actuales.')) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' });
      const d = await res.json();
      if (res.ok) { await fetchItems(); showToast(`✓ ${d.count} ítems cargados`); }
      else showToast(`✗ ${d.error}`);
    } finally {
      setSeeding(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  const totalActivos = items.filter((i) => i.activo).length;

  return (
    <div className="min-h-screen bg-[#0F0D14]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-[#13101A] border-b border-[#2D2840]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-2">
            <span className="font-bebas text-2xl text-white tracking-widest">CUBIC</span>
            <span className="font-dm text-[#9B97A8] text-xs tracking-widest hidden sm:inline">/ ADMIN</span>
          </div>

          {/* Acciones principales */}
          <button
            onClick={() => setMode('lista')}
            className={`px-4 py-2 rounded-lg font-dm text-xs font-semibold transition-all ${mode === 'lista' ? 'bg-[#4ADE80] text-black' : 'border border-[#2D2840] text-[#9B97A8] hover:border-[#4ADE80] hover:text-[#4ADE80]'}`}
          >
            ☰ ÍTEMS ({items.length})
          </button>

          <button
            onClick={() => setMode('agregar')}
            className={`px-4 py-2 rounded-lg font-dm text-xs font-semibold transition-all ${mode === 'agregar' ? 'bg-[#4ADE80] text-black' : 'border border-[#2D2840] text-[#9B97A8] hover:border-[#4ADE80] hover:text-[#4ADE80]'}`}
          >
            + AGREGAR ÍTEM
          </button>

          {/* Seed (solo si está vacío o para reset) */}
          <button
            onClick={handleSeed}
            disabled={seeding}
            title="Cargar carta inicial desde los datos del proyecto"
            className="px-4 py-2 rounded-lg border border-[#2D2840] font-dm text-xs text-[#9B97A8] hover:border-amber-500/50 hover:text-amber-400 transition-all disabled:opacity-40"
          >
            {seeding ? '⏳ Cargando...' : '🌱 Datos iniciales'}
          </button>

          {/* Derecha */}
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline font-dm text-xs text-[#9B97A8]">
              {totalActivos}/{items.length} activos
            </span>
            <button onClick={handleLogout}
              className="px-3 py-2 rounded-lg font-dm text-xs text-[#9B97A8] hover:text-red-400 transition-colors">
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#1A1721] border border-[#2D2840] shadow-2xl">
          <p className="font-dm text-sm text-white">{toast}</p>
        </div>
      )}

      {/* ── Contenido ──────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* MODO: LISTA ──────────────────────────────────────────────────── */}
        {mode === 'lista' && (
          <div>
            <div className="mb-6">
              <h1 className="font-bebas text-4xl text-white tracking-widest">CARTA</h1>
              <p className="font-dm text-[#9B97A8] text-sm mt-1">
                {loading ? 'Cargando...' : `${items.length} ítems · ${totalActivos} activos`}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-24">
                <p className="font-bebas text-2xl text-[#9B97A8] tracking-widest animate-pulse">CARGANDO...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <p className="font-bebas text-2xl text-[#9B97A8] tracking-widest">SIN ÍTEMS</p>
                <p className="font-dm text-sm text-[#9B97A8]">
                  Hacé click en <span className="text-amber-400">🌱 Datos iniciales</span> para cargar la carta completa,
                  o en <span className="text-[#4ADE80]">+ AGREGAR ÍTEM</span> para empezar desde cero.
                </p>
              </div>
            ) : (
              <ItemsTable
                items={items}
                onEdit={(item) => { setEditingItem(item); setMode('editar'); }}
                onDelete={(id) => setDeletingId(id)}
                deletingId={deletingId}
                onConfirmDelete={handleDelete}
                onCancelDelete={() => setDeletingId(null)}
              />
            )}
          </div>
        )}

        {/* MODO: AGREGAR ────────────────────────────────────────────────── */}
        {mode === 'agregar' && (
          <div>
            <div className="mb-6">
              <h1 className="font-bebas text-4xl text-white tracking-widest">AGREGAR ÍTEM</h1>
              <p className="font-dm text-[#9B97A8] text-sm mt-1">Nuevo plato o bebida en la carta</p>
            </div>
            <ItemForm
              initial={EMPTY_FORM}
              onSave={handleAdd}
              onCancel={() => setMode('lista')}
              submitLabel="+ Agregar ítem"
            />
          </div>
        )}

        {/* MODO: EDITAR ─────────────────────────────────────────────────── */}
        {mode === 'editar' && editingItem && (
          <div>
            <div className="mb-6">
              <button onClick={() => setMode('lista')} className="font-dm text-xs text-[#9B97A8] hover:text-white transition-colors mb-3 flex items-center gap-1">
                ← Volver a la lista
              </button>
              <h1 className="font-bebas text-4xl text-white tracking-widest">EDITAR ÍTEM</h1>
              <p className="font-dm text-[#9B97A8] text-sm mt-1">{editingItem.nombre}</p>
            </div>
            <ItemForm
              initial={{
                categoria: editingItem.categoria,
                subcategoria: editingItem.subcategoria,
                nombre: editingItem.nombre,
                descripcion: editingItem.descripcion,
                precio: editingItem.precio,
                precio_alternativo: editingItem.precio_alternativo,
                imagen_url: editingItem.imagen_url,
                activo: editingItem.activo,
                orden: editingItem.orden,
              }}
              onSave={handleEdit}
              onCancel={() => setMode('lista')}
              submitLabel="✓ Guardar cambios"
            />
          </div>
        )}
      </main>
    </div>
  );
}
