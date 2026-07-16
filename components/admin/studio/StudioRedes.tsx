'use client';

import { useState, useEffect } from 'react';

type Plataforma = 'instagram' | 'tiktok' | 'facebook' | 'otro';
type Formato    = 'feed' | 'story' | 'reel' | 'carrusel' | 'otro';
type EstadoPost = 'idea' | 'en_proceso' | 'listo' | 'publicado';

interface Post {
  id: string;
  titulo: string;
  caption: string;
  plataforma: Plataforma;
  formato: Formato;
  estado: EstadoPost;
  fechaProg?: string;
  pilar: string;
  creadoEl: string;
}

const PLATAFORMA_ICON: Record<Plataforma, string> = {
  instagram: '📸',
  tiktok:    '🎵',
  facebook:  '👥',
  otro:      '🌐',
};

const ESTADO_COLOR: Record<EstadoPost, string> = {
  idea:       'bg-sky-500/15 text-sky-300 border-sky-500/30',
  en_proceso: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  listo:      'bg-orange-500/15 text-orange-300 border-orange-500/30',
  publicado:  'bg-green-500/15 text-green-300 border-green-500/30',
};
const ESTADO_LABEL: Record<EstadoPost, string> = {
  idea:       'Idea',
  en_proceso: 'En proceso',
  listo:      'Listo para publicar',
  publicado:  'Publicado',
};

const PILARES = ['Ambiente', 'Carta', 'Detrás de escena', 'Eventos', 'UGC', 'Promos', 'Otro'];

function load(): Post[] {
  try { return JSON.parse(localStorage.getItem('cubic_redes') || '[]'); } catch { return []; }
}
function persist(posts: Post[]) {
  localStorage.setItem('cubic_redes', JSON.stringify(posts));
}

const EMPTY: Omit<Post, 'id' | 'creadoEl'> = {
  titulo: '', caption: '', plataforma: 'instagram',
  formato: 'feed', estado: 'idea', fechaProg: '', pilar: PILARES[0],
};

export default function StudioRedes() {
  const [posts, setPosts]       = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY });
  const [editId, setEditId]     = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPost | 'todos'>('todos');

  useEffect(() => { setPosts(load()); }, []);

  const resetForm = () => { setForm({ ...EMPTY }); setEditId(null); setShowForm(false); };

  const savePost = () => {
    if (!form.titulo.trim()) return;
    const updated = editId
      ? posts.map((p) => p.id === editId ? { ...p, ...form, titulo: form.titulo.trim() } : p)
      : [...posts, { ...form, titulo: form.titulo.trim(), id: Date.now().toString(), creadoEl: new Date().toLocaleDateString('es-AR') }];
    setPosts(updated);
    persist(updated);
    resetForm();
  };

  const openEdit = (post: Post) => {
    setForm({ titulo: post.titulo, caption: post.caption, plataforma: post.plataforma,
              formato: post.formato, estado: post.estado, fechaProg: post.fechaProg || '', pilar: post.pilar });
    setEditId(post.id);
    setShowForm(true);
  };

  const deletePost = (id: string) => {
    const updated = posts.filter((p) => p.id !== id);
    setPosts(updated);
    persist(updated);
    resetForm();
  };

  const setEstado = (id: string, estado: EstadoPost) => {
    const updated = posts.map((p) => p.id === id ? { ...p, estado } : p);
    setPosts(updated);
    persist(updated);
  };

  const filtered = filtroEstado === 'todos' ? posts : posts.filter((p) => p.estado === filtroEstado);

  // Stats
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
        <h2 className="font-bebas text-2xl tracking-widest text-white">PLANIFICACIÓN DE REDES</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="font-dm text-sm font-semibold px-4 py-2 rounded-lg bg-cubic-accent text-black hover:bg-green-400 transition-colors"
        >
          + Nueva publicación
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Publicado', value: stats.publicado, color: 'text-green-400' },
          { label: 'Listo', value: stats.listo, color: 'text-orange-400' },
          { label: 'En proceso', value: stats.proceso, color: 'text-violet-400' },
        ].map((s) => (
          <div key={s.label} className="bg-cubic-card border border-cubic-border rounded-xl p-4 text-center">
            <p className={`font-bebas text-3xl ${s.color}`}>{s.value}</p>
            <p className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['todos', 'idea', 'en_proceso', 'listo', 'publicado'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltroEstado(f)}
            className={`font-dm text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filtroEstado === f
                ? 'border-cubic-accent text-cubic-accent bg-cubic-accent/10'
                : 'border-cubic-border text-cubic-muted hover:text-white'
            }`}
          >
            {f === 'todos' ? 'Todos' : ESTADO_LABEL[f]}
          </button>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,8,18,0.88)', backdropFilter: 'blur(6px)' }}
          onClick={resetForm}
        >
          <div
            className="bg-cubic-card border border-cubic-border rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bebas text-xl tracking-widest text-white">
              {editId ? 'Editar publicación' : 'Nueva publicación'}
            </h3>

            {[
              { label: 'Título / tema', child: (
                <input type="text" value={form.titulo} autoFocus
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Ej: Post happy hour viernes"
                  className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted w-full" />
              )},
              { label: 'Caption / texto', child: (
                <textarea value={form.caption} rows={3}
                  onChange={(e) => setForm({ ...form, caption: e.target.value })}
                  placeholder="Texto del post, hashtags…"
                  className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted w-full resize-none" />
              )},
            ].map(({ label, child }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">{label}</label>
                {child}
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Plataforma', el: (
                  <select value={form.plataforma} onChange={(e) => setForm({ ...form, plataforma: e.target.value as Plataforma })}
                    className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent w-full">
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="otro">Otro</option>
                  </select>
                )},
                { label: 'Formato', el: (
                  <select value={form.formato} onChange={(e) => setForm({ ...form, formato: e.target.value as Formato })}
                    className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent w-full">
                    <option value="feed">Feed</option>
                    <option value="story">Story</option>
                    <option value="reel">Reel</option>
                    <option value="carrusel">Carrusel</option>
                    <option value="otro">Otro</option>
                  </select>
                )},
                { label: 'Pilar de contenido', el: (
                  <select value={form.pilar} onChange={(e) => setForm({ ...form, pilar: e.target.value })}
                    className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent w-full">
                    {PILARES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                )},
                { label: 'Fecha programada', el: (
                  <input type="date" value={form.fechaProg}
                    onChange={(e) => setForm({ ...form, fechaProg: e.target.value })}
                    className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent w-full" />
                )},
              ].map(({ label, el }) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">{label}</label>
                  {el}
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-1">
              {editId && (
                <button onClick={() => deletePost(editId)}
                  className="font-dm text-sm px-4 py-2 rounded-lg border border-pink-500/30 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 transition-colors mr-auto">
                  Eliminar
                </button>
              )}
              <button onClick={resetForm}
                className="font-dm text-sm px-4 py-2 rounded-lg border border-cubic-border text-cubic-muted hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={savePost}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-lg bg-cubic-accent text-black hover:bg-green-400 transition-colors">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-bebas text-2xl text-cubic-muted tracking-widest">Sin publicaciones</p>
          <p className="font-dm text-sm text-cubic-muted mt-2">Agregá la primera.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((post) => (
            <div key={post.id}
              className="bg-cubic-card border border-cubic-border rounded-xl p-4 flex gap-4 hover:border-cubic-border/80 transition-all">
              {/* Icon */}
              <div className="text-2xl flex-shrink-0 pt-0.5">
                {PLATAFORMA_ICON[post.plataforma]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div className="flex items-start gap-2 justify-between">
                  <h3 className="font-dm font-semibold text-white text-sm leading-snug">{post.titulo}</h3>
                  <select
                    value={post.estado}
                    onChange={(e) => setEstado(post.id, e.target.value as EstadoPost)}
                    className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 outline-none cursor-pointer bg-transparent flex-shrink-0 ${ESTADO_COLOR[post.estado]}`}
                  >
                    {(Object.entries(ESTADO_LABEL) as [EstadoPost, string][]).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                {post.caption && (
                  <p className="font-dm text-xs text-cubic-muted leading-relaxed line-clamp-2">{post.caption}</p>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-dm text-[10px] text-cubic-muted border border-cubic-border rounded-full px-2 py-0.5 capitalize">
                    {post.formato}
                  </span>
                  <span className="font-dm text-[10px] text-cubic-muted border border-cubic-border rounded-full px-2 py-0.5">
                    {post.pilar}
                  </span>
                  {post.fechaProg && (
                    <span className="font-dm text-[10px] text-cubic-accent">
                      📅 {new Date(post.fechaProg + 'T12:00:00').toLocaleDateString('es-AR', { day:'numeric', month:'short' })}
                    </span>
                  )}
                  <button onClick={() => openEdit(post)}
                    className="font-dm text-[10px] text-cubic-muted hover:text-white transition-colors ml-auto">
                    ✏️ Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
