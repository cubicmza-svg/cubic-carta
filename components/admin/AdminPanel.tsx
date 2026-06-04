'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Constantes ──────────────────────────────────────────────────────────────
const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID ?? '';

const CATEGORIAS = [
  'BRUNCH', 'PROMOS', 'CAFETERIA E INFUSIONES', 'PARA ACOMPAÑAR',
  'GLUTEN FREE', 'PARA COMER', 'BEBIDAS SIN ALCOHOL', 'BEBIDAS CON ALCOHOL',
];

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface FormState {
  id: string;
  categoria: string;
  subcategoria: string;
  nombre: string;
  descripcion: string;
  precio: string;
  precio_alternativo: string;
  imagen_url: string;
  activo: boolean;
  orden: string;
}

const EMPTY_FORM: FormState = {
  id: '', categoria: '', subcategoria: '', nombre: '', descripcion: '',
  precio: '', precio_alternativo: '', imagen_url: '', activo: true, orden: '',
};

// ─── Compresión de imagen ─────────────────────────────────────────────────────
const MAX_PX = 420;
const QUALITY = 0.72;
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

// ─── Campo de imagen (URL + subida de archivo) ────────────────────────────────
function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [compressing, setCompressing] = useState(false);
  const [warn, setWarn] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setWarn('Solo JPG, PNG o WebP'); return; }
    setWarn(''); setCompressing(true);
    try {
      const dataUrl = await compressToBase64(file);
      if (dataUrl.length > CHAR_LIMIT) {
        setWarn(`Imagen demasiado grande (${Math.round(dataUrl.length / 1000)}k chars). Usá una foto más pequeña o pegá una URL.`);
        return;
      }
      if (dataUrl.length > 40000) setWarn(`⚠ Grande (${Math.round(dataUrl.length / 1000)}k chars). Puede funcionar.`);
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
          <button key={m} type="button" onClick={() => { setMode(m); setWarn(''); }}
            className={`px-3 py-1 rounded-md font-dm text-xs transition-all ${mode === m ? 'bg-[#2D2840] text-white' : 'text-[#9B97A8] hover:text-white'}`}>
            {m === 'url' ? '🔗 URL' : '📁 Archivo'}
          </button>
        ))}
      </div>

      {mode === 'url' ? (
        <div>
          <input type="url" value={isBase64 ? '' : value} onChange={(e) => onChange(e.target.value)}
            placeholder="https://drive.google.com/uc?export=view&id=..." className={ic} />
          <p className="mt-1 font-dm text-xs text-[#9B97A8]">Drive: compartir → obtener enlace → usar <code className="text-[#4ADE80]">uc?export=view&id=FILE_ID</code></p>
        </div>
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={compressing}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed font-dm text-sm transition-all
              ${compressing ? 'border-[#4ADE80]/40 text-[#4ADE80] animate-pulse' : 'border-[#2D2840] text-[#9B97A8] hover:border-[#4ADE80]/60 hover:text-white'}`}>
            {compressing ? '⏳ Comprimiendo...' : '📷 Seleccionar JPG / PNG'}
          </button>
          <p className="mt-1 font-dm text-xs text-[#9B97A8]">Se comprime a ≤{MAX_PX}px y se guarda como base64.</p>
        </div>
      )}

      {value && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#211D2A] border border-[#2D2840]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-[#2D2840]"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="flex-1 min-w-0">
            <p className="font-dm text-xs text-[#9B97A8] truncate">{isBase64 ? `Base64 · ${Math.round(value.length / 1000)}k chars` : value}</p>
            <button type="button" onClick={() => { onChange(''); setWarn(''); }} className="mt-1 font-dm text-xs text-red-400/70 hover:text-red-400">✕ Quitar</button>
          </div>
        </div>
      )}
      {warn && <p className={`font-dm text-xs px-3 py-2 rounded-lg ${warn.startsWith('⚠') ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>{warn}</p>}
    </div>
  );
}

// ─── Fetch ítems del Sheet (client‑side via gviz) ──────────────────────────────
async function fetchSheetItems(): Promise<FormState[]> {
  if (!SHEET_ID) return [];
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=carta`;
  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(
    text.replace(/^.*?google\.visualization\.Query\.setResponse\(/, '').replace(/\);?\s*$/, '')
  );
  const rows: Array<{ c: Array<{ v: unknown } | null> }> = json?.table?.rows ?? [];
  const cols: Array<{ label: string }> = json?.table?.cols ?? [];

  const idx: Record<string, number> = {};
  cols.forEach((c, i) => { idx[c.label.toLowerCase().trim()] = i; });

  const cell = (row: typeof rows[0], key: string): string => {
    const i = idx[key]; if (i === undefined) return '';
    const c = row.c[i]; if (!c || c.v == null) return '';
    return String(c.v).trim();
  };

  return rows
    .filter((r) => cell(r, 'nombre'))
    .map((r) => ({
      id: cell(r, 'id'),
      categoria: cell(r, 'categoria'),
      subcategoria: cell(r, 'subcategoria'),
      nombre: cell(r, 'nombre'),
      descripcion: cell(r, 'descripcion'),
      precio: cell(r, 'precio'),
      precio_alternativo: cell(r, 'precio_alternativo'),
      imagen_url: cell(r, 'imagen_url'),
      activo: cell(r, 'activo').toUpperCase() !== 'FALSE',
      orden: cell(r, 'orden'),
    }));
}

// ─── Campos reutilizables del formulario ─────────────────────────────────────
function FormFields({
  form, set, idPrefix,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string | boolean) => void;
  idPrefix: string;
}) {
  const ic = 'w-full px-3 py-2.5 rounded-lg bg-[#211D2A] border border-[#2D2840] text-white font-dm text-sm placeholder-[#9B97A8] focus:outline-none focus:border-[#4ADE80] transition-colors';
  const lc = 'block font-dm text-sm text-[#9B97A8] mb-1.5';

  return (
    <div className="space-y-4">
      {/* Categoría */}
      <div>
        <label className={lc}>Categoría *</label>
        <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)} required className={ic}>
          <option value="">Seleccioná...</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          <option value="__otra__">Otra (escribir abajo)</option>
        </select>
      </div>
      {form.categoria === '__otra__' && (
        <div>
          <label className={lc}>Nueva categoría</label>
          <input type="text" placeholder="Ej: POSTRES" className={ic} onChange={(e) => set('categoria', e.target.value)} />
        </div>
      )}

      {/* Subcategoría */}
      <div>
        <label className={lc}>Subcategoría</label>
        <input type="text" value={form.subcategoria} onChange={(e) => set('subcategoria', e.target.value)}
          placeholder="Ej: TRADICIONAL (opcional)" className={ic} />
      </div>

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
          placeholder="Ingredientes o variantes..." rows={2} className={`${ic} resize-none`} />
      </div>

      {/* Precios */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lc}>Precio (ARS)</label>
          <input type="number" value={form.precio} onChange={(e) => set('precio', e.target.value)}
            placeholder="0" min={0} step={100} className={ic} />
        </div>
        <div>
          <label className={lc}>Precio alt.</label>
          <input type="text" value={form.precio_alternativo} onChange={(e) => set('precio_alternativo', e.target.value)}
            placeholder="Para 2: $20.000" className={ic} />
        </div>
      </div>

      {/* Imagen */}
      <div>
        <label className={lc}>Imagen</label>
        <ImageField value={form.imagen_url} onChange={(v) => set('imagen_url', v)} />
      </div>

      {/* Activo */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id={`${idPrefix}-activo`} checked={form.activo}
          onChange={(e) => set('activo', e.target.checked)} className="w-4 h-4 accent-[#4ADE80] rounded" />
        <label htmlFor={`${idPrefix}-activo`} className="font-dm text-sm text-[#9B97A8] cursor-pointer">
          Visible en la carta
        </label>
      </div>
    </div>
  );
}

// ─── Sección EDITAR ÍTEM EXISTENTE ────────────────────────────────────────────
function EditSection() {
  const [search, setSearch] = useState('');
  const [allItems, setAllItems] = useState<FormState[]>([]);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [selected, setSelected] = useState<FormState | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  async function loadItems() {
    if (loadState !== 'idle') return;
    setLoadState('loading');
    try {
      const items = await fetchSheetItems();
      setAllItems(items);
      setLoadState('done');
    } catch {
      setLoadState('error');
    }
  }

  const filtered = search.length >= 2
    ? allItems.filter((i) => i.nombre.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  function selectItem(item: FormState) {
    setSelected(item);
    setEditForm({ ...item });
    setSaveStatus('idle');
    setSaveError('');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function setField(k: keyof FormState, v: string | boolean) {
    setEditForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm.nombre || !editForm.categoria) return;
    setSaveStatus('loading');
    setSaveError('');

    const res = await fetch('/api/admin/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, precio: parseFloat(editForm.precio) || 0 }),
    });

    if (res.ok) {
      setSaveStatus('ok');
      // Actualizar la copia local para que la búsqueda refleje el cambio
      setAllItems((prev) =>
        prev.map((i) => {
          const matchById = editForm.id && i.id === editForm.id;
          const matchByName = !editForm.id && i.nombre === selected?.nombre;
          return (matchById || matchByName) ? { ...editForm } : i;
        })
      );
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      const data = await res.json();
      setSaveError(data.error ?? 'Error al guardar');
      setSaveStatus('error');
    }
  }

  return (
    <div className="border-t border-[#2D2840]">
      {/* Header de la sección */}
      <div className="px-6 py-4 border-b border-[#2D2840]">
        <h2 className="font-bebas text-xl text-white tracking-widest">EDITAR ÍTEM EXISTENTE</h2>
        <p className="font-dm text-[#9B97A8] text-xs mt-0.5">Buscá por nombre y editá los datos</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Buscador */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B97A8] text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            value={search}
            onFocus={loadItems}
            onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
            placeholder="Escribí el nombre del plato..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#211D2A] border border-[#2D2840] text-white font-dm text-sm placeholder-[#9B97A8] focus:outline-none focus:border-[#4ADE80] transition-colors"
          />
        </div>

        {/* Estados de carga */}
        {loadState === 'loading' && (
          <p className="font-dm text-xs text-[#9B97A8] animate-pulse px-1">Cargando ítems del Sheet...</p>
        )}
        {loadState === 'error' && (
          <p className="font-dm text-xs text-red-400 px-1">Error al cargar. Verificá la conexión al Sheet.</p>
        )}

        {/* Resultados de búsqueda */}
        {filtered.length > 0 && !selected && (
          <div className="rounded-xl border border-[#2D2840] overflow-hidden">
            {filtered.map((item, i) => (
              <button
                key={`${item.id || item.nombre}-${i}`}
                type="button"
                onClick={() => selectItem(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#2D2840]/60 transition-colors
                  ${i > 0 ? 'border-t border-[#2D2840]' : ''}`}
              >
                {/* Mini imagen */}
                {item.imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imagen_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0 bg-[#2D2840]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-8 h-8 rounded bg-[#2D2840] flex items-center justify-center flex-shrink-0">
                    <span className="font-bebas text-[#4ADE80] text-xs">{item.nombre[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-dm font-semibold text-white text-sm truncate">{item.nombre}</p>
                  <p className="font-dm text-[#9B97A8] text-xs truncate">
                    {item.categoria}{item.subcategoria ? ` › ${item.subcategoria}` : ''}
                    {item.precio ? ` · $${parseFloat(item.precio).toLocaleString('es-AR')}` : ''}
                  </p>
                </div>
                <span className="text-[#4ADE80] text-xs font-dm flex-shrink-0">✎ editar</span>
              </button>
            ))}
          </div>
        )}

        {search.length >= 2 && filtered.length === 0 && loadState === 'done' && !selected && (
          <p className="font-dm text-xs text-[#9B97A8] px-1">Sin resultados para "{search}"</p>
        )}

        {/* Formulario de edición */}
        {selected && (
          <div ref={formRef} className="rounded-xl border border-[#4ADE80]/30 bg-[#1A1721] overflow-hidden">
            {/* Encabezado del formulario */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#4ADE80]/5 border-b border-[#4ADE80]/20">
              <div>
                <p className="font-bebas text-sm text-[#4ADE80] tracking-widest">EDITANDO</p>
                <p className="font-dm text-white text-sm font-semibold">{selected.nombre}</p>
              </div>
              <button
                type="button"
                onClick={() => { setSelected(null); setSearch(''); setSaveStatus('idle'); }}
                className="font-dm text-xs text-[#9B97A8] hover:text-white transition-colors px-2 py-1"
              >
                ✕ Cancelar
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <FormFields form={editForm} set={setField} idPrefix="edit" />

              {saveStatus === 'ok' && (
                <div className="px-4 py-3 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30">
                  <p className="font-dm text-sm text-[#4ADE80]">✓ Cambios guardados correctamente</p>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="font-dm text-sm text-red-400">{saveError}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saveStatus === 'loading' || !editForm.nombre || !editForm.categoria}
                  className="flex-1 py-2.5 rounded-lg bg-[#4ADE80] text-black font-dm font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-40"
                >
                  {saveStatus === 'loading' ? 'Guardando...' : '✓ Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setSearch(''); setSaveStatus('idle'); }}
                  className="px-4 py-2.5 rounded-lg border border-[#2D2840] text-[#9B97A8] font-dm text-sm hover:text-white hover:border-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const router = useRouter();
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM);
  const [addStatus, setAddStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [addError, setAddError] = useState('');
  const [activeTab, setActiveTab] = useState<'sheet' | 'agregar' | 'editar'>('sheet');

  function setAddField(k: keyof FormState, v: string | boolean) {
    setAddForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.nombre || !addForm.categoria) return;
    setAddStatus('loading');
    setAddError('');

    const res = await fetch('/api/admin/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, precio: parseFloat(addForm.precio) || 0, action: 'add' }),
    });

    if (res.ok) {
      setAddStatus('ok');
      setAddForm(EMPTY_FORM);
      setTimeout(() => setAddStatus('idle'), 3000);
    } else {
      const data = await res.json();
      setAddError(data.error ?? 'Error al guardar');
      setAddStatus('error');
    }
  }

  const sheetEmbedUrl = SHEET_ID
    ? `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?rm=minimal&usp=sharing`
    : null;
  const sheetPublicUrl = SHEET_ID
    ? `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`
    : null;

  const TABS = [
    { id: 'sheet' as const, label: 'VER CARTA' },
    { id: 'agregar' as const, label: 'AGREGAR' },
    { id: 'editar' as const, label: 'EDITAR' },
  ];

  return (
    <div className="min-h-screen bg-[#0F0D14]">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#13101A] border-b border-[#2D2840]">
        <div className="flex items-center gap-3">
          <span className="font-bebas text-2xl text-white tracking-widest">CUBIC</span>
          <span className="hidden sm:inline font-dm text-[#9B97A8] text-xs tracking-widest">/ ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          {sheetPublicUrl && (
            <a href={sheetPublicUrl} target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#2D2840] font-dm text-xs text-[#9B97A8] hover:text-white hover:border-white transition-colors">
              Abrir Sheet ↗
            </a>
          )}
          <button onClick={handleLogout} className="px-4 py-2 rounded-lg font-dm text-xs text-[#9B97A8] hover:text-red-400 transition-colors">
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Mobile tabs */}
      <div className="flex border-b border-[#2D2840] lg:hidden">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 font-bebas text-sm tracking-widest transition-colors
              ${activeTab === tab.id ? 'text-[#4ADE80] border-b-2 border-[#4ADE80]' : 'text-[#9B97A8]'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop layout */}
      <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 65px)' }}>

        {/* ── Columna izquierda: Sheet + Editar ── */}
        <div className={`flex-1 flex flex-col overflow-y-auto ${activeTab !== 'sheet' && activeTab !== 'editar' ? 'hidden lg:flex' : 'flex'} lg:flex`}>

          {/* iframe */}
          <div className={`flex flex-col ${activeTab === 'editar' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex items-center justify-between px-6 py-3 border-b border-[#2D2840]">
              <h2 className="font-bebas text-xl text-white tracking-widest">GOOGLE SHEET</h2>
              {sheetPublicUrl && (
                <a href={sheetPublicUrl} target="_blank" rel="noopener noreferrer"
                  className="font-dm text-xs text-[#4ADE80] hover:underline">
                  Abrir en nueva pestaña ↗
                </a>
              )}
            </div>
            {sheetEmbedUrl ? (
              <iframe src={sheetEmbedUrl} style={{ height: '55vh', minHeight: '320px' }}
                className="w-full border-0" title="CUBIC Carta"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" />
            ) : (
              <div className="flex items-center justify-center p-12" style={{ height: '55vh' }}>
                <div className="text-center">
                  <p className="font-bebas text-2xl text-[#9B97A8] tracking-widest mb-2">SHEET NO CONFIGURADO</p>
                  <p className="font-dm text-sm text-[#9B97A8]">
                    Agregá <code className="text-[#4ADE80]">NEXT_PUBLIC_SHEET_ID</code> en las variables de entorno.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sección editar (debajo del iframe) */}
          <div className={activeTab === 'sheet' ? 'hidden lg:block' : 'block'}>
            <EditSection />
          </div>
        </div>

        {/* Divider vertical */}
        <div className="hidden lg:block w-px bg-[#2D2840] flex-shrink-0" />

        {/* ── Columna derecha: Agregar ítem ── */}
        <div className={`w-full lg:w-[420px] flex-shrink-0 flex flex-col overflow-y-auto ${activeTab !== 'agregar' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="px-6 py-4 border-b border-[#2D2840]">
            <h2 className="font-bebas text-xl text-white tracking-widest">AGREGAR ÍTEM</h2>
            <p className="font-dm text-[#9B97A8] text-xs mt-0.5">Se agrega al final del Sheet</p>
          </div>

          <form onSubmit={handleAdd} className="flex-1 p-6 space-y-4">
            <FormFields form={addForm} set={setAddField} idPrefix="add" />

            {addStatus === 'ok' && (
              <div className="px-4 py-3 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30">
                <p className="font-dm text-sm text-[#4ADE80]">✓ Ítem agregado correctamente</p>
              </div>
            )}
            {addStatus === 'error' && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="font-dm text-sm text-red-400">{addError}</p>
              </div>
            )}

            <button type="submit" disabled={addStatus === 'loading' || !addForm.nombre || !addForm.categoria}
              className="w-full py-3 rounded-lg bg-[#4ADE80] text-black font-dm font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-40">
              {addStatus === 'loading' ? 'Guardando...' : '+ Agregar ítem'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
