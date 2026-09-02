'use client';
import { useState, useEffect, useCallback } from 'react';

interface Redes {
  id: number; plataforma: string; tipo: string;
  texto: string; hashtags: string; fecha_pub: string;
  estado: string; link: string; notas: string; created_at: string;
}

const PLATAFORMAS = ['Instagram', 'Facebook', 'TikTok', 'WhatsApp Status'];
const TIPOS_P = ['Post feed', 'Story', 'Reels', 'Colaboración', 'Campaña'];
const ESTADOS_R = ['borrador', 'programado', 'publicado', 'archivado'];
const ESTADO_COLOR: Record<string, string> = {
  borrador: '#f3f4f6', programado: '#fef3c7', publicado: '#dcfce7', archivado: '#f3f4f6',
};
const ESTADO_TEXT: Record<string, string> = {
  borrador: '#6b7280', programado: '#92400e', publicado: '#166534', archivado: '#9ca3af',
};
const GU_MKT = '#7c3aed';

export default function GURedes() {
  const [items, setItems] = useState<Redes[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandId, setExpandId] = useState<number | null>(null);

  const [plataforma, setPlataforma] = useState('Instagram');
  const [tipo, setTipo] = useState('Post feed');
  const [texto, setTexto] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [fechaPub, setFechaPub] = useState('');
  const [estado, setEstado] = useState('borrador');
  const [link, setLink] = useState('');
  const [notas, setNotas] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/glowup/redes');
      if (r.ok) setItems(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setPlataforma('Instagram'); setTipo('Post feed'); setTexto('');
    setHashtags(''); setFechaPub(''); setEstado('borrador');
    setLink(''); setNotas('');
    setEditId(null); setShowForm(false);
  }

  function startEdit(r: Redes) {
    setPlataforma(r.plataforma); setTipo(r.tipo); setTexto(r.texto);
    setHashtags(r.hashtags); setFechaPub(r.fecha_pub?.split('T')[0] || '');
    setEstado(r.estado); setLink(r.link); setNotas(r.notas);
    setEditId(r.id); setShowForm(true); setExpandId(null);
  }

  async function save() {
    if (!texto.trim()) return;
    setSaving(true);
    const body = { plataforma, tipo, texto, hashtags, fecha_pub: fechaPub, estado, link, notas };
    const url = editId ? `/api/glowup/redes/${editId}` : '/api/glowup/redes';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await load(); resetForm(); setSaving(false);
  }

  async function del(id: number) {
    if (!confirm('¿Eliminar?')) return;
    await fetch(`/api/glowup/redes/${id}`, { method: 'DELETE' });
    await load();
  }

  async function cambiarEstado(r: Redes, nuevoEstado: string) {
    await fetch(`/api/glowup/redes/${r.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    await load();
  }

  const PLAT_EMOJI: Record<string, string> = { Instagram: '📸', Facebook: '📘', TikTok: '🎵', 'WhatsApp Status': '💬' };

  const SelectField = ({ label, val, opts, set }: { label: string; val: string; opts: string[]; set: (v: string) => void }) => (
    <div>
      <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">{label}</label>
      <select value={val} onChange={e => set(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
        style={{ borderColor: '#ddd6fe' }}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800">📲 REDES SOCIALES</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-85 transition-opacity"
          style={{ background: GU_MKT }}>
          + Nueva publicación
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl p-6 mb-6" style={{ background: '#f5f3ff', border: '2px solid #ddd6fe' }}>
          <h3 className="font-bebas text-xl tracking-widest mb-4" style={{ color: GU_MKT }}>
            {editId ? 'EDITAR' : 'NUEVA PUBLICACIÓN'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField label="Plataforma" val={plataforma} opts={PLATAFORMAS} set={setPlataforma} />
            <SelectField label="Tipo" val={tipo} opts={TIPOS_P} set={setTipo} />
            <div className="sm:col-span-2">
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Texto del post</label>
              <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={5}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#ddd6fe' }}
                placeholder="Escribí el caption completo con emojis y todo..." />
            </div>
            <div className="sm:col-span-2">
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Hashtags</label>
              <input value={hashtags} onChange={e => setHashtags(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#ddd6fe' }}
                placeholder="#glowupdeco #decoracion #cumpleaños #mendoza..." />
            </div>
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Fecha de publicación</label>
              <input type="date" value={fechaPub} onChange={e => setFechaPub(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#ddd6fe' }} />
            </div>
            <SelectField label="Estado" val={estado} opts={ESTADOS_R} set={setEstado} />
            <div className="sm:col-span-2">
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Link (opcional)</label>
              <input value={link} onChange={e => setLink(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#ddd6fe' }} placeholder="Link del post publicado..." />
            </div>
            <div className="sm:col-span-2">
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Notas</label>
              <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#ddd6fe' }} placeholder="Imágenes a usar, referencia, etc..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={saving}
              className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-white"
              style={{ background: GU_MKT, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando…' : editId ? 'Guardar' : 'Crear publicación'}
            </button>
            <button onClick={resetForm}
              className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-gray-500 border border-gray-200 bg-white">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading && <p className="font-dm text-sm text-gray-400 py-6 text-center">Cargando…</p>}

      <div className="flex flex-col gap-3">
        {items.map(r => {
          const expanded = expandId === r.id;
          return (
            <div key={r.id} className="rounded-2xl overflow-hidden"
              style={{ border: '1.5px solid #ddd6fe', background: '#f5f3ff' }}>
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer"
                onClick={() => setExpandId(expanded ? null : r.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{PLAT_EMOJI[r.plataforma] || '📱'}</span>
                    <span className="font-dm text-xs font-semibold text-gray-500 uppercase tracking-wider">{r.plataforma} · {r.tipo}</span>
                    {r.fecha_pub && (
                      <span className="font-dm text-xs text-gray-400">
                        {new Date(r.fecha_pub + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                  <p className="font-dm text-sm text-gray-700 mt-1 truncate">{r.texto}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="font-dm text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: ESTADO_COLOR[r.estado] || '#f3f4f6', color: ESTADO_TEXT[r.estado] || '#6b7280' }}>
                    {r.estado}
                  </span>
                  <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded && (
                <div className="px-5 pb-5 pt-2 border-t" style={{ borderColor: '#ddd6fe', background: 'white' }}>
                  <p className="font-dm text-sm text-gray-700 mb-3 leading-relaxed whitespace-pre-wrap">{r.texto}</p>
                  {r.hashtags && (
                    <p className="font-dm text-xs mb-3" style={{ color: GU_MKT }}>{r.hashtags}</p>
                  )}
                  {r.notas && <p className="font-dm text-xs text-gray-400 mb-3 italic">📝 {r.notas}</p>}
                  {r.link && (
                    <a href={r.link} target="_blank" rel="noreferrer"
                      className="font-dm text-xs underline mb-3 block" style={{ color: GU_MKT }}>
                      Ver publicación →
                    </a>
                  )}
                  <div className="flex flex-wrap gap-2 items-center mt-2">
                    {ESTADOS_R.filter(e => e !== r.estado).map(e => (
                      <button key={e} onClick={() => cambiarEstado(r, e)}
                        className="font-dm text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: ESTADO_COLOR[e], color: ESTADO_TEXT[e] }}>
                        {e}
                      </button>
                    ))}
                    <div className="ml-auto flex gap-2">
                      <button onClick={() => startEdit(r)} className="font-dm text-xs text-gray-400 hover:text-gray-700 px-2">✏️</button>
                      <button onClick={() => del(r.id)} className="font-dm text-xs text-red-300 hover:text-red-500 px-2">🗑</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && items.length === 0 && (
          <p className="font-dm text-sm text-gray-400 py-10 text-center">Sin publicaciones aún 📲</p>
        )}
      </div>
    </div>
  );
}
