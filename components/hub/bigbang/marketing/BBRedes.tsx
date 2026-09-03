'use client';

import { useState, useEffect, useCallback } from 'react';

type Plataforma = 'instagram' | 'tiktok' | 'facebook' | 'otro';
type Formato    = 'feed' | 'story' | 'reel' | 'carrusel' | 'otro';
type EstadoPost = 'idea' | 'en_proceso' | 'listo' | 'publicado';

interface Post {
  id: number;
  titulo: string;
  caption: string;
  plataforma: Plataforma;
  formato: Formato;
  estado: EstadoPost;
  fecha_prog: string | null;
  fechas_prog: string;
  link_drive: string;
  pilar: string;
  creado_el: string;
  revisado: boolean;
  feedback: string;
  tipo_grabacion: string;
  guion: string;
}

const PLATAFORMA_ICON: Record<Plataforma, string> = {
  instagram: '📸', tiktok: '🎵', facebook: '👥', otro: '🌐',
};
const ESTADO_COLOR: Record<EstadoPost, string> = {
  idea:       'bg-sky-500/15 text-sky-300 border-sky-500/30',
  en_proceso: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  listo:      'bg-orange-500/15 text-orange-300 border-orange-500/30',
  publicado:  'bg-green-500/15 text-green-300 border-green-500/30',
};
const ESTADO_LABEL: Record<EstadoPost, string> = {
  idea: 'Idea', en_proceso: 'En proceso', listo: 'Listo', publicado: 'Publicado',
};
const PILARES = ['Ambiente', 'Carta', 'Detrás de escena', 'Eventos', 'UGC', 'Promos', 'Otro'];

const EMPTY = {
  titulo: '', caption: '', plataforma: 'instagram' as Plataforma,
  formato: 'feed' as Formato, estado: 'idea' as EstadoPost,
  fechas_prog: [] as string[], link_drive: '', pilar: PILARES[0],
};

function parseFechas(raw: string): string[] {
  try { return JSON.parse(raw) || []; } catch { return []; }
}

function formatDateAR(iso: string) {
  const [y, m, d] = iso.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${months[parseInt(m)-1]}`;
}

export default function StudioRedes() {
  const [posts, setPosts]       = useState<Post[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY });
  const [editId, setEditId]     = useState<number | null>(null);
  const [filtro, setFiltro]     = useState<EstadoPost | 'todos'>('todos');
  const [saving, setSaving]     = useState(false);
  const [dateInput, setDateInput] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bigbang/marketing/redes');
      if (res.ok) setPosts(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const resetForm = () => { setForm({ ...EMPTY }); setEditId(null); setShowForm(false); setDateInput(''); };

  const addFecha = () => {
    if (!dateInput || form.fechas_prog.includes(dateInput)) return;
    setForm({ ...form, fechas_prog: [...form.fechas_prog, dateInput].sort() });
    setDateInput('');
  };

  const removeFecha = (d: string) => {
    setForm({ ...form, fechas_prog: form.fechas_prog.filter((f) => f !== d) });
  };

  const savePost = async () => {
    if (!form.titulo.trim() || saving) return;
    setSaving(true);
    try {
      const body = {
        titulo:       form.titulo.trim(),
        caption:      form.caption,
        plataforma:   form.plataforma,
        formato:      form.formato,
        estado:       form.estado,
        fecha_prog:   form.fechas_prog[0] || null,
        fechas_prog:  JSON.stringify(form.fechas_prog),
        link_drive:   form.link_drive.trim(),
        pilar:        form.pilar,
      };
      if (editId !== null) {
        await fetch(`/api/bigbang/marketing/redes/${editId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/bigbang/marketing/redes', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      }
      await fetchPosts();
      resetForm();
    } finally { setSaving(false); }
  };

  const openEdit = (post: Post) => {
    setForm({
      titulo:      post.titulo,
      caption:     post.caption,
      plataforma:  post.plataforma,
      formato:     post.formato,
      estado:      post.estado,
      fechas_prog: parseFechas(post.fechas_prog),
      link_drive:  post.link_drive || '',
      pilar:       post.pilar,
    });
    setEditId(post.id);
    setShowForm(true);
    setDateInput('');
  };

  const deletePost = async (id: number) => {
    await fetch(`/api/bigbang/marketing/redes/${id}`, { method: 'DELETE' });
    await fetchPosts();
    resetForm();
  };

  const setEstado = async (id: number, estado: EstadoPost) => {
    await fetch(`/api/bigbang/marketing/redes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }),
    });
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, estado } : p));
  };

  const toggleRevisado = async (post: Post) => {
    const revisado = !post.revisado;
    await fetch(`/api/bigbang/marketing/redes/${post.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revisado }),
    });
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, revisado } : p));
  };

  const saveFeedback = async (id: number, feedback: string) => {
    await fetch(`/api/bigbang/marketing/redes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback }),
    });
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, feedback } : p));
  };

  const [expandGuion, setExpandGuion] = useState<number | null>(null);
  const [expandFeedback, setExpandFeedback] = useState<number | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState<Record<number, string>>({});

  const filtered = filtro === 'todos' ? posts : posts.filter((p) => p.estado === filtro);
  const stats = {
    total:     posts.length,
    publicado: posts.filter((p) => p.estado === 'publicado').length,
    listo:     posts.filter((p) => p.estado === 'listo').length,
    proceso:   posts.filter((p) => p.estado === 'en_proceso').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-bebas text-2xl tracking-widest text-gray-800">PLANIFICACIÓN DE REDES</h2>
          {loading && <span className="font-dm text-xs text-gray-400">Cargando…</span>}
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-lg bg-orange-500 text-black hover:bg-orange-400 transition-colors">
          + Nueva publicación
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total',      value: stats.total,     color: 'text-gray-800' },
          { label: 'Publicado',  value: stats.publicado, color: 'text-orange-400' },
          { label: 'Listo',      value: stats.listo,     color: 'text-orange-400' },
          { label: 'En proceso', value: stats.proceso,   color: 'text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className={`font-bebas text-3xl ${s.color}`}>{s.value}</p>
            <p className="font-dm text-[10px] text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['todos', 'idea', 'en_proceso', 'listo', 'publicado'] as const).map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`font-dm text-xs px-3 py-1.5 rounded-full border transition-colors ${filtro === f ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 'border-white/10 text-gray-400 hover:text-gray-800'}`}>
            {f === 'todos' ? 'Todos' : ESTADO_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,8,18,0.88)', backdropFilter: 'blur(6px)' }}
          onClick={resetForm}>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest text-gray-800">
              {editId !== null ? 'Editar publicación' : 'Nueva publicación'}
            </h3>

            {/* Título */}
            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Título / tema</label>
              <input type="text" value={form.titulo} autoFocus onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Ej: Post happy hour viernes"
                className="bg-white/5 border border-white/10 rounded-lg text-gray-800 font-dm text-sm px-3 py-2 outline-none focus:border-orange-500 placeholder:text-gray-400" />
            </div>

            {/* Caption */}
            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Caption / texto</label>
              <textarea value={form.caption} rows={3} onChange={(e) => setForm({ ...form, caption: e.target.value })}
                placeholder="Texto del post, hashtags…"
                className="bg-white/5 border border-white/10 rounded-lg text-gray-800 font-dm text-sm px-3 py-2 outline-none focus:border-orange-500 placeholder:text-gray-400 resize-none" />
            </div>

            {/* Link Drive */}
            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">Link a Drive / archivo</label>
              <input type="url" value={form.link_drive} onChange={(e) => setForm({ ...form, link_drive: e.target.value })}
                placeholder="https://drive.google.com/…"
                className="bg-white/5 border border-white/10 rounded-lg text-gray-800 font-dm text-sm px-3 py-2 outline-none focus:border-orange-500 placeholder:text-gray-400" />
            </div>

            {/* Fechas múltiples */}
            <div className="flex flex-col gap-2">
              <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">
                Fechas de publicación <span className="text-gray-400 normal-case">(podés agregar varias)</span>
              </label>
              <div className="flex gap-2">
                <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addFecha()}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg text-gray-800 font-dm text-sm px-3 py-2 outline-none focus:border-orange-500" />
                <button onClick={addFecha}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-black font-dm text-sm font-bold hover:bg-orange-400 transition-colors flex-shrink-0">
                  +
                </button>
              </div>
              {form.fechas_prog.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {form.fechas_prog.map((d) => (
                    <span key={d} className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-full px-3 py-1 text-xs font-dm">
                      📅 {formatDateAR(d)}
                      <button onClick={() => removeFecha(d)} className="ml-1 text-gray-400 hover:text-pink-400 transition-colors font-bold leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Plataforma + Formato */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Plataforma', el: (
                  <select value={form.plataforma} onChange={(e) => setForm({ ...form, plataforma: e.target.value as Plataforma })}
                    className="bg-white/5 border border-white/10 rounded-lg text-gray-800 font-dm text-sm px-3 py-2 outline-none focus:border-orange-500 w-full">
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="otro">Otro</option>
                  </select>
                )},
                { label: 'Formato', el: (
                  <select value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value as Formato })}
                    className="bg-white/5 border border-white/10 rounded-lg text-gray-800 font-dm text-sm px-3 py-2 outline-none focus:border-orange-500 w-full">
                    <option value="feed">Feed</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel</option>
                    <option value="carrusel">Carrusel</option>
                    <option value="otro">Otro</option>
                  </select>
                )},
                { label: 'Pilar de contenido', el: (
                  <select value={form.pilar} onChange={(e) => setForm({ ...form, pilar: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-lg text-gray-800 font-dm text-sm px-3 py-2 outline-none focus:border-orange-500 w-full">
                    {PILARES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                )},
                { label: 'Estado inicial', el: (
                  <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoPost })}
                    className="bg-white/5 border border-white/10 rounded-lg text-gray-800 font-dm text-sm px-3 py-2 outline-none focus:border-orange-500 w-full">
                    {(Object.entries(ESTADO_LABEL) as [EstadoPost, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                )},
              ].map(({ label, el }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="font-dm text-[10px] text-gray-400 uppercase tracking-widest">{label}</label>
                  {el}
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-1">
              {editId !== null && (
                <button onClick={() => deletePost(editId)}
                  className="font-dm text-sm px-4 py-2 rounded-lg border border-pink-500/30 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 transition-colors mr-auto">
                  Eliminar
                </button>
              )}
              <button onClick={resetForm}
                className="font-dm text-sm px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={savePost} disabled={saving}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-lg bg-orange-500 text-black hover:bg-orange-400 transition-colors disabled:opacity-50">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de posts */}
      {!loading && filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-bebas text-2xl text-gray-400 tracking-widest">Sin publicaciones</p>
          <p className="font-dm text-sm text-gray-400 mt-2">Agregá la primera.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((post) => {
            const fechas = parseFechas(post.fechas_prog);
            return (
              <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4 hover:border-white/10/80 transition-all">
                <div className="text-2xl flex-shrink-0 pt-0.5">{PLATAFORMA_ICON[post.plataforma]}</div>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-start gap-2 justify-between">
                    <h3 className="font-dm font-semibold text-gray-800 text-sm leading-snug">{post.titulo}</h3>
                    <select value={post.estado} onChange={(e) => setEstado(post.id, e.target.value as EstadoPost)}
                      className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 outline-none cursor-pointer bg-transparent flex-shrink-0 ${ESTADO_COLOR[post.estado]}`}>
                      {(Object.entries(ESTADO_LABEL) as [EstadoPost, string][]).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>

                  {post.caption && (
                    <p className="font-dm text-xs text-gray-400 leading-relaxed line-clamp-2">{post.caption}</p>
                  )}

                  {/* Fechas */}
                  {fechas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {fechas.map((d) => (
                        <span key={d} className="font-dm text-[10px] text-orange-500 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5">
                          📅 {formatDateAR(d)}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-dm text-[10px] text-gray-400 border border-white/10 rounded-full px-2 py-0.5 capitalize">{post.formato}</span>
                    <span className="font-dm text-[10px] text-gray-400 border border-white/10 rounded-full px-2 py-0.5">{post.pilar}</span>
                    {post.tipo_grabacion && (
                      <span className={`font-dm text-[10px] rounded-full px-2 py-0.5 border font-semibold ${post.tipo_grabacion === 'tami_obra' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : post.tipo_grabacion === 'camara' ? 'bg-violet-500/15 text-violet-300 border-violet-500/30' : 'bg-sky-500/15 text-sky-300 border-sky-500/30'}`}>
                        {post.tipo_grabacion === 'tami_obra' ? '🎬 Grabar en obra' : post.tipo_grabacion === 'camara' ? '🎙 Camara a cara' : '🎨 Diseno'}
                      </span>
                    )}
                    {post.link_drive && (
                      <a href={post.link_drive} target="_blank" rel="noopener noreferrer"
                        className="font-dm text-[10px] text-sky-400 hover:text-sky-300 transition-colors">
                        🔗 Drive
                      </a>
                    )}
                  </div>

                  {/* Guion expandible */}
                  {post.guion && (
                    <div>
                      <button onClick={() => setExpandGuion(expandGuion === post.id ? null : post.id)}
                        className="font-dm text-[10px] text-orange-400 hover:text-orange-300 transition-colors">
                        {expandGuion === post.id ? '▲ Ocultar guion' : '▼ Ver guion completo'}
                      </button>
                      {expandGuion === post.id && (
                        <pre className="mt-2 font-dm text-[11px] text-gray-300 whitespace-pre-wrap leading-relaxed p-3 rounded-lg bg-white/5 border border-white/10 max-h-64 overflow-y-auto">
                          {post.guion}
                        </pre>
                      )}
                    </div>
                  )}

                  {/* Revision */}
                  <div className="flex items-center gap-3 pt-1 border-t border-white/5">
                    <button onClick={() => toggleRevisado(post)}
                      className={`font-dm text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${post.revisado ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-gray-400 hover:border-orange-500/40 hover:text-orange-400'}`}>
                      {post.revisado ? '✓ Revisado' : 'Marcar revisado'}
                    </button>
                    <button onClick={() => {
                      setExpandFeedback(expandFeedback === post.id ? null : post.id);
                      if (!feedbackDraft[post.id]) setFeedbackDraft(d => ({ ...d, [post.id]: post.feedback || '' }));
                    }}
                      className="font-dm text-[11px] text-gray-400 hover:text-orange-400 transition-colors">
                      {post.feedback ? '💬 Ver feedback' : '💬 Agregar cambios'}
                    </button>
                    <button onClick={() => openEdit(post)} className="font-dm text-[10px] text-gray-400 hover:text-gray-800 transition-colors ml-auto">
                      ✏️ Editar
                    </button>
                  </div>
                  {expandFeedback === post.id && (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={feedbackDraft[post.id] ?? post.feedback ?? ''}
                        onChange={e => setFeedbackDraft(d => ({ ...d, [post.id]: e.target.value }))}
                        rows={3} placeholder="Escribi los cambios que queres hacer en este contenido..."
                        className="w-full bg-white/5 border border-orange-500/30 rounded-lg text-gray-800 font-dm text-xs px-3 py-2 outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { saveFeedback(post.id, feedbackDraft[post.id] ?? ''); setExpandFeedback(null); }}
                          className="font-dm text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500 text-black hover:bg-orange-400">
                          Guardar feedback
                        </button>
                        <button onClick={() => setExpandFeedback(null)}
                          className="font-dm text-xs text-gray-400 hover:text-gray-800 px-3 py-1.5">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                  {!expandFeedback && post.feedback && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
                      <p className="font-dm text-[10px] text-orange-400 font-semibold uppercase tracking-wider mb-1">Cambios solicitados</p>
                      <p className="font-dm text-xs text-orange-300 whitespace-pre-line">{post.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

