'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// ─── Constantes ───────────────────────────────────────────────────────────────
const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID ?? '';

const CATEGORIAS = [
  'BRUNCH', 'PROMOS', 'CAFETERIA E INFUSIONES', 'PARA ACOMPAÑAR',
  'GLUTEN FREE', 'PARA COMER', 'BEBIDAS SIN ALCOHOL', 'BEBIDAS CON ALCOHOL',
];

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface ItemData {
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

const EMPTY: ItemData = {
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

// ─── Campo de imagen ──────────────────────────────────────────────────────────
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
          <p className="mt-1 font-dm text-xs text-[#9B97A8]">
            Drive: compartir → obtener enlace → <code className="text-[#4ADE80]">uc?export=view&id=FILE_ID</code>
          </p>
        </div>
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={compressing}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed font-dm text-sm transition-all
              ${compressing ? 'border-[#4ADE80]/40 text-[#4ADE80] animate-pulse' : 'border-[#2D2840] text-[#9B97A8] hover:border-[#4ADE80]/60 hover:text-white'}`}>
            {compressing ? '⏳ Comprimiendo...' : '📷 Seleccionar JPG / PNG'}
          </button>
          <p className="mt-1 font-dm text-xs text-[#9B97A8]">Se comprime a ≤{MAX_PX}px y se guarda en el Sheet.</p>
        </div>
      )}

      {value && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[#211D2A] border border-[#2D2840]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-[#2D2840]"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div className="flex-1 min-w-0">
            <p className="font-dm text-xs text-[#9B97A8] truncate">
              {isBase64 ? `Base64 · ${Math.round(value.length / 1000)}k chars` : value}
            </p>
            <button type="button" onClick={() => { onChange(''); setWarn(''); }}
              className="mt-1 font-dm text-xs text-red-400/70 hover:text-red-400">✕ Quitar</button>
          </div>
        </div>
      )}
      {warn && (
        <p className={`font-dm text-xs px-3 py-2 rounded-lg ${warn.startsWith('⚠')
          ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
          : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>{warn}</p>
      )}
    </div>
  );
}

// ─── Campos del formulario (reutilizados en agregar y editar) ─────────────────
function FormFields({ form, set, idPrefix }: {
  form: ItemData;
  set: (k: keyof ItemData, v: string | boolean) => void;
  idPrefix: string;
}) {
  const ic = 'w-full px-3 py-2.5 rounded-lg bg-[#211D2A] border border-[#2D2840] text-white font-dm text-sm placeholder-[#9B97A8] focus:outline-none focus:border-[#4ADE80] transition-colors';
  const lc = 'block font-dm text-sm text-[#9B97A8] mb-1.5';
  return (
    <div className="space-y-4">
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
      <div>
        <label className={lc}>Subcategoría</label>
        <input type="text" value={form.subcategoria} onChange={(e) => set('subcategoria', e.target.value)}
          placeholder="Ej: TRADICIONAL (opcional)" className={ic} />
      </div>
      <div>
        <label className={lc}>Nombre *</label>
        <input type="text" value={form.nombre} onChange={(e) => set('nombre', e.target.value)}
          placeholder="Ej: Tostón de Campo" required className={ic} />
      </div>
      <div>
        <label className={lc}>Descripción</label>
        <textarea value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)}
          placeholder="Ingredientes o variantes..." rows={2} className={`${ic} resize-none`} />
      </div>
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
      <div>
        <label className={lc}>Imagen</label>
        <ImageField value={form.imagen_url} onChange={(v) => set('imagen_url', v)} />
      </div>
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

// ─── Fetch ítems del Sheet (API pública gviz/tq) ──────────────────────────────
async function fetchSheetItems(): Promise<ItemData[]> {
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

// ─── Tabla de ítems para editar ───────────────────────────────────────────────
function ItemsTable({ items, loading, onEdit }: {
  items: ItemData[];
  loading: boolean;
  onEdit: (item: ItemData) => void;
}) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <p className="font-bebas text-xl text-[#9B97A8] tracking-widest animate-pulse">CARGANDO ÍTEMS...</p>
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="flex-1 flex items-center justify-center py-16">
        <p className="font-dm text-sm text-[#9B97A8]">No se encontraron ítems en el Sheet.</p>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-[#13101A]">
          <tr>
            {['', 'Nombre', 'Categoría', 'Precio', ''].map((h, i) => (
              <th key={i} className="px-3 py-3 font-bebas text-xs text-[#9B97A8] tracking-widest border-b border-[#2D2840]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={`${item.id || item.nombre}-${i}`}
              className="border-b border-[#2D2840]/50 hover:bg-[#2D2840]/30 transition-colors">
              {/* Imagen */}
              <td className="px-3 py-2.5 w-10">
                {item.imagen_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imagen_url} alt="" className="w-9 h-9 rounded object-cover bg-[#2D2840]"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-9 h-9 rounded bg-[#2D2840] flex items-center justify-center">
                    <span className="font-bebas text-[#4ADE80] text-sm">{item.nombre[0]}</span>
                  </div>
                )}
              </td>
              {/* Nombre + subcategoría */}
              <td className="px-3 py-2.5 max-w-[140px]">
                <p className="font-dm font-semibold text-white text-sm truncate">{item.nombre}</p>
                {item.subcategoria && (
                  <p className="font-dm text-[#9B97A8] text-xs truncate">{item.subcategoria}</p>
                )}
              </td>
              {/* Categoría */}
              <td className="px-3 py-2.5 hidden sm:table-cell max-w-[120px]">
                <p className="font-dm text-[#9B97A8] text-xs truncate">{item.categoria}</p>
              </td>
              {/* Precio */}
              <td className="px-3 py-2.5 whitespace-nowrap">
                <span className="font-bebas text-[#4ADE80] text-base">
                  {item.precio ? `$${parseFloat(item.precio).toLocaleString('es-AR')}` : '—'}
                </span>
              </td>
              {/* Botón editar */}
              <td className="px-3 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="px-3 py-1.5 rounded-lg border border-[#2D2840] font-dm text-xs text-[#9B97A8] hover:border-[#4ADE80] hover:text-[#4ADE80] transition-all whitespace-nowrap"
                >
                  ✎ Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
type RightMode = 'agregar' | 'editar-lista' | 'editar-form';

export default function AdminPanel() {
  const router = useRouter();

  // ── Modo del panel derecho
  const [rightMode, setRightMode] = useState<RightMode>('agregar');

  // ── Formulario de agregar
  const [addForm, setAddForm] = useState<ItemData>(EMPTY);
  const [addStatus, setAddStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [addError, setAddError] = useState('');

  // ── Lista de ítems para editar
  const [items, setItems] = useState<ItemData[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsLoaded, setItemsLoaded] = useState(false);

  // ── Formulario de edición
  const [editForm, setEditForm] = useState<ItemData>(EMPTY);
  const [editStatus, setEditStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [editError, setEditError] = useState('');

  // ── Tab activo en mobile
  const [mobileTab, setMobileTab] = useState<'sheet' | 'right'>('sheet');

  // Sheets
  const sheetEmbedUrl = SHEET_ID ? `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?rm=minimal&usp=sharing` : null;
  const sheetPublicUrl = SHEET_ID ? `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit` : null;

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  // ── Abrir lista de ítems
  async function openEditList() {
    setRightMode('editar-lista');
    setMobileTab('right');
    if (!itemsLoaded) {
      setItemsLoading(true);
      try {
        const fetched = await fetchSheetItems();
        setItems(fetched);
        setItemsLoaded(true);
      } finally {
        setItemsLoading(false);
      }
    }
  }

  // ── Seleccionar ítem para editar
  function startEdit(item: ItemData) {
    setEditForm({ ...item });
    setEditStatus('idle');
    setEditError('');
    setRightMode('editar-form');
  }

  // ── Guardar ítem nuevo
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddStatus('loading'); setAddError('');
    const res = await fetch('/api/admin/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, precio: parseFloat(addForm.precio) || 0 }),
    });
    if (res.ok) {
      setAddStatus('ok'); setAddForm(EMPTY);
      setItemsLoaded(false); // invalidar caché de la lista
      setTimeout(() => setAddStatus('idle'), 3000);
    } else {
      const d = await res.json(); setAddError(d.error ?? 'Error al guardar'); setAddStatus('error');
    }
  }

  // ── Guardar edición
  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    setEditStatus('loading'); setEditError('');
    const res = await fetch('/api/admin/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, precio: parseFloat(editForm.precio) || 0 }),
    });
    if (res.ok) {
      setEditStatus('ok');
      // Actualizar fila en la lista local
      setItems((prev) => prev.map((it) =>
        (editForm.id && it.id === editForm.id) || (!editForm.id && it.nombre === editForm.nombre)
          ? { ...editForm } : it
      ));
      setTimeout(() => { setEditStatus('idle'); setRightMode('editar-lista'); }, 1800);
    } else {
      const d = await res.json(); setEditError(d.error ?? 'Error al guardar'); setEditStatus('error');
    }
  }

  // ── Título del panel derecho
  const rightTitle =
    rightMode === 'agregar' ? 'AGREGAR ÍTEM' :
    rightMode === 'editar-lista' ? 'EDITAR ÍTEMS' :
    `EDITANDO: ${editForm.nombre || '—'}`;

  // ── Subtítulo
  const rightSub =
    rightMode === 'agregar' ? 'Se agrega al final del Sheet' :
    rightMode === 'editar-lista' ? `${items.length} ítems en el Sheet` :
    editForm.categoria;

  return (
    <div className="min-h-screen bg-[#0F0D14]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#13101A] border-b border-[#2D2840]">
        <div className="flex items-center gap-3">
          <span className="font-bebas text-2xl text-white tracking-widest">CUBIC</span>
          <span className="hidden sm:inline font-dm text-[#9B97A8] text-xs tracking-widest">/ ADMIN</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Botones principales */}
          <button
            onClick={() => { setRightMode('agregar'); setMobileTab('right'); }}
            className={`px-4 py-2 rounded-lg font-dm text-xs font-semibold transition-all ${
              rightMode === 'agregar'
                ? 'bg-[#4ADE80] text-black'
                : 'border border-[#2D2840] text-[#9B97A8] hover:border-[#4ADE80] hover:text-[#4ADE80]'
            }`}
          >
            + AGREGAR ÍTEM
          </button>
          <button
            onClick={openEditList}
            className={`px-4 py-2 rounded-lg font-dm text-xs font-semibold transition-all ${
              rightMode !== 'agregar'
                ? 'bg-[#4ADE80] text-black'
                : 'border border-[#2D2840] text-[#9B97A8] hover:border-[#4ADE80] hover:text-[#4ADE80]'
            }`}
          >
            ✎ EDITAR ÍTEMS
          </button>
          {/* Sheet link */}
          {sheetPublicUrl && (
            <a href={sheetPublicUrl} target="_blank" rel="noopener noreferrer"
              className="hidden md:inline-flex px-3 py-2 rounded-lg border border-[#2D2840] font-dm text-xs text-[#9B97A8] hover:text-white hover:border-white transition-colors">
              Sheet ↗
            </a>
          )}
          <button onClick={handleLogout}
            className="px-3 py-2 rounded-lg font-dm text-xs text-[#9B97A8] hover:text-red-400 transition-colors">
            Salir
          </button>
        </div>
      </header>

      {/* ── Mobile tabs ────────────────────────────────────────────────────── */}
      <div className="flex border-b border-[#2D2840] lg:hidden">
        {[{ id: 'sheet', label: 'SHEET' }, { id: 'right', label: rightMode === 'agregar' ? 'AGREGAR' : rightMode === 'editar-lista' ? 'EDITAR' : 'EDITANDO' }].map((t) => (
          <button key={t.id} onClick={() => setMobileTab(t.id as 'sheet' | 'right')}
            className={`flex-1 py-3 font-bebas text-sm tracking-widest transition-colors
              ${mobileTab === t.id ? 'text-[#4ADE80] border-b-2 border-[#4ADE80]' : 'text-[#9B97A8]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Layout principal ────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row" style={{ minHeight: 'calc(100vh - 65px)' }}>

        {/* ── Columna izquierda: Sheet iframe ──────────────────────────────── */}
        <div className={`flex-1 flex flex-col min-h-0 ${mobileTab !== 'sheet' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#2D2840]">
            <h2 className="font-bebas text-xl text-white tracking-widest">GOOGLE SHEET</h2>
            {sheetPublicUrl && (
              <a href={sheetPublicUrl} target="_blank" rel="noopener noreferrer"
                className="font-dm text-xs text-[#4ADE80] hover:underline">Abrir en nueva pestaña ↗</a>
            )}
          </div>
          {sheetEmbedUrl ? (
            <iframe src={sheetEmbedUrl} className="flex-1 w-full border-0" title="CUBIC Carta"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center">
              <div>
                <p className="font-bebas text-2xl text-[#9B97A8] tracking-widest mb-2">SHEET NO CONFIGURADO</p>
                <p className="font-dm text-sm text-[#9B97A8]">
                  Agregá <code className="text-[#4ADE80]">NEXT_PUBLIC_SHEET_ID</code> en variables de entorno.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-[#2D2840] flex-shrink-0" />

        {/* ── Columna derecha ───────────────────────────────────────────────── */}
        <div className={`w-full lg:w-[440px] flex-shrink-0 flex flex-col overflow-hidden ${mobileTab !== 'right' ? 'hidden lg:flex' : 'flex'}`}>

          {/* Header columna derecha */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2840] flex-shrink-0">
            <div>
              <h2 className="font-bebas text-xl text-white tracking-widest">{rightTitle}</h2>
              {rightSub && <p className="font-dm text-[#9B97A8] text-xs mt-0.5">{rightSub}</p>}
            </div>
            {/* Botón volver cuando estamos editando un ítem */}
            {rightMode === 'editar-form' && (
              <button onClick={() => setRightMode('editar-lista')}
                className="font-dm text-xs text-[#9B97A8] hover:text-white transition-colors flex items-center gap-1">
                ← Lista
              </button>
            )}
          </div>

          {/* ── MODO: AGREGAR ÍTEM ────────────────────────────────────────── */}
          {rightMode === 'agregar' && (
            <form onSubmit={handleAdd} className="flex-1 overflow-y-auto p-6 space-y-4">
              <FormFields form={addForm} set={(k, v) => setAddForm((p) => ({ ...p, [k]: v }))} idPrefix="add" />
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
          )}

          {/* ── MODO: LISTA DE ÍTEMS ─────────────────────────────────────── */}
          {rightMode === 'editar-lista' && (
            <ItemsTable items={items} loading={itemsLoading} onEdit={startEdit} />
          )}

          {/* ── MODO: FORMULARIO DE EDICIÓN ──────────────────────────────── */}
          {rightMode === 'editar-form' && (
            <form onSubmit={handleEditSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <FormFields form={editForm} set={(k, v) => setEditForm((p) => ({ ...p, [k]: v }))} idPrefix="edit" />
              {editStatus === 'ok' && (
                <div className="px-4 py-3 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30">
                  <p className="font-dm text-sm text-[#4ADE80]">✓ Cambios guardados — volviendo a la lista...</p>
                </div>
              )}
              {editStatus === 'error' && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="font-dm text-sm text-red-400">{editError}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={editStatus === 'loading' || !editForm.nombre || !editForm.categoria}
                  className="flex-1 py-3 rounded-lg bg-[#4ADE80] text-black font-dm font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-40">
                  {editStatus === 'loading' ? 'Guardando...' : '✓ Guardar cambios'}
                </button>
                <button type="button" onClick={() => setRightMode('editar-lista')}
                  className="px-5 py-3 rounded-lg border border-[#2D2840] text-[#9B97A8] font-dm text-sm hover:text-white hover:border-white transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
