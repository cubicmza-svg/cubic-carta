'use client';

import { useState, useEffect, useCallback } from 'react';

interface Servicio { id: number; nombre: string; precio: number; incluye: string; }
interface ItemExtra { desc: string; precio: number; }
interface Presupuesto {
  id: number; cliente: string; telefono: string; fecha_evento: string;
  tipo_evento: string; servicio_nombre: string;
  cant_chicos: number; cant_adultos: number;
  items: string; total: number; estado: string; notas: string; creado_el: string;
}

const ESTADOS_PRES = ['enviado','visto','aceptado','rechazado'];
const ESTADO_COL: Record<string, string> = {
  enviado: '#9ca3af', visto: '#38bdf8', aceptado: '#4ade80', rechazado: '#f87171',
};

export default function BBPresupuestos() {
  const [presups, setPresups]     = useState<Presupuesto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editId, setEditId]       = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);
  const [extras, setExtras]       = useState<ItemExtra[]>([]);
  const [extraDesc, setExtraDesc] = useState('');
  const [extraPrecio, setExtraPrecio] = useState('');

  const [form, setForm] = useState({
    cliente: '', telefono: '', fecha_evento: '', tipo_evento: 'cumpleaños',
    servicio_id: '', servicio_nombre: '', cant_chicos: '', cant_adultos: '',
    estado: 'enviado', notas: '',
  });
  const [selectedService, setSelectedService] = useState<Servicio | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([fetch('/api/bigbang/presupuestos'), fetch('/api/bigbang/servicios')]);
      if (r1.ok) setPresups(await r1.json());
      if (r2.ok) setServicios(await r2.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const reset = () => {
    setForm({ cliente: '', telefono: '', fecha_evento: '', tipo_evento: 'cumpleaños', servicio_id: '', servicio_nombre: '', cant_chicos: '', cant_adultos: '', estado: 'enviado', notas: '' });
    setExtras([]); setExtraDesc(''); setExtraPrecio('');
    setSelectedService(null); setEditId(null); setShowForm(false);
  };

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const baseTotal = selectedService ? selectedService.precio : 0;
  const extrasTotal = extras.reduce((a, e) => a + e.precio, 0);
  const total = baseTotal + extrasTotal;

  const addExtra = () => {
    if (!extraDesc.trim()) return;
    setExtras(prev => [...prev, { desc: extraDesc.trim(), precio: parseInt(extraPrecio) || 0 }]);
    setExtraDesc(''); setExtraPrecio('');
  };

  const save = async () => {
    if (!form.cliente.trim() || saving) return;
    setSaving(true);
    try {
      const body = {
        ...form,
        servicio_id: selectedService?.id || null,
        servicio_nombre: selectedService?.nombre || form.servicio_nombre,
        cant_chicos: parseInt(form.cant_chicos) || 0,
        cant_adultos: parseInt(form.cant_adultos) || 0,
        items: JSON.stringify(extras),
        total,
        fecha_evento: form.fecha_evento || null,
      };
      if (editId) await fetch(`/api/bigbang/presupuestos/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      else await fetch('/api/bigbang/presupuestos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      await fetch_(); reset();
    } finally { setSaving(false); }
  };

  const del = async (id: number) => {
    await fetch(`/api/bigbang/presupuestos/${id}`, { method: 'DELETE' });
    await fetch_(); reset();
  };

  const updateEstado = async (id: number, estado: string) => {
    await fetch(`/api/bigbang/presupuestos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }) });
    setPresups(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  };

  const whatsappText = (p: Presupuesto) => {
    const items: ItemExtra[] = JSON.parse(p.items || '[]');
    const lines = [
      `🎉 *Presupuesto Big Bang - ${p.tipo_evento}*`,
      `Cliente: ${p.cliente}`,
      p.fecha_evento ? `Fecha: ${new Date(p.fecha_evento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}` : '',
      p.servicio_nombre ? `Paquete: ${p.servicio_nombre}` : '',
      p.cant_chicos ? `Chicos: ${p.cant_chicos} | Adultos: ${p.cant_adultos}` : '',
      items.length > 0 ? '\n*Adicionales:*\n' + items.map(i => `  • ${i.desc}: $${i.precio.toLocaleString('es-AR')}`).join('\n') : '',
      `\n*Total: $${p.total.toLocaleString('es-AR')}*`,
      p.notas ? `\nNotas: ${p.notas}` : '',
    ].filter(Boolean).join('\n');
    return encodeURIComponent(lines);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800">📋 PRESUPUESTOS</h2>
        <button onClick={() => { reset(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-lg text-black"
          style={{ background: '#f97316' }}>
          + Nuevo presupuesto
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(2,8,24,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={reset}>
          <div className="w-full max-w-xl rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto max-h-[92vh]"
            style={{ background: '#0d1a30', border: '1px solid rgba(249,115,22,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest text-gray-800">Nuevo presupuesto</h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Cliente', key: 'cliente', span: 2, ph: 'Nombre del cliente' },
                { label: 'Teléfono', key: 'telefono', ph: '261 000 0000' },
                { label: 'Tipo de evento', key: 'tipo_evento', ph: 'cumpleaños' },
                { label: 'Fecha (opcional)', key: 'fecha_evento', type: 'date', span: 2 },
              ].map(f => (
                <div key={f.key} className={`flex flex-col gap-1 ${f.span === 2 ? 'col-span-2' : ''}`}>
                  <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">{f.label}</label>
                  <input type={f.type || 'text'} value={(form as Record<string,unknown>)[f.key] as string}
                    onChange={e => set(f.key, e.target.value)} placeholder={f.ph} autoFocus={f.key === 'cliente'}
                    className="px-3 py-2 rounded-lg font-dm text-sm text-gray-800 placeholder-white/20 outline-none"
                    style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }} />
                </div>
              ))}

              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Paquete base</label>
                <select value={form.servicio_id} onChange={e => {
                  const s = servicios.find(x => x.id === parseInt(e.target.value)) || null;
                  set('servicio_id', e.target.value);
                  setSelectedService(s);
                }}
                  className="px-3 py-2 rounded-lg font-dm text-sm text-gray-800 outline-none"
                  style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <option value="">Sin paquete fijo</option>
                  {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre} — ${s.precio.toLocaleString('es-AR')}</option>)}
                </select>
                {selectedService && JSON.parse(selectedService.incluye || '[]').length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(JSON.parse(selectedService.incluye) as string[]).map((inc, i) => (
                      <span key={i} className="font-dm text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c' }}>✓ {inc}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Chicos</label>
                <input type="number" value={form.cant_chicos} onChange={e => set('cant_chicos', e.target.value)}
                  className="px-3 py-2 rounded-lg font-dm text-sm text-gray-800 outline-none"
                  style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Adultos</label>
                <input type="number" value={form.cant_adultos} onChange={e => set('cant_adultos', e.target.value)}
                  className="px-3 py-2 rounded-lg font-dm text-sm text-gray-800 outline-none"
                  style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>

              {/* Adicionales */}
              <div className="col-span-2 flex flex-col gap-2">
                <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Adicionales</label>
                <div className="flex gap-2">
                  <input value={extraDesc} onChange={e => setExtraDesc(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExtra(); } }}
                    placeholder="Descripción" className="flex-1 px-3 py-2 rounded-lg font-dm text-sm text-gray-800 placeholder-white/20 outline-none"
                    style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <input type="number" value={extraPrecio} onChange={e => setExtraPrecio(e.target.value)}
                    placeholder="$" className="w-24 px-3 py-2 rounded-lg font-dm text-sm text-gray-800 placeholder-white/20 outline-none"
                    style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <button onClick={addExtra} type="button"
                    className="px-3 py-2 rounded-lg font-dm text-sm font-semibold text-black"
                    style={{ background: '#f97316' }}>+</button>
                </div>
                {extras.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: '#ffffff' }}>
                    <span className="font-dm text-xs text-gray-800 flex-1">{e.desc}</span>
                    <span className="font-dm text-xs" style={{ color: '#fb923c' }}>${e.precio.toLocaleString('es-AR')}</span>
                    <button onClick={() => setExtras(extras.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-400 ml-1">✕</button>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="col-span-2 flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)' }}>
                <span className="font-dm text-sm text-gray-600">Total presupuestado</span>
                <span className="font-bebas text-2xl" style={{ color: '#f97316' }}>${total.toLocaleString('es-AR')}</span>
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Notas</label>
                <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={2}
                  placeholder="Observaciones adicionales…"
                  className="px-3 py-2 rounded-lg font-dm text-sm text-gray-800 placeholder-white/20 outline-none resize-none"
                  style={{ background: '#f3f4f6', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <button onClick={reset} className="font-dm text-sm px-4 py-2 rounded-lg text-gray-400 hover:text-gray-800 transition-colors">Cancelar</button>
              <button onClick={save} disabled={saving}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-lg text-black disabled:opacity-50"
                style={{ background: '#f97316' }}>
                {saving ? 'Guardando…' : 'Guardar presupuesto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {!loading && presups.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-bebas text-2xl text-gray-300 tracking-widest">Sin presupuestos todavía</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {presups.map(p => {
            const items: ItemExtra[] = JSON.parse(p.items || '[]');
            return (
              <div key={p.id} className="rounded-2xl p-5"
                style={{ background: '#ffffff', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-dm font-semibold text-gray-800">{p.cliente}</h3>
                      <span className="font-dm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: `${ESTADO_COL[p.estado]}22`, color: ESTADO_COL[p.estado] }}>
                        {p.estado}
                      </span>
                    </div>
                    <p className="font-dm text-xs text-gray-400">{p.telefono} · {p.tipo_evento}</p>
                    {p.fecha_evento && <p className="font-dm text-xs text-gray-400">📅 {new Date(p.fecha_evento).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                    {p.servicio_nombre && <p className="font-dm text-xs mt-0.5" style={{ color: '#fb923c' }}>📦 {p.servicio_nombre}</p>}
                    {items.length > 0 && items.map((it, i) => (
                      <p key={i} className="font-dm text-xs text-gray-400">+ {it.desc}: ${it.precio.toLocaleString('es-AR')}</p>
                    ))}
                    {p.notas && <p className="font-dm text-xs text-gray-400 mt-1">💬 {p.notas}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bebas text-2xl" style={{ color: '#f97316' }}>${p.total.toLocaleString('es-AR')}</p>
                    <select value={p.estado} onChange={e => updateEstado(p.id, e.target.value)}
                      className="font-dm text-[10px] px-2 py-1 rounded-lg outline-none"
                      style={{ background: '#f3f4f6', color: ESTADO_COL[p.estado], border: '1px solid rgba(255,255,255,0.1)' }}>
                      {ESTADOS_PRES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                    <a href={`https://wa.me/${p.telefono.replace(/\D/g,'')}?text=${whatsappText(p)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="font-dm text-[10px] px-3 py-1.5 rounded-full transition-colors"
                      style={{ background: 'rgba(37,211,102,0.12)', color: '#25d366' }}>
                      📲 Enviar por WA
                    </a>
                    <button onClick={() => del(p.id)} className="font-dm text-[10px] text-gray-300 hover:text-red-400 transition-colors">Eliminar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

