'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

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
  imagen: string;
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
const FORMATO_DOT: Record<Formato | string, string> = {
  feed: '#f97316', story: '#38bdf8', reel: '#a78bfa', carrusel: '#34d399', otro: '#94a3b8',
};
const PILARES = ['Ambiente', 'Carta', 'Detras de escena', 'Eventos', 'UGC', 'Promos', 'Otro'];
const DIAS_SEMANA = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const EMPTY = {
  titulo: '', caption: '', plataforma: 'instagram' as Plataforma,
  formato: 'feed' as Formato, estado: 'idea' as EstadoPost,
  fechas_prog: [] as string[], link_drive: '', pilar: PILARES[0],
  guion: '', tipo_grabacion: '', imagen: '',
};

function parseFechas(raw: string): string[] {
  try { return JSON.parse(raw) || []; } catch { return []; }
}

function formatDateAR(iso: string) {
  const [, m, d] = iso.split('-');
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${months[parseInt(m)-1]}`;
}

function buildCalGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = (firstDay + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 700;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.65));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function StudioRedes() {
  const [posts, setPosts]         = useState<Post[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ ...EMPTY });
  const [editId, setEditId]       = useState<number | null>(null);
  const [filtro, setFiltro]       = useState<EstadoPost | 'todos'>('todos');
  const [saving, setSaving]       = useState(false);
  const [dateInput, setDateInput] = useState('');
  const [view, setView]           = useState<'lista' | 'calendario'>('calendario');
  const [calYear, setCalYear]     = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth]   = useState(() => new Date().getMonth() + 1);
  const [calDaySelected, setCalDaySelected] = useState<number | null>(null);
  const [expandGuion, setExpandGuion]       = useState<number | null>(null);
  const [expandFeedback, setExpandFeedback] = useState<number | null>(null);
  const [feedbackDraft, setFeedbackDraft]   = useState<Record<number, string>>({});
  const [uploadingImg, setUploadingImg]     = useState(false);
  const [saveError, setSaveError]           = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bigbang/marketing/redes');
      if (res.ok) setPosts(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const resetForm = () => {
    setForm({ ...EMPTY }); setEditId(null); setShowForm(false); setDateInput('');
  };

  const addFecha = () => {
    if (!dateInput || form.fechas_prog.includes(dateInput)) return;
    setForm(f => ({ ...f, fechas_prog: [...f.fechas_prog, dateInput].sort() }));
    setDateInput('');
  };

  const savePost = async () => {
    if (!form.titulo.trim() || saving) return;
    setSaving(true); setSaveError('');
    try {
      const body = {
        titulo: form.titulo.trim(), caption: form.caption,
        plataforma: form.plataforma, formato: form.formato,
        estado: form.estado,
        fechas_prog: JSON.stringify(form.fechas_prog),
        link_drive: form.link_drive.trim(), pilar: form.pilar,
        guion: form.guion, tipo_grabacion: form.tipo_grabacion,
        imagen: form.imagen,
      };
      const url = editId !== null ? `/api/bigbang/marketing/redes/${editId}` : '/api/bigbang/marketing/redes';
      const method = editId !== null ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSaveError(`Error ${res.status}: ${err.error || 'No se pudo guardar'}`);
        return;
      }
      await fetchPosts();
      resetForm();
      setView('lista');
    } catch (e: unknown) {
      setSaveError('Error de red: ' + (e instanceof Error ? e.message : 'desconocido'));
    } finally { setSaving(false); }
  };

  const openEdit = (post: Post) => {
    setForm({
      titulo: post.titulo, caption: post.caption, plataforma: post.plataforma,
      formato: post.formato, estado: post.estado,
      fechas_prog: parseFechas(post.fechas_prog),
      link_drive: post.link_drive || '', pilar: post.pilar,
      guion: post.guion || '', tipo_grabacion: post.tipo_grabacion || '',
      imagen: post.imagen || '',
    });
    setEditId(post.id); setShowForm(true); setDateInput('');
  };

  const deletePost = async (id: number) => {
    await fetch(`/api/bigbang/marketing/redes/${id}`, { method: 'DELETE' });
    await fetchPosts(); resetForm();
  };

  const setEstado = async (id: number, estado: EstadoPost) => {
    await fetch(`/api/bigbang/marketing/redes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }),
    });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  };

  const toggleRevisado = async (post: Post) => {
    const revisado = !post.revisado;
    await fetch(`/api/bigbang/marketing/redes/${post.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revisado }),
    });
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, revisado } : p));
  };

  const saveFeedback = async (id: number, feedback: string) => {
    await fetch(`/api/bigbang/marketing/redes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback }),
    });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, feedback } : p));
  };

  const handleImageFile = async (file: File) => {
    setUploadingImg(true);
    const b64 = await resizeImage(file);
    setForm(f => ({ ...f, imagen: b64 }));
    setUploadingImg(false);
  };

  const filtered = filtro === 'todos' ? posts : posts.filter(p => p.estado === filtro);

  // ── Calendario ──────────────────────────────────────────────────────────────
  const calGrid = buildCalGrid(calYear, calMonth);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  function postsForDay(day: number): Post[] {
    const iso = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return posts.filter(p => parseFechas(p.fechas_prog).includes(iso));
  }

  function openFormForDay(day: number) {
    const iso = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    resetForm();
    setForm(f => ({ ...f, fechas_prog: [iso] }));
    setShowForm(true);
  }

  const calDayPosts = calDaySelected ? postsForDay(calDaySelected) : [];
  const calDayIso = calDaySelected
    ? `${calYear}-${String(calMonth).padStart(2,'0')}-${String(calDaySelected).padStart(2,'0')}`
    : '';

  function prevMonth() {
    if (calMonth === 1) { setCalYear(y => y - 1); setCalMonth(12); }
    else setCalMonth(m => m - 1);
    setCalDaySelected(null);
  }
  function nextMonth() {
    if (calMonth === 12) { setCalYear(y => y + 1); setCalMonth(1); }
    else setCalMonth(m => m + 1);
    setCalDaySelected(null);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800">PLANIFICACION DE REDES</h2>
        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden border border-white/10">
            {(['calendario','lista'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="font-dm text-xs px-4 py-2 capitalize transition-colors"
                style={view === v ? { background: '#f97316', color: '#000', fontWeight: 700 } : { background: 'rgba(255,255,255,0.04)', color: '#9ca3af' }}>
                {v === 'calendario' ? 'Calendario' : 'Lista'}
              </button>
            ))}
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="font-dm text-sm font-semibold px-4 py-2 rounded-lg bg-orange-500 text-black hover:bg-orange-400 transition-colors">
            + Nueva
          </button>
        </div>
      </div>

      {/* ── CALENDARIO ─────────────────────────────────────────────────────────── */}
      {view === 'calendario' && (
        <div>
          {/* Nav mes */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button onClick={prevMonth} className="font-dm text-sm text-gray-400 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-white/5 transition-colors">‹</button>
            <h3 className="font-bebas text-xl tracking-widest text-gray-800">{MESES[calMonth-1]} {calYear}</h3>
            <button onClick={nextMonth} className="font-dm text-sm text-gray-400 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-white/5 transition-colors">›</button>
          </div>

          {/* Grid */}
          <div className="bg-white/3 border border-white/10 rounded-2xl overflow-hidden">
            {/* Header días */}
            <div className="grid grid-cols-7 border-b border-white/10">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="font-dm text-[10px] text-gray-400 uppercase tracking-wider text-center py-2">{d}</div>
              ))}
            </div>
            {/* Semanas */}
            {Array.from({ length: calGrid.length / 7 }).map((_, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-white/5 last:border-0">
                {calGrid.slice(wi * 7, wi * 7 + 7).map((day, di) => {
                  if (!day) return <div key={di} className="border-r border-white/5 last:border-0 min-h-[72px] bg-white/1" />;
                  const dayPosts = postsForDay(day);
                  const iso = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const isToday = iso === todayStr;
                  const isSelected = calDaySelected === day;
                  return (
                    <div key={di}
                      className="border-r border-white/5 last:border-0 min-h-[72px] p-1.5 cursor-pointer group relative transition-colors"
                      style={{ background: isSelected ? 'rgba(249,115,22,0.08)' : 'transparent' }}
                      onClick={() => {
                        if (dayPosts.length === 0) openFormForDay(day);
                        else setCalDaySelected(isSelected ? null : day);
                      }}>
                      {/* Numero día */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-dm text-xs font-semibold"
                          style={{ color: isToday ? '#f97316' : isSelected ? '#f97316' : '#6b7280',
                            background: isToday ? 'rgba(249,115,22,0.15)' : 'transparent',
                            borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {day}
                        </span>
                        {/* Boton + */}
                        <button
                          onClick={e => { e.stopPropagation(); openFormForDay(day); }}
                          className="opacity-0 group-hover:opacity-100 font-dm text-[10px] text-gray-400 hover:text-orange-400 w-4 h-4 flex items-center justify-center transition-all">
                          +
                        </button>
                      </div>
                      {/* Dots/thumbnails */}
                      <div className="flex flex-col gap-0.5">
                        {dayPosts.slice(0, 3).map(p => (
                          <div key={p.id} className="rounded text-[9px] font-dm px-1 py-0.5 truncate leading-tight"
                            style={{ background: `${FORMATO_DOT[p.formato]}22`, color: FORMATO_DOT[p.formato], border: `1px solid ${FORMATO_DOT[p.formato]}44` }}>
                            {p.imagen
                              ? <span className="flex items-center gap-1"><img src={p.imagen} alt="" className="w-3 h-3 rounded object-cover inline" />{p.titulo}</span>
                              : p.titulo
                            }
                          </div>
                        ))}
                        {dayPosts.length > 3 && (
                          <span className="font-dm text-[9px] text-gray-400 px-1">+{dayPosts.length - 3} mas</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Panel día seleccionado */}
          {calDaySelected && calDayPosts.length > 0 && (
            <div className="mt-4 bg-white/5 border border-orange-500/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bebas text-lg tracking-widest text-orange-400">
                  {parseInt(calDayIso.split('-')[2])} de {MESES[calMonth-1]}
                </h4>
                <div className="flex gap-2">
                  <button onClick={() => openFormForDay(calDaySelected)}
                    className="font-dm text-xs px-3 py-1.5 rounded-lg bg-orange-500 text-black font-semibold">+ Agregar</button>
                  <button onClick={() => setCalDaySelected(null)} className="font-dm text-xs text-gray-400 hover:text-gray-800 px-2">✕</button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {calDayPosts.map(p => (
                  <PostCard key={p.id} post={p}
                    expandGuion={expandGuion} setExpandGuion={setExpandGuion}
                    expandFeedback={expandFeedback} setExpandFeedback={setExpandFeedback}

                    onEdit={openEdit} onEstado={setEstado}
                    onRevisado={toggleRevisado} onFeedback={saveFeedback} />
                ))}
              </div>
            </div>
          )}

          {/* Leyenda */}
          <div className="flex gap-4 mt-4 flex-wrap">
            {Object.entries(FORMATO_DOT).map(([f, c]) => (
              <span key={f} className="flex items-center gap-1.5 font-dm text-[11px] text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c }} />
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── LISTA ──────────────────────────────────────────────────────────────── */}
      {view === 'lista' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total', value: posts.length },
              { label: 'Publicado', value: posts.filter(p => p.estado === 'publicado').length },
              { label: 'Listo', value: posts.filter(p => p.estado === 'listo').length },
              { label: 'En proceso', value: posts.filter(p => p.estado === 'en_proceso').length },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="font-bebas text-3xl text-orange-400">{s.value}</p>
                <p className="font-dm text-[10px] text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex gap-2 mb-5 flex-wrap">
            {(['todos', 'idea', 'en_proceso', 'listo', 'publicado'] as const).map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`font-dm text-xs px-3 py-1.5 rounded-full border transition-colors ${filtro === f ? 'border-orange-500 text-orange-500 bg-orange-500/10' : 'border-white/10 text-gray-400 hover:text-gray-800'}`}>
                {f === 'todos' ? 'Todos' : ESTADO_LABEL[f as EstadoPost]}
              </button>
            ))}
          </div>

          {loading && <p className="font-dm text-sm text-gray-400 py-6 text-center">Cargando...</p>}
          <div className="flex flex-col gap-3">
            {filtered.map(post => (
              <PostCard key={post.id} post={post}
                expandGuion={expandGuion} setExpandGuion={setExpandGuion}
                expandFeedback={expandFeedback} setExpandFeedback={setExpandFeedback}
                onEdit={openEdit} onEstado={setEstado}
                onRevisado={toggleRevisado} onFeedback={saveFeedback} />
            ))}
            {!loading && filtered.length === 0 && (
              <p className="font-dm text-sm text-gray-400 py-10 text-center">Sin publicaciones</p>
            )}
          </div>
        </>
      )}

      {/* ── MODAL FORMULARIO ──────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,8,18,0.88)', backdropFilter: 'blur(6px)' }}
          onClick={resetForm}>
          <div className="panel-light bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest text-gray-800">
              {editId !== null ? 'Editar publicacion' : 'Nueva publicacion'}
            </h3>

            <div>
              <label className="font-dm text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Titulo / tema</label>
              <input type="text" value={form.titulo} autoFocus
                onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Ej: Post happy hour viernes"
                className="w-full border border-gray-200 rounded-lg font-dm text-sm px-3 py-2 outline-none focus:border-orange-400" />
            </div>

            <div>
              <label className="font-dm text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Caption / texto</label>
              <textarea value={form.caption} rows={3}
                onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                placeholder="Texto del post, hashtags..."
                className="w-full border border-gray-200 rounded-lg font-dm text-sm px-3 py-2 outline-none focus:border-orange-400 resize-none" />
            </div>

            {/* Imagen */}
            <div>
              <label className="font-dm text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Imagen de la publicacion</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); }} />
              {form.imagen ? (
                <div className="relative inline-block">
                  <img src={form.imagen} alt="preview" className="w-full max-h-48 object-cover rounded-lg border border-gray-200" />
                  <button onClick={() => setForm(f => ({ ...f, imagen: '' }))}
                    className="absolute top-2 right-2 bg-white/80 rounded-full w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:text-red-500 text-sm">✕</button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} disabled={uploadingImg}
                  className="w-full border-2 border-dashed border-gray-200 rounded-lg py-6 font-dm text-sm text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-colors flex flex-col items-center gap-1">
                  <span className="text-2xl">📷</span>
                  {uploadingImg ? 'Procesando...' : 'Subir imagen'}
                </button>
              )}
            </div>

            <div>
              <label className="font-dm text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Link a Drive (opcional)</label>
              <input type="url" value={form.link_drive}
                onChange={e => setForm(f => ({ ...f, link_drive: e.target.value }))}
                placeholder="https://drive.google.com/..."
                className="w-full border border-gray-200 rounded-lg font-dm text-sm px-3 py-2 outline-none focus:border-orange-400" />
            </div>

            {/* Fechas */}
            <div>
              <label className="font-dm text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Fechas de publicacion</label>
              <div className="flex gap-2">
                <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addFecha()}
                  className="flex-1 border border-gray-200 rounded-lg font-dm text-sm px-3 py-2 outline-none focus:border-orange-400" />
                <button onClick={addFecha}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-black font-dm text-sm font-bold hover:bg-orange-400 shrink-0">+</button>
              </div>
              {form.fechas_prog.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.fechas_prog.map(d => (
                    <span key={d} className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-full px-3 py-1 text-xs font-dm">
                      {formatDateAR(d)}
                      <button onClick={() => setForm(f => ({ ...f, fechas_prog: f.fechas_prog.filter(x => x !== d) }))}
                        className="ml-1 font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Selects */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Formato', val: form.formato, opts: ['feed','story','reel','carrusel','otro'], set: (v: string) => setForm(f => ({ ...f, formato: v as Formato })) },
                { label: 'Estado', val: form.estado, opts: Object.keys(ESTADO_LABEL), set: (v: string) => setForm(f => ({ ...f, estado: v as EstadoPost })) },
                { label: 'Plataforma', val: form.plataforma, opts: ['instagram','tiktok','facebook','otro'], set: (v: string) => setForm(f => ({ ...f, plataforma: v as Plataforma })) },
                { label: 'Pilar', val: form.pilar, opts: PILARES, set: (v: string) => setForm(f => ({ ...f, pilar: v })) },
              ].map(({ label, val, opts, set }) => (
                <div key={label}>
                  <label className="font-dm text-[10px] text-gray-500 uppercase tracking-widest block mb-1">{label}</label>
                  <select value={val} onChange={e => set(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg font-dm text-sm px-3 py-2 outline-none focus:border-orange-400 bg-white">
                    {opts.map(o => <option key={o} value={o}>{ESTADO_LABEL[o as EstadoPost] || o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* Guion */}
            <div>
              <label className="font-dm text-[10px] text-gray-500 uppercase tracking-widest block mb-1">Guion / slides (opcional)</label>
              <textarea value={form.guion} rows={5}
                onChange={e => setForm(f => ({ ...f, guion: e.target.value }))}
                placeholder="DURACION: 30seg&#10;ESCENA 1: ..."
                className="w-full border border-gray-200 rounded-lg font-dm text-sm px-3 py-2 outline-none focus:border-orange-400 resize-none" />
            </div>

            <div className="flex gap-2 justify-end">
              {editId !== null && (
                <button onClick={() => deletePost(editId)}
                  className="font-dm text-sm px-4 py-2 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 mr-auto">
                  Eliminar
                </button>
              )}
              <button onClick={resetForm} className="font-dm text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800">
                Cancelar
              </button>
              <button onClick={savePost} disabled={saving || !form.titulo.trim()}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-lg bg-orange-500 text-black hover:bg-orange-400 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {saveError && (
              <div className="font-dm text-sm text-red-600 bg-red-900/20 border border-red-500/30 rounded-lg px-4 py-2 mt-2">{saveError}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── BBFeedbackBox: estado local para evitar pérdida de foco en Android ────────
function BBFeedbackBox({ initialValue, onSave, onCancel }: {
  initialValue: string; onSave: (v: string) => void; onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initialValue);
  return (
    <div className="mt-2 flex flex-col gap-2">
      <textarea value={draft} rows={3} autoFocus
        onChange={e => setDraft(e.target.value)}
        placeholder="Escribi los cambios que queres hacer..."
        className="w-full border border-orange-500/30 rounded-lg font-dm text-xs px-3 py-2 outline-none resize-none"
        style={{ background: 'white', color: '#1f2937' }} />
      <div className="flex gap-2">
        <button onClick={() => onSave(draft)}
          className="font-dm text-xs font-semibold px-3 py-1.5 rounded-lg bg-orange-500 text-black">Guardar</button>
        <button onClick={onCancel} className="font-dm text-xs text-gray-400 px-3 py-1.5">Cancelar</button>
      </div>
    </div>
  );
}

// ── PostCard (extraido fuera para evitar re-montaje) ──────────────────────────
function PostCard({ post, expandGuion, setExpandGuion, expandFeedback, setExpandFeedback, onEdit, onEstado, onRevisado, onFeedback }: {
  post: Post;
  expandGuion: number | null; setExpandGuion: (id: number | null) => void;
  expandFeedback: number | null; setExpandFeedback: (id: number | null) => void;
  onEdit: (p: Post) => void;
  onEstado: (id: number, e: EstadoPost) => void;
  onRevisado: (p: Post) => void;
  onFeedback: (id: number, fb: string) => void;
}) {
  const fechas = parseFechas(post.fechas_prog);
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3">
      {/* Thumbnail si tiene imagen */}
      {post.imagen && (
        <img src={post.imagen} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10" />
      )}
      {!post.imagen && (
        <div className="text-2xl shrink-0 pt-0.5">{PLATAFORMA_ICON[post.plataforma]}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 justify-between mb-1">
          <h3 className="font-dm font-semibold text-gray-800 text-sm leading-snug">{post.titulo}</h3>
          <select value={post.estado} onChange={e => onEstado(post.id, e.target.value as EstadoPost)}
            className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 outline-none cursor-pointer bg-transparent shrink-0 ${ESTADO_COLOR[post.estado]}`}>
            {(Object.entries(ESTADO_LABEL) as [EstadoPost, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        {post.caption && <p className="font-dm text-xs text-gray-400 leading-relaxed line-clamp-2 mb-1.5">{post.caption}</p>}
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {fechas.map(d => (
            <span key={d} className="font-dm text-[10px] text-orange-500 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5">
              {formatDateAR(d)}
            </span>
          ))}
          <span className="font-dm text-[10px] text-gray-400 border border-white/10 rounded-full px-2 py-0.5 capitalize">{post.formato}</span>
          <span className="font-dm text-[10px] text-gray-400 border border-white/10 rounded-full px-2 py-0.5">{post.pilar}</span>
          {post.tipo_grabacion && (
            <span className={`font-dm text-[10px] rounded-full px-2 py-0.5 border font-semibold ${post.tipo_grabacion === 'tami_obra' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' : post.tipo_grabacion === 'camara' ? 'bg-violet-500/15 text-violet-300 border-violet-500/30' : 'bg-sky-500/15 text-sky-300 border-sky-500/30'}`}>
              {post.tipo_grabacion === 'tami_obra' ? 'Grabar en obra' : post.tipo_grabacion === 'camara' ? 'Camara a cara' : 'Diseno'}
            </span>
          )}
          {post.link_drive && <a href={post.link_drive} target="_blank" rel="noreferrer" className="font-dm text-[10px] text-sky-400">Drive</a>}
        </div>

        {post.guion && (
          <div className="mb-1.5">
            <button onClick={() => setExpandGuion(expandGuion === post.id ? null : post.id)}
              className="font-dm text-[10px] text-orange-400 hover:text-orange-300">
              {expandGuion === post.id ? 'Ocultar guion' : 'Ver guion'}
            </button>
            {expandGuion === post.id && (
              <pre className="mt-2 font-dm text-[11px] text-gray-400 whitespace-pre-wrap p-3 rounded-lg bg-white/5 border border-white/10 max-h-48 overflow-y-auto">
                {post.guion}
              </pre>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1 border-t border-white/5">
          <button onClick={() => onRevisado(post)}
            className={`font-dm text-[11px] font-semibold px-3 py-1 rounded-full border transition-all ${post.revisado ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-orange-400'}`}>
            {post.revisado ? 'Revisado' : 'Marcar revisado'}
          </button>
          <button onClick={() => {
            setExpandFeedback(expandFeedback === post.id ? null : post.id);
          }}
            className="font-dm text-[11px] text-gray-400 hover:text-orange-400">
            {post.feedback ? 'Ver cambios' : 'Pedir cambios'}
          </button>
          <button onClick={() => onEdit(post)} className="font-dm text-[10px] text-gray-400 hover:text-gray-800 ml-auto">Editar</button>
        </div>
        {expandFeedback === post.id && (
          <BBFeedbackBox
            initialValue={post.feedback || ''}
            onSave={v => { onFeedback(post.id, v); setExpandFeedback(null); }}
            onCancel={() => setExpandFeedback(null)}
          />
        )}
        {expandFeedback !== post.id && post.feedback && (
          <div className="mt-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
            <p className="font-dm text-[10px] text-orange-400 font-semibold uppercase mb-1">Cambios solicitados</p>
            <p className="font-dm text-xs text-orange-300 whitespace-pre-line">{post.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}
