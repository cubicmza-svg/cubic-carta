'use client';
import { useState, useEffect, useCallback } from 'react';

interface Servicio { id: number; nombre: string; precio_min: number; precio_max: number; }
interface Presupuesto {
  id: number; cliente: string; telefono: string;
  fecha_evento: string; servicio_id: number | null;
  servicio_nombre: string; descripcion: string;
  total: number; estado: string; notas: string;
  created_at: string;
}

const ESTADOS_P = ['borrador', 'enviado', 'aceptado', 'rechazado'];
const ESTADO_COLOR: Record<string, string> = {
  borrador: '#f3f4f6', enviado: '#fef3c7', aceptado: '#dcfce7', rechazado: '#fee2e2',
};
const ESTADO_TEXT: Record<string, string> = {
  borrador: '#6b7280', enviado: '#92400e', aceptado: '#166534', rechazado: '#991b1b',
};
const GU = '#db2777';

export default function GUPresupuestos() {
  const [items, setItems] = useState<Presupuesto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandId, setExpandId] = useState<number | null>(null);

  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaEvento, setFechaEvento] = useState('');
  const [servicioId, setServicioId] = useState<number | null>(null);
  const [servicioNombre, setServicioNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [total, setTotal] = useState('');
  const [estado, setEstado] = useState('borrador');
  const [notas, setNotas] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rp, rs] = await Promise.all([
        fetch('/api/glowup/presupuestos'),
        fetch('/api/glowup/servicios'),
      ]);
      if (rp.ok) setItems(await rp.json());
      if (rs.ok) setServicios(await rs.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setCliente(''); setTelefono(''); setFechaEvento('');
    setServicioId(null); setServicioNombre(''); setDescripcion('');
    setTotal(''); setEstado('borrador'); setNotas('');
    setEditId(null); setShowForm(false);
  }

  function startEdit(p: Presupuesto) {
    setCliente(p.cliente); setTelefono(p.telefono);
    setFechaEvento(p.fecha_evento?.split('T')[0] || '');
    setServicioId(p.servicio_id); setServicioNombre(p.servicio_nombre);
    setDescripcion(p.descripcion); setTotal(p.total > 0 ? String(p.total) : '');
    setEstado(p.estado); setNotas(p.notas);
    setEditId(p.id); setShowForm(true); setExpandId(null);
  }

  function onServicioChange(id: number) {
    setServicioId(id || null);
    const srv = servicios.find(s => s.id === id);
    setServicioNombre(srv?.nombre || '');
    if (srv && (srv.precio_min || srv.precio_max) && !total) {
      if (srv.precio_min && srv.precio_max) {
        setDescripcion(prev => prev || `Servicio: ${srv.nombre}\nPrecio: $${srv.precio_min.toLocaleString('es-AR')} – $${srv.precio_max.toLocaleString('es-AR')}`);
      }
    }
  }

  async function save() {
    if (!cliente.trim()) return;
    setSaving(true);
    const body = {
      cliente, telefono, fecha_evento: fechaEvento,
      servicio_id: servicioId, servicio_nombre: servicioNombre,
      descripcion, total: parseInt(total) || 0, estado, notas,
    };
    const url = editId ? `/api/glowup/presupuestos/${editId}` : '/api/glowup/presupuestos';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await load(); resetForm(); setSaving(false);
  }

  async function del(id: number) {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    await fetch(`/api/glowup/presupuestos/${id}`, { method: 'DELETE' });
    await load();
  }

  async function cambiarEstado(p: Presupuesto, nuevoEstado: string) {
    await fetch(`/api/glowup/presupuestos/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    await load();
  }

  function enviarWsp(p: Presupuesto) {
    const tel = p.telefono.replace(/\D/g, '');
    const texto = encodeURIComponent(
      `Hola ${p.cliente} 🌸\n\nTe mando el presupuesto para tu evento:\n\n` +
      `${p.descripcion || p.servicio_nombre}\n\n` +
      (p.total > 0 ? `💰 Total estimado: $${p.total.toLocaleString('es-AR')}\n\n` : '') +
      (p.fecha_evento ? `📅 Fecha del evento: ${new Date(p.fecha_evento + 'T12:00:00').toLocaleDateString('es-AR')}\n\n` : '') +
      `Recordá que trabajamos con una seña del 50% para confirmar la fecha.\n\n¡Cualquier duda estamos! ✨`
    );
    window.open(`https://wa.me/54${tel}?text=${texto}`, '_blank');
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800">📋 PRESUPUESTOS</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-85 transition-opacity"
          style={{ background: GU }}>
          + Nuevo presupuesto
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#fdf2f8', border: '2px solid #fbcfe8' }}>
          <h3 className="font-bebas text-xl tracking-widest mb-4" style={{ color: GU }}>
            {editId ? 'EDITAR PRESUPUESTO' : 'NUEVO PRESUPUESTO'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Cliente', val: cliente, set: setCliente, ph: 'Nombre y apellido' },
              { label: 'Teléfono', val: telefono, set: setTelefono, ph: '261...' },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">{label}</label>
                <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                  className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                  style={{ borderColor: '#fbcfe8' }} />
              </div>
            ))}
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Fecha del evento</label>
              <input type="date" value={fechaEvento} onChange={e => setFechaEvento(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#fbcfe8' }} />
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Servicio</label>
              <select value={servicioId || ''} onChange={e => onServicioChange(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#fbcfe8' }}>
                <option value="">Seleccionar...</option>
                {servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Descripción del presupuesto</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={5}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#fbcfe8' }}
                placeholder="Detallá qué incluye, colores, personalización, extras..." />
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Total $</label>
              <input type="number" value={total} onChange={e => setTotal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#fbcfe8' }} placeholder="200000" />
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Estado</label>
              <select value={estado} onChange={e => setEstado(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#fbcfe8' }}>
                {ESTADOS_P.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Notas internas</label>
              <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#fbcfe8' }} placeholder="Solo visible en el panel..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving}
              className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-white"
              style={{ background: GU, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando…' : editId ? 'Guardar cambios' : 'Crear presupuesto'}
            </button>
            <button onClick={resetForm}
              className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-gray-500 border border-gray-200 bg-white">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading && <p className="font-dm text-sm text-gray-400 py-6 text-center">Cargando presupuestos…</p>}

      <div className="flex flex-col gap-3">
        {items.map(p => {
          const expanded = expandId === p.id;
          return (
            <div key={p.id} className="rounded-2xl overflow-hidden"
              style={{ border: '1.5px solid #fbcfe8', background: '#fdf2f8' }}>
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() => setExpandId(expanded ? null : p.id)}>
                <div className="flex-1 min-w-0">
                  <p className="font-dm text-sm font-semibold text-gray-800">{p.cliente}</p>
                  <div className="flex gap-3 mt-0.5 flex-wrap">
                    {p.servicio_nombre && <span className="font-dm text-xs text-gray-400">✨ {p.servicio_nombre}</span>}
                    {p.fecha_evento && (
                      <span className="font-dm text-xs text-gray-400">
                        📅 {new Date(p.fecha_evento + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    {p.total > 0 && (
                      <span className="font-bebas text-sm" style={{ color: GU }}>${p.total.toLocaleString('es-AR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: ESTADO_COLOR[p.estado] || '#f3f4f6', color: ESTADO_TEXT[p.estado] || '#6b7280' }}>
                    {p.estado}
                  </span>
                  <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded && (
                <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: '#fbcfe8', background: 'white' }}>
                  {p.telefono && (
                    <p className="font-dm text-xs text-gray-500 mb-2">📞 {p.telefono}</p>
                  )}
                  {p.descripcion && (
                    <div className="rounded-xl p-4 mb-3" style={{ background: '#fdf2f8' }}>
                      <p className="font-dm text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Descripción</p>
                      <p className="font-dm text-sm text-gray-700 whitespace-pre-line leading-relaxed">{p.descripcion}</p>
                    </div>
                  )}
                  {p.notas && (
                    <p className="font-dm text-xs text-gray-400 mb-3">📝 {p.notas}</p>
                  )}
                  <div className="flex flex-wrap gap-2 items-center mt-2">
                    <span className="font-dm text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Mover a:</span>
                    {ESTADOS_P.filter(e => e !== p.estado).map(e => (
                      <button key={e} onClick={() => cambiarEstado(p, e)}
                        className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: ESTADO_COLOR[e], color: ESTADO_TEXT[e] }}>
                        {e}
                      </button>
                    ))}
                    <div className="ml-auto flex gap-2">
                      {p.telefono && (
                        <button onClick={() => enviarWsp(p)}
                          className="font-dm text-xs font-semibold px-3 py-1.5 rounded-xl text-white"
                          style={{ background: '#25d366' }}>
                          📤 Enviar WA
                        </button>
                      )}
                      <button onClick={() => startEdit(p)} className="font-dm text-xs text-gray-400 hover:text-gray-700 px-2">✏️</button>
                      <button onClick={() => del(p.id)} className="font-dm text-xs text-red-300 hover:text-red-500 px-2">🗑</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && items.length === 0 && (
          <p className="font-dm text-sm text-gray-400 py-10 text-center">Sin presupuestos aún 📋</p>
        )}
      </div>
    </div>
  );
}
