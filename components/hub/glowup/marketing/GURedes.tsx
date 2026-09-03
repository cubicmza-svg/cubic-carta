'use client';
import { useState, useEffect, useCallback } from 'react';

interface Post {
  id: number;
  titulo: string;
  caption: string;
  plataforma: string;
  formato: string;
  estado: string;
  fechas_prog: string;
  link_drive: string;
  pilar: string;
  revisado: boolean;
  feedback: string;
  tipo_grabacion: string;
  guion: string;
  creado_el: string;
}

const ESTADOS = ['idea', 'en_proceso', 'listo', 'publicado'];
const ESTADO_LABEL: Record<string, string> = {
  idea: 'Idea', en_proceso: 'En proceso', listo: 'Listo', publicado: 'Publicado',
};
const ESTADO_BG: Record<string, string> = {
  idea: '#f3f4f6', en_proceso: '#ede9fe', listo: '#fef3c7', publicado: '#dcfce7',
};
const ESTADO_FG: Record<string, string> = {
  idea: '#6b7280', en_proceso: '#7c3aed', listo: '#92400e', publicado: '#166534',
};
const TIPO_GRAB_LABEL: Record<string, string> = {
  tami_obra: 'Grabar en obra',
  camara: 'Camara a cara',
  diseno: 'Diseno',
};
const PILARES = ['comercial', 'contenido', 'educativo', 'testimonial', 'entretenimiento'];
const GU = '#db2777';
const GU_MKT = '#7c3aed';

function parseFechas(raw: string): string[] {
  try { return JSON.parse(raw) || []; } catch { return []; }
}
function formatAR(iso: string) {
  const [, m, d] = iso.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${meses[parseInt(m)-1]}`;
}

export default function GURedes() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [dateInput, setDateInput] = useState('');
  const [expandGuion, setExpandGuion] = useState<number | null>(null);
  const [expandFeedback, setExpandFeedback] = useState<number | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState<Record<number, string>>({});

  const [titulo, setTitulo] = useState('');
  const [caption, setCaption] = useState('');
  const [plataforma, setPlataforma] = useState('instagram');
  const [formato, setFormato] = useState('story');
  const [estado, setEstadoForm] = useState('idea');
  const [fechasProg, setFechasProg] = useState<string[]>([]);
  const [linkDrive, setLinkDrive] = useState('');
  const [pilar, setPilar] = useState('contenido');
  const [guion, setGuion] = useState('');
  const [tipoGrab, setTipoGrab] = useState('diseno');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/glowup/redes');
      if (r.ok) setPosts(await r.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setTitulo(''); setCaption(''); setPlataforma('instagram'); setFormato('story');
    setEstadoForm('idea'); setFechasProg([]); setLinkDrive('');
    setPilar('contenido'); setGuion(''); setTipoGrab('diseno');
    setDateInput(''); setEditId(null); setShowForm(false);
  }

  function openEdit(p: Post) {
    setTitulo(p.titulo); setCaption(p.caption); setPlataforma(p.plataforma);
    setFormato(p.formato); setEstadoForm(p.estado); setFechasProg(parseFechas(p.fechas_prog));
    setLinkDrive(p.link_drive || ''); setPilar(p.pilar);
    setGuion(p.guion || ''); setTipoGrab(p.tipo_grabacion || 'diseno');
    setEditId(p.id); setShowForm(true);
  }

  function addFecha() {
    if (!dateInput || fechasProg.includes(dateInput)) return;
    setFechasProg(f => [...f, dateInput].sort());
    setDateInput('');
  }

  async function save() {
    if (!titulo.trim() || saving) return;
    setSaving(true);
    const body = {
      titulo, caption, plataforma, formato, estado,
      fechas_prog: JSON.stringify(fechasProg),
      link_drive: linkDrive,
      pilar, guion, tipo_grabacion: tipoGrab,
    };
    const url = editId !== null ? `/api/glowup/redes/${editId}` : '/api/glowup/redes';
    const method = editId !== null ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await load(); resetForm(); setSaving(false);
  }

  async function del(id: number) {
    if (!confirm('Eliminar?')) return;
    await fetch(`/api/glowup/redes/${id}`, { method: 'DELETE' });
    await load();
  }

  async function cambiarEstado(id: number, nuevoEstado: string) {
    await fetch(`/api/glowup/redes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, estado: nuevoEstado } : p));
  }

  async function toggleRevisado(p: Post) {
    const revisado = !p.revisado;
    await fetch(`/api/glowup/redes/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revisado }),
    });
    setPosts(prev => prev.map(x => x.id === p.id ? { ...x, revisado } : x));
  }

  async function saveFeedback(id: number, feedback: string) {
    await fetch(`/api/glowup/redes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback }),
    });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, feedback } : p));
  }

  const filtered = filtro === 'todos' ? posts : posts.filter(p => p.estado === filtro);
  const border = '#ddd6fe';

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800">REDES SOCIALES</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-85 transition-opacity"
          style={{ background: GU }}>
          + Nueva publicacion
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', val: posts.length },
          { label: 'Publicados', val: posts.filter(p => p.estado === 'publicado').length },
          { label: 'Revisados', val: posts.filter(p => p.revisado).length },
          { label: 'Con cambios', val: posts.filter(p => p.feedback).length },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: '#fdf2f8', border: '1px solid #fbcfe8' }}>
            <p className="font-bebas text-2xl" style={{ color: GU }}>{s.val}</p>
            <p className="font-dm text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {['todos', ...ESTADOS].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className="font-dm text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-all"
            style={filtro === f
              ? { background: GU, color: '#fff', borderColor: GU }
              : { background: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' }}>
            {f === 'todos' ? 'Todos' : ESTADO_LABEL[f] || f}
          </button>
        ))}
      </div>

      {/* Formulario modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={resetForm}>
          <div className="rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
            style={{ background: 'white', border: '2px solid #fbcfe8' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest" style={{ color: GU }}>
              {editId !== null ? 'EDITAR' : 'NUEVA PUBLICACION'}
            </h3>

            {[
              { label: 'Titulo / tema', val: titulo, set: setTitulo, ph: 'Story de fechas disponibles...' },
            ].map(({ label, val, set, ph }) => (
              <div key={label}>
                <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">{label}</label>
                <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                  className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                  style={{ borderColor: '#fbcfe8' }} />
              </div>
            ))}

            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Caption / texto del post</label>
              <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#fbcfe8' }} placeholder="Texto completo con emojis..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Formato', val: formato, set: setFormato, opts: ['story','reel','carrusel','feed'] },
                { label: 'Estado', val: estado, set: setEstadoForm, opts: ESTADOS },
                { label: 'Pilar', val: pilar, set: setPilar, opts: PILARES },
                { label: 'Tipo grabacion', val: tipoGrab, set: setTipoGrab, opts: ['diseno','camara','tami_obra'] },
              ].map(({ label, val, set, opts }) => (
                <div key={label}>
                  <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">{label}</label>
                  <select value={val} onChange={e => set(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                    style={{ borderColor: '#fbcfe8' }}>
                    {opts.map(o => <option key={o} value={o}>{TIPO_GRAB_LABEL[o] || o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Fechas de publicacion</label>
              <div className="flex gap-2">
                <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addFecha()}
                  className="flex-1 px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                  style={{ borderColor: '#fbcfe8' }} />
                <button onClick={addFecha}
                  className="px-4 py-2 rounded-xl font-dm text-sm font-bold text-white shrink-0"
                  style={{ background: GU }}>+</button>
              </div>
              {fechasProg.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {fechasProg.map(d => (
                    <span key={d} className="flex items-center gap-1 font-dm text-xs px-2.5 py-1 rounded-full"
                      style={{ background: '#fce7f3', color: '#be185d' }}>
                      {formatAR(d)}
                      <button onClick={() => setFechasProg(f => f.filter(x => x !== d))}
                        className="ml-1 hover:text-red-500 font-bold">x</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Guion / descripcion de slides</label>
              <textarea value={guion} onChange={e => setGuion(e.target.value)} rows={6}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none resize-none"
                style={{ borderColor: '#fbcfe8' }} placeholder="DURACION: 30seg&#10;ESCENA 1: ...&#10;ESCENA 2: ..." />
            </div>

            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Link a Drive (opcional)</label>
              <input value={linkDrive} onChange={e => setLinkDrive(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm bg-white outline-none"
                style={{ borderColor: '#fbcfe8' }} placeholder="https://drive.google.com/..." />
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={save} disabled={saving}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-white"
                style={{ background: GU, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando...' : editId !== null ? 'Guardar' : 'Crear'}
              </button>
              {editId !== null && (
                <button onClick={() => { del(editId); resetForm(); }}
                  className="font-dm text-sm text-red-400 hover:text-red-600 px-3 py-2">
                  Eliminar
                </button>
              )}
              <button onClick={resetForm}
                className="font-dm text-sm text-gray-400 hover:text-gray-700 px-3 py-2">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="font-dm text-sm text-gray-400 py-6 text-center">Cargando...</p>}

      <div className="flex flex-col gap-3">
        {filtered.map(p => {
          const fechas = parseFechas(p.fechas_prog);
          const guionExpanded = expandGuion === p.id;
          const fbExpanded = expandFeedback === p.id;
          return (
            <div key={p.id} className="rounded-2xl p-4"
              style={{ background: p.revisado ? '#f0fdf4' : '#fdf2f8', border: `1.5px solid ${p.revisado ? '#bbf7d0' : '#fbcfe8'}` }}>
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">
                  {p.formato === 'story' ? '📖' : p.formato === 'reel' ? '🎬' : p.formato === 'carrusel' ? '🖼' : '📸'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-dm text-sm font-semibold text-gray-800">{p.titulo}</h3>
                    <select value={p.estado} onChange={e => cambiarEstado(p.id, e.target.value)}
                      className="font-dm text-[10px] font-semibold rounded-full px-2 py-0.5 border outline-none cursor-pointer shrink-0"
                      style={{ background: ESTADO_BG[p.estado] || '#f3f4f6', color: ESTADO_FG[p.estado] || '#6b7280', borderColor: 'transparent' }}>
                      {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABEL[e]}</option>)}
                    </select>
                  </div>

                  {p.caption && (
                    <p className="font-dm text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">{p.caption}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {fechas.map(d => (
                      <span key={d} className="font-dm text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: '#fce7f3', color: '#be185d' }}>
                        {formatAR(d)}
                      </span>
                    ))}
                    <span className="font-dm text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{p.formato}</span>
                    <span className="font-dm text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{p.pilar}</span>
                    {p.tipo_grabacion && (
                      <span className="font-dm text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={p.tipo_grabacion === 'tami_obra' ? { background: '#fef3c7', color: '#92400e' } : p.tipo_grabacion === 'camara' ? { background: '#ede9fe', color: '#7c3aed' } : { background: '#f0f9ff', color: '#0369a1' }}>
                        {p.tipo_grabacion === 'tami_obra' ? 'Grabar en obra' : p.tipo_grabacion === 'camara' ? 'Camara a cara' : 'Diseno'}
                      </span>
                    )}
                    {p.link_drive && (
                      <a href={p.link_drive} target="_blank" rel="noreferrer"
                        className="font-dm text-[10px] underline" style={{ color: GU_MKT }}>
                        Drive
                      </a>
                    )}
                  </div>

                  {/* Guion expandible */}
                  {p.guion && (
                    <div className="mb-2">
                      <button onClick={() => setExpandGuion(guionExpanded ? null : p.id)}
                        className="font-dm text-[11px] font-semibold transition-colors"
                        style={{ color: GU_MKT }}>
                        {guionExpanded ? 'Ocultar guion' : 'Ver guion completo'}
                      </button>
                      {guionExpanded && (
                        <pre className="mt-2 font-dm text-[11px] text-gray-600 whitespace-pre-wrap leading-relaxed p-3 rounded-xl max-h-64 overflow-y-auto"
                          style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                          {p.guion}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Botones de revision */}
                  <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid #fbcfe8' }}>
                    <button onClick={() => toggleRevisado(p)}
                      className="font-dm text-[11px] font-semibold px-3 py-1 rounded-full border transition-all"
                      style={p.revisado
                        ? { background: '#dcfce7', borderColor: '#bbf7d0', color: '#166534' }
                        : { background: '#f9fafb', borderColor: '#e5e7eb', color: '#6b7280' }}>
                      {p.revisado ? 'Revisado' : 'Marcar revisado'}
                    </button>
                    <button onClick={() => {
                      setExpandFeedback(fbExpanded ? null : p.id);
                      if (!feedbackDraft[p.id]) setFeedbackDraft(d => ({ ...d, [p.id]: p.feedback || '' }));
                    }}
                      className="font-dm text-[11px] transition-colors"
                      style={{ color: p.feedback ? GU : '#9ca3af' }}>
                      {p.feedback ? 'Ver cambios' : 'Pedir cambios'}
                    </button>
                    <button onClick={() => openEdit(p)}
                      className="font-dm text-[10px] text-gray-400 hover:text-gray-700 ml-auto">
                      Editar
                    </button>
                  </div>

                  {fbExpanded && (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea
                        value={feedbackDraft[p.id] ?? p.feedback ?? ''}
                        onChange={e => setFeedbackDraft(d => ({ ...d, [p.id]: e.target.value }))}
                        rows={3} placeholder="Escribi los cambios que queres hacer en este contenido..."
                        className="w-full px-3 py-2 rounded-xl border font-dm text-xs outline-none resize-none"
                        style={{ borderColor: '#fbcfe8', background: 'white' }}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { saveFeedback(p.id, feedbackDraft[p.id] ?? ''); setExpandFeedback(null); }}
                          className="font-dm text-xs font-semibold px-3 py-1.5 rounded-xl text-white"
                          style={{ background: GU }}>
                          Guardar
                        </button>
                        <button onClick={() => setExpandFeedback(null)}
                          className="font-dm text-xs text-gray-400 hover:text-gray-700 px-2 py-1.5">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  {!fbExpanded && p.feedback && (
                    <div className="mt-2 rounded-xl px-3 py-2" style={{ background: '#fce7f3', border: '1px solid #fbcfe8' }}>
                      <p className="font-dm text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: GU }}>Cambios solicitados</p>
                      <p className="font-dm text-xs text-gray-600 whitespace-pre-line">{p.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <p className="font-dm text-sm text-gray-400 py-10 text-center">Sin publicaciones aun</p>
        )}
      </div>
    </div>
  );
}
