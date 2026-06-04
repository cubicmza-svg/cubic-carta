'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID ?? '';

const CATEGORIAS = [
  'BRUNCH', 'PROMOS', 'CAFETERIA E INFUSIONES', 'PARA ACOMPAÑAR',
  'GLUTEN FREE', 'PARA COMER', 'BEBIDAS SIN ALCOHOL', 'BEBIDAS CON ALCOHOL',
];

interface FormState {
  categoria: string;
  subcategoria: string;
  nombre: string;
  descripcion: string;
  precio: string;
  precio_alternativo: string;
  imagen_url: string;
  activo: boolean;
}

const EMPTY: FormState = {
  categoria: '', subcategoria: '', nombre: '', descripcion: '',
  precio: '', precio_alternativo: '', imagen_url: '', activo: true,
};

export default function AdminPanel() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'sheet' | 'agregar'>('sheet');

  function set(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre || !form.categoria) return;

    setStatus('loading');
    setErrorMsg('');

    const res = await fetch('/api/admin/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        precio: parseFloat(form.precio) || 0,
      }),
    });

    if (res.ok) {
      setStatus('ok');
      setForm(EMPTY);
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? 'Error al guardar');
      setStatus('error');
    }
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-lg bg-[#211D2A] border border-[#2D2840] text-white font-dm text-sm placeholder-[#9B97A8] focus:outline-none focus:border-[#4ADE80] transition-colors';
  const labelClass = 'block font-dm text-sm text-[#9B97A8] mb-1.5';

  const sheetEmbedUrl = SHEET_ID
    ? `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?rm=minimal&usp=sharing`
    : null;

  const sheetPublicUrl = SHEET_ID
    ? `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`
    : null;

  return (
    <div className="min-h-screen bg-[#0F0D14]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#13101A] border-b border-[#2D2840]">
        <div className="flex items-center gap-3">
          <span className="font-bebas text-2xl text-white tracking-widest">CUBIC</span>
          <span className="hidden sm:inline font-dm text-[#9B97A8] text-xs tracking-widest">/ ADMIN</span>
        </div>

        <div className="flex items-center gap-3">
          {sheetPublicUrl && (
            <a
              href={sheetPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#2D2840] font-dm text-xs text-[#9B97A8] hover:text-white hover:border-white transition-colors"
            >
              Abrir Sheet ↗
            </a>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-dm text-xs text-[#9B97A8] hover:text-red-400 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Tabs (mobile) */}
      <div className="flex border-b border-[#2D2840] lg:hidden">
        {(['sheet', 'agregar'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 font-bebas text-sm tracking-widest transition-colors
              ${activeTab === tab ? 'text-[#4ADE80] border-b-2 border-[#4ADE80]' : 'text-[#9B97A8]'}`}
          >
            {tab === 'sheet' ? 'VER CARTA' : 'AGREGAR ÍTEM'}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">

        {/* Sheet iframe — col izquierda en desktop, tab en mobile */}
        <div className={`flex-1 flex flex-col min-h-0 ${activeTab !== 'sheet' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between px-6 py-3 border-b border-[#2D2840]">
            <h2 className="font-bebas text-xl text-white tracking-widest">GOOGLE SHEET</h2>
            {sheetPublicUrl && (
              <a
                href={sheetPublicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-dm text-xs text-[#4ADE80] hover:underline"
              >
                Abrir en nueva pestaña ↗
              </a>
            )}
          </div>

          {sheetEmbedUrl ? (
            <iframe
              src={sheetEmbedUrl}
              className="flex-1 w-full border-0"
              title="CUBIC Carta — Google Sheets"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <p className="font-bebas text-2xl text-[#9B97A8] tracking-widest mb-2">SHEET NO CONFIGURADO</p>
                <p className="font-dm text-sm text-[#9B97A8]">
                  Agregá <code className="text-[#4ADE80]">NEXT_PUBLIC_SHEET_ID</code> en las variables de entorno.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Divider vertical */}
        <div className="hidden lg:block w-px bg-[#2D2840]" />

        {/* Formulario — col derecha en desktop, tab en mobile */}
        <div className={`w-full lg:w-[420px] flex flex-col overflow-y-auto ${activeTab !== 'agregar' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="px-6 py-4 border-b border-[#2D2840]">
            <h2 className="font-bebas text-xl text-white tracking-widest">AGREGAR ÍTEM</h2>
            <p className="font-dm text-[#9B97A8] text-xs mt-0.5">Se agrega al final del Sheet</p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-4">
            {/* Categoría */}
            <div>
              <label className={labelClass}>Categoría *</label>
              <select
                value={form.categoria}
                onChange={(e) => set('categoria', e.target.value)}
                required
                className={inputClass}
              >
                <option value="">Seleccioná...</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="__otra__">Otra (escribir abajo)</option>
              </select>
            </div>

            {form.categoria === '__otra__' && (
              <div>
                <label className={labelClass}>Nueva categoría</label>
                <input
                  type="text"
                  placeholder="Ej: POSTRES"
                  className={inputClass}
                  onChange={(e) => set('categoria', e.target.value)}
                />
              </div>
            )}

            {/* Subcategoría */}
            <div>
              <label className={labelClass}>Subcategoría</label>
              <input
                type="text"
                value={form.subcategoria}
                onChange={(e) => set('subcategoria', e.target.value)}
                placeholder="Ej: TRADICIONAL (opcional)"
                className={inputClass}
              />
            </div>

            {/* Nombre */}
            <div>
              <label className={labelClass}>Nombre *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => set('nombre', e.target.value)}
                placeholder="Ej: Tostón de Campo"
                required
                className={inputClass}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className={labelClass}>Descripción</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => set('descripcion', e.target.value)}
                placeholder="Ingredientes o variantes..."
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Precios */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Precio (ARS)</label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={(e) => set('precio', e.target.value)}
                  placeholder="0"
                  min={0}
                  step={100}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Precio alt.</label>
                <input
                  type="text"
                  value={form.precio_alternativo}
                  onChange={(e) => set('precio_alternativo', e.target.value)}
                  placeholder="Para 2: $20.000"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Imagen URL */}
            <div>
              <label className={labelClass}>URL de imagen</label>
              <input
                type="url"
                value={form.imagen_url}
                onChange={(e) => set('imagen_url', e.target.value)}
                placeholder="https://drive.google.com/uc?export=view&id=..."
                className={inputClass}
              />
              <p className="mt-1 font-dm text-xs text-[#9B97A8]">
                Drive: compartir foto → obtener enlace → convertir a <code className="text-[#4ADE80]">uc?export=view&id=ID</code>
              </p>
            </div>

            {/* Activo */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="activo"
                checked={form.activo}
                onChange={(e) => set('activo', e.target.checked)}
                className="w-4 h-4 accent-[#4ADE80] rounded"
              />
              <label htmlFor="activo" className="font-dm text-sm text-[#9B97A8] cursor-pointer">
                Visible en la carta
              </label>
            </div>

            {/* Feedback */}
            {status === 'ok' && (
              <div className="px-4 py-3 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/30">
                <p className="font-dm text-sm text-[#4ADE80]">✓ Ítem agregado correctamente</p>
              </div>
            )}
            {status === 'error' && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="font-dm text-sm text-red-400">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !form.nombre || !form.categoria}
              className="w-full py-3 rounded-lg bg-[#4ADE80] text-black font-dm font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-40"
            >
              {status === 'loading' ? 'Guardando...' : '+ Agregar ítem'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
