'use client';

import { useState, useEffect, useCallback } from 'react';

type Status = 'pendiente' | 'en_proceso' | 'entregado';

interface DisenoCard {
  id: number;
  nombre: string;
  descripcion: string;
  status: Status;
  archivo: string;
  archivo_nombre: string;
  archivo_tipo: string;
  creado_el: string;
}

const STATUS_LABEL: Record<Status, string> = {
  pendiente:  'Pendiente',
  en_proceso: 'En proceso',
  entregado:  'Entregado',
};
const STATUS_COLOR: Record<Status, string> = {
  pendiente:  'bg-orange-500/15 text-orange-300 border-orange-500/30',
  en_proceso: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  entregado:  'bg-green-500/15 text-green-300 border-green-500/30',
};

export default function StudioDiseno() {
  const [cards, setCards]       = useState<DisenoCard[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre]     = useState('');
  const [desc, setDesc]         = useState('');
  const [editId, setEditId]     = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [saving, setSaving]     = useState(false);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/studio/diseno');
      if (res.ok) setCards(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const resetForm = () => { setNombre(''); setDesc(''); setEditId(null); setShowForm(false); };

  const saveCard = async () => {
    if (!nombre.trim() || saving) return;
    setSaving(true);
    try {
      if (editId !== null) {
        await fetch(`/api/admin/studio/diseno/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nombre.trim(), descripcion: desc.trim() }),
        });
      } else {
        await fetch('/api/admin/studio/diseno', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: nombre.trim(), descripcion: desc.trim() }),
        });
      }
      await fetchCards();
      resetForm();
    } finally { setSaving(false); }
  };

  const openEdit = (card: DisenoCard) => {
    setNombre(card.nombre);
    setDesc(card.descripcion);
    setEditId(card.id);
    setShowForm(true);
  };

  const deleteCard = async (id: number) => {
    await fetch(`/api/admin/studio/diseno/${id}`, { method: 'DELETE' });
    await fetchCards();
    resetForm();
  };

  const setStatus = async (id: number, status: Status) => {
    await fetch(`/api/admin/studio/diseno/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  const handleFileUpload = (id: number, file: File) => {
    setUploadingId(id);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      await fetch(`/api/admin/studio/diseno/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archivo: dataUrl,
          archivo_nombre: file.name,
          archivo_tipo: file.type,
          status: 'entregado',
        }),
      });
      await fetchCards();
      setUploadingId(null);
    };
    reader.readAsDataURL(file);
  };

  const downloadArchivo = (card: DisenoCard) => {
    if (!card.archivo) return;
    const a = document.createElement('a');
    a.href = card.archivo;
    a.download = card.archivo_nombre || card.nombre;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-bebas text-2xl tracking-widest text-white">PEDIDOS DE DISEÑO</h2>
          {loading && <span className="font-dm text-xs text-cubic-muted">Cargando…</span>}
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-lg bg-cubic-accent text-black hover:bg-green-400 transition-colors">
          + Nuevo pedido
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,8,18,0.88)', backdropFilter: 'blur(6px)' }}
          onClick={resetForm}>
          <div className="bg-cubic-card border border-cubic-border rounded-2xl p-6 w-full max-w-md flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest text-white">
              {editId !== null ? 'Editar pedido' : 'Nuevo pedido de diseño'}
            </h3>
            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus
                placeholder="Ej: Cartel A3 Happy Hour"
                className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Descripción</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
                placeholder="Medidas, colores, texto que debe incluir, formato de entrega…"
                className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted resize-none" />
            </div>
            <div className="flex gap-2 justify-end mt-1">
              {editId !== null && (
                <button onClick={() => deleteCard(editId)}
                  className="font-dm text-sm px-4 py-2 rounded-lg border border-pink-500/30 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 transition-colors mr-auto">
                  Eliminar
                </button>
              )}
              <button onClick={resetForm}
                className="font-dm text-sm px-4 py-2 rounded-lg border border-cubic-border text-cubic-muted hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={saveCard} disabled={saving}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-lg bg-cubic-accent text-black hover:bg-green-400 transition-colors disabled:opacity-50">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      {!loading && cards.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-bebas text-2xl text-cubic-muted tracking-widest">Sin pedidos todavía</p>
          <p className="font-dm text-sm text-cubic-muted mt-2">Creá el primer pedido de diseño.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-cubic-card border border-cubic-border rounded-xl p-5 flex flex-col gap-3 hover:border-cubic-border/80 transition-all">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-dm font-semibold text-white text-sm leading-snug flex-1">{card.nombre}</h3>
                <select value={card.status} onChange={(e) => setStatus(card.id, e.target.value as Status)}
                  className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 outline-none cursor-pointer bg-transparent ${STATUS_COLOR[card.status]}`}>
                  {(Object.entries(STATUS_LABEL) as [Status, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              {card.descripcion && (
                <p className="font-dm text-xs text-cubic-muted leading-relaxed flex-1">{card.descripcion}</p>
              )}

              <div className="border-t border-cubic-border pt-3 flex flex-col gap-2">
                {card.archivo ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-cubic-accent text-base">{card.archivo_tipo?.includes('pdf') ? '📄' : '🖼️'}</span>
                      <span className="font-dm text-xs text-cubic-muted flex-1 truncate">{card.archivo_nombre}</span>
                      <button onClick={() => downloadArchivo(card)}
                        className="font-dm text-xs font-semibold text-cubic-accent hover:text-green-300 transition-colors">
                        ↓ Descargar
                      </button>
                    </div>
                    <label className="flex items-center gap-1 cursor-pointer text-[10px] font-dm text-cubic-muted hover:text-white transition-colors">
                      <input type="file" accept="image/*,.pdf" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(card.id, f); }} />
                      ↻ Reemplazar archivo
                    </label>
                  </>
                ) : (
                  <label className={`flex items-center gap-2 cursor-pointer text-xs font-dm text-cubic-muted hover:text-white transition-colors ${uploadingId === card.id ? 'opacity-50' : ''}`}>
                    <input type="file" accept="image/*,.pdf" className="hidden" disabled={uploadingId === card.id}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(card.id, f); }} />
                    <span className="text-base">📎</span>
                    {uploadingId === card.id ? 'Subiendo…' : 'Subir archivo (imagen o PDF)'}
                  </label>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-dm text-[10px] text-cubic-muted">
                  {new Date(card.creado_el).toLocaleDateString('es-AR')}
                </span>
                <button onClick={() => openEdit(card)}
                  className="font-dm text-[10px] text-cubic-muted hover:text-white transition-colors">
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
