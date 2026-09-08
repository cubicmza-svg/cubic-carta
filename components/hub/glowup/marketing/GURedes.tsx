'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

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
  imagen: string;
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
const FORMATO_DOT: Record<string, string> = {
  feed: '#f472b6', story: '#a78bfa', reel: '#fb7185', carrusel: '#34d399', otro: '#94a3b8',
};
const PILARES = ['comercial', 'contenido', 'educativo', 'testimonial', 'entretenimiento'];
const DIAS_SEMANA = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const GU = '#db2777';
const GU_V = '#7c3aed';

const EMPTY = {
  titulo: '', caption: '', plataforma: 'instagram', formato: 'story',
  estado: 'idea', fechas_prog: [] as string[], link_drive: '',
  pilar: 'contenido', guion: '', tipo_grabacion: 'diseno', imagen: '',
};

function parseFechas(raw: string): string[] {
  try { return JSON.parse(raw) || []; } catch { return []; }
}
function formatAR(iso: string) {
  const [, m, d] = iso.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${parseInt(d)} ${meses[parseInt(m)-1]}`;
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

export default function GURedes() {
  const [posts, setPosts]         = useState<Post[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ ...EMPTY });
  const [editId, setEditId]       = useState<number | null>(null);
  const [filtro, setFiltro]       = useState('todos');
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

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/glowup/redes');
      if (r.ok) setPosts(await r.json());
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setForm({ ...EMPTY }); setEditId(null); setShowForm(false); setDateInput('');
  }

  async function save() {
    if (!form.titulo.trim() || saving) return;
    setSaving(true); setSaveError('');
    try {
      const body = {
        titulo: form.titulo, caption: form.caption, plataforma: form.plataforma,
        formato: form.formato, estado: form.estado,
        fechas_prog: JSON.stringify(form.fechas_prog),
        link_drive: form.link_drive, pilar: form.pilar,
        guion: form.guion, tipo_grabacion: form.tipo_grabacion,
        imagen: form.imagen,
      };
      const url = editId !== null ? `/api/glowup/redes/${editId}` : '/api/glowup/redes';
      const res = await fetch(url, { method: editId !== null ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSaveError(`Error ${res.status}: ${err.error || 'No se pudo guardar'}`);
        return;
      }
      await load();
      resetForm();
      setView('lista');
      fetch('/api/notificaciones-push', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: editId !== null ? `✏️ Post editado: ${body.titulo}` : `📲 Nuevo post: ${body.titulo}`,
          cuerpo: body.plataforma + ' · ' + body.formato,
          portal: 'glowup', url: '/hub/glowup/marketing',
        }),
      }).catch(() => {});
    } catch (e: unknown) {
      setSaveError('Error de red: ' + (e instanceof Error ? e.message : 'desconocido'));
    } finally { setSaving(false); }
  }

  function openEdit(p: Post) {
    setForm({
      titulo: p.titulo, caption: p.caption, plataforma: p.plataforma,
      formato: p.formato, estado: p.estado,
      fechas_prog: parseFechas(p.fechas_prog),
      link_drive: p.link_drive || '', pilar: p.pilar,
      guion: p.guion || '', tipo_grabacion: p.tipo_grabacion || 'diseno',
      imagen: p.imagen || '',
    });
    setEditId(p.id); setShowForm(true); setDateInput('');
  }

  async function del(id: number) {
    if (!confirm('Eliminar?')) return;
    await fetch(`/api/glowup/redes/${id}`, { method: 'DELETE' });
    await load();
  }

  async function cambiarEstado(id: number, estado: string) {
    await fetch(`/api/glowup/redes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estado }),
    });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, estado } : p));
  }

  async function toggleRevisado(p: Post) {
    const revisado = !p.revisado;
    await fetch(`/api/glowup/redes/${p.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revisado }),
    });
    setPosts(prev => prev.map(x => x.id === p.id ? { ...x, revisado } : x));
  }

  async function saveFeedback(id: number, feedback: string) {
    await fetch(`/api/glowup/redes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedback }),
    });
    setPosts(prev => prev.map(p => p.id === id ? { ...p, feedback } : p));
  }

  async function handleImageFile(file: File) {
    setUploadingImg(true);
    const b64 = await resizeImage(file);
    setForm(f => ({ ...f, imagen: b64 }));
    setUploadingImg(false);
  }

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

  const calDayPosts = calDaySelected ? postsForDay(calDaySelected) : [];
  const calDayIso = calDaySelected
    ? `${calYear}-${String(calMonth).padStart(2,'0')}-${String(calDaySelected).padStart(2,'0')}`
    : '';
  const filtered = filtro === 'todos' ? posts : posts.filter(p => p.estado === filtro);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-bebas text-2xl tracking-widest text-gray-800">REDES SOCIALES</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid #fbcfe8' }}>
            {(['calendario','lista'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="font-dm text-xs px-4 py-2 capitalize transition-colors"
                style={view === v ? { background: GU, color: '#fff', fontWeight: 700 } : { background: '#fdf2f8', color: '#9ca3af' }}>
                {v === 'calendario' ? 'Calendario' : 'Lista'}
              </button>
            ))}
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="font-dm text-sm font-semibold px-4 py-2 rounded-xl text-white hover:opacity-85"
            style={{ background: GU }}>
            + Nueva
          </button>
        </div>
      </div>

      {/* ── CALENDARIO ─────────────────────────────────────────────────────────── */}
      {view === 'calendario' && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <button onClick={prevMonth} className="font-dm text-sm text-gray-400 hover:text-gray-800 px-3 py-1 rounded-lg transition-colors">‹</button>
            <h3 className="font-bebas text-xl tracking-widest text-gray-800">{MESES[calMonth-1]} {calYear}</h3>
            <button onClick={nextMonth} className="font-dm text-sm text-gray-400 hover:text-gray-800 px-3 py-1 rounded-lg transition-colors">›</button>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1.5px solid #fbcfe8', background: '#fdf2f8' }}>
            {/* Header días */}
            <div className="grid grid-cols-7" style={{ borderBottom: '1px solid #fbcfe8' }}>
              {DIAS_SEMANA.map(d => (
                <div key={d} className="font-dm text-[10px] text-gray-400 uppercase tracking-wider text-center py-2">{d}</div>
              ))}
            </div>
            {Array.from({ length: calGrid.length / 7 }).map((_, wi) => (
              <div key={wi} className="grid grid-cols-7" style={{ borderBottom: '1px solid #fbcfe8' }}>
                {calGrid.slice(wi * 7, wi * 7 + 7).map((day, di) => {
                  if (!day) return <div key={di} className="min-h-[72px]" style={{ borderRight: '1px solid #fbcfe8' }} />;
                  const dayPosts = postsForDay(day);
                  const iso = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                  const isToday = iso === todayStr;
                  const isSelected = calDaySelected === day;
                  return (
                    <div key={di}
                      className="min-h-[72px] p-1.5 cursor-pointer group relative transition-colors"
                      style={{ borderRight: '1px solid #fbcfe8', background: isSelected ? '#fce7f3' : 'transparent' }}
                      onClick={() => {
                        if (dayPosts.length === 0) openFormForDay(day);
                        else setCalDaySelected(isSelected ? null : day);
                      }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-dm text-xs font-semibold"
                          style={{
                            color: isToday ? GU : isSelected ? GU : '#9ca3af',
                            background: isToday ? '#fce7f3' : 'transparent',
                            borderRadius: '50%', width: 20, height: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                          {day}
                        </span>
                        <button onClick={e => { e.stopPropagation(); openFormForDay(day); }}
                          className="opacity-0 group-hover:opacity-100 font-dm text-[10px] w-4 h-4 flex items-center justify-center transition-all"
                          style={{ color: GU }}>+</button>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {dayPosts.slice(0, 3).map(p => (
                          <div key={p.id} className="rounded text-[9px] font-dm px-1 py-0.5 truncate leading-tight"
                            style={{ background: `${FORMATO_DOT[p.formato] || '#f472b6'}22`, color: FORMATO_DOT[p.formato] || GU, border: `1px solid ${FORMATO_DOT[p.formato] || GU}44` }}>
                            {p.imagen
                              ? <span className="flex items-center gap-1"><img src={p.imagen} alt="" className="w-3 h-3 rounded object-cover inline" />{p.titulo}</span>
                              : p.titulo
                            }
                          </div>
                        ))}
                        {dayPosts.length > 3 && (
                          <span className="font-dm text-[9px] px-1" style={{ color: GU }}>+{dayPosts.length - 3} mas</span>
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
            <div className="mt-4 rounded-2xl p-4" style={{ background: '#fdf2f8', border: '1.5px solid #fbcfe8' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bebas text-lg tracking-widest" style={{ color: GU }}>
                  {parseInt(calDayIso.split('-')[2])} de {MESES[calMonth-1]}
                </h4>
                <div className="flex gap-2">
                  <button onClick={() => openFormForDay(calDaySelected)}
                    className="font-dm text-xs px-3 py-1.5 rounded-xl font-semibold text-white"
                    style={{ background: GU }}>+ Agregar</button>
                  <button onClick={() => setCalDaySelected(null)} className="font-dm text-xs text-gray-400 hover:text-gray-700 px-2">✕</button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {calDayPosts.map(p => (
                  <GUPostCard key={p.id} post={p}
                    expandGuion={expandGuion} setExpandGuion={setExpandGuion}
                    expandFeedback={expandFeedback} setExpandFeedback={setExpandFeedback}

                    onEdit={openEdit} onEstado={cambiarEstado}
                    onRevisado={toggleRevisado} onFeedback={saveFeedback} />
                ))}
              </div>
            </div>
          )}

          {/* Leyenda formatos */}
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
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
            {['todos', ...ESTADOS].map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className="font-dm text-xs px-3 py-1.5 rounded-full border whitespace-nowrap transition-all"
                style={filtro === f ? { background: GU, color: '#fff', borderColor: GU } : { background: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' }}>
                {f === 'todos' ? 'Todos' : ESTADO_LABEL[f] || f}
              </button>
            ))}
          </div>
          {loading && <p className="font-dm text-sm text-gray-400 py-6 text-center">Cargando...</p>}
          <div className="flex flex-col gap-3">
            {filtered.map(p => (
              <GUPostCard key={p.id} post={p}
                expandGuion={expandGuion} setExpandGuion={setExpandGuion}
                expandFeedback={expandFeedback} setExpandFeedback={setExpandFeedback}
                onEdit={openEdit} onEstado={cambiarEstado}
                onRevisado={toggleRevisado} onFeedback={saveFeedback} />
            ))}
            {!loading && filtered.length === 0 && (
              <p className="font-dm text-sm text-gray-400 py-10 text-center">Sin publicaciones</p>
            )}
          </div>
        </>
      )}

      {/* ── MODAL ──────────────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={resetForm}>
          <div className="rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[92vh] overflow-y-auto bg-white shadow-2xl"
            style={{ border: '2px solid #fbcfe8' }}
            onClick={e => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest" style={{ color: GU }}>
              {editId !== null ? 'EDITAR' : 'NUEVA PUBLICACION'}
            </h3>

            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Titulo / tema</label>
              <input value={form.titulo} autoFocus onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                placeholder="Story de fechas disponibles..."
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm outline-none"
                style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }} />
            </div>

            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Caption / texto del post</label>
              <textarea value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} rows={3}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm outline-none resize-none"
                style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }} placeholder="Texto completo con emojis..." />
            </div>

            {/* Imagen */}
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Imagen de la publicacion</label>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleImageFile(e.target.files[0]); }} />
              {form.imagen ? (
                <div className="relative">
                  <img src={form.imagen} alt="preview" className="w-full max-h-48 object-cover rounded-xl" style={{ border: '1px solid #fbcfe8' }} />
                  <button onClick={() => setForm(f => ({ ...f, imagen: '' }))}
                    className="absolute top-2 right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-gray-500 hover:text-red-500 text-sm shadow">✕</button>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} disabled={uploadingImg}
                  className="w-full rounded-xl py-6 font-dm text-sm text-gray-400 flex flex-col items-center gap-1 transition-colors hover:opacity-80"
                  style={{ border: '2px dashed #fbcfe8', background: '#fdf2f8' }}>
                  <span className="text-2xl">📷</span>
                  {uploadingImg ? 'Procesando...' : 'Subir imagen'}
                </button>
              )}
            </div>

            {/* Fechas */}
            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Fechas de publicacion</label>
              <div className="flex gap-2">
                <input type="date" value={dateInput} onChange={e => setDateInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (() => {
                    if (!dateInput || form.fechas_prog.includes(dateInput)) return;
                    setForm(f => ({ ...f, fechas_prog: [...f.fechas_prog, dateInput].sort() }));
                    setDateInput('');
                  })()}
                  className="flex-1 px-3 py-2 rounded-xl border font-dm text-sm outline-none"
                  style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }} />
                <button onClick={() => {
                  if (!dateInput || form.fechas_prog.includes(dateInput)) return;
                  setForm(f => ({ ...f, fechas_prog: [...f.fechas_prog, dateInput].sort() }));
                  setDateInput('');
                }}
                  className="px-4 py-2 rounded-xl font-dm text-sm font-bold text-white"
                  style={{ background: GU }}>+</button>
              </div>
              {form.fechas_prog.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.fechas_prog.map(d => (
                    <span key={d} className="flex items-center gap-1 font-dm text-xs px-2.5 py-1 rounded-full"
                      style={{ background: '#fce7f3', color: '#be185d' }}>
                      {formatAR(d)}
                      <button onClick={() => setForm(f => ({ ...f, fechas_prog: f.fechas_prog.filter(x => x !== d) }))} className="ml-1 font-bold">x</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Selects */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Formato', val: form.formato, set: (v: string) => setForm(f => ({ ...f, formato: v })), opts: ['story','reel','carrusel','feed','otro'] },
                { label: 'Estado', val: form.estado, set: (v: string) => setForm(f => ({ ...f, estado: v })), opts: ESTADOS },
                { label: 'Pilar', val: form.pilar, set: (v: string) => setForm(f => ({ ...f, pilar: v })), opts: PILARES },
                { label: 'Tipo grabacion', val: form.tipo_grabacion, set: (v: string) => setForm(f => ({ ...f, tipo_grabacion: v })), opts: ['diseno','camara','tami_obra'] },
              ].map(({ label, val, set, opts }) => (
                <div key={label}>
                  <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">{label}</label>
                  <select value={val} onChange={e => set(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border font-dm text-sm outline-none bg-white"
                    style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }}>
                    {opts.map(o => <option key={o} value={o}>{o === 'tami_obra' ? 'Grabar en obra' : o === 'camara' ? 'Camara a cara' : ESTADO_LABEL[o] || o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Guion / descripcion de slides</label>
              <textarea value={form.guion} onChange={e => setForm(f => ({ ...f, guion: e.target.value }))} rows={5}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm outline-none resize-none"
                style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }} placeholder="DURACION: 30seg&#10;ESCENA 1: ..." />
            </div>

            <div>
              <label className="font-dm text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">Link Drive (opcional)</label>
              <input value={form.link_drive} onChange={e => setForm(f => ({ ...f, link_drive: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border font-dm text-sm outline-none"
                style={{ borderColor: '#fbcfe8', color: '#1f2937', WebkitTextFillColor: '#1f2937' }} placeholder="https://drive.google.com/..." />
            </div>

            {saveError && (
              <div className="font-dm text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{saveError}</div>
            )}
            <div className="flex gap-3">
              <button onClick={save} disabled={saving || !form.titulo.trim()}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-xl text-white"
                style={{ background: GU, opacity: (saving || !form.titulo.trim()) ? 0.5 : 1 }}>
                {saving ? 'Guardando...' : editId !== null ? 'Guardar' : 'Crear'}
              </button>
              {editId !== null && (
                <button onClick={() => { del(editId); resetForm(); }}
                  className="font-dm text-sm text-red-400 hover:text-red-600 px-3 py-2">Eliminar</button>
              )}
              <button onClick={resetForm} className="font-dm text-sm text-gray-400 hover:text-gray-700 px-3 py-2">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FeedbackBox: estado local para evitar pérdida de foco en Android ──────────
function FeedbackBox({ initialValue, onSave, onCancel }: {
  initialValue: string; onSave: (v: string) => void; onCancel: () => void;
}) {
  const GU = '#db2777';
  const [draft, setDraft] = useState(initialValue);
  return (
    <div className="mt-2 flex flex-col gap-2">
      <textarea value={draft} rows={3} autoFocus
        onChange={e => setDraft(e.target.value)}
        placeholder="Escribi los cambios que queres hacer..."
        className="w-full px-3 py-2 rounded-xl border font-dm text-xs outline-none resize-none"
        style={{ borderColor: '#fbcfe8', background: 'white', color: '#1f2937', WebkitTextFillColor: '#1f2937' }} />
      <div className="flex gap-2">
        <button onClick={() => onSave(draft)}
          className="font-dm text-xs font-semibold px-3 py-1.5 rounded-xl text-white" style={{ background: GU }}>Guardar</button>
        <button onClick={onCancel} className="font-dm text-xs text-gray-400 hover:text-gray-700 px-2 py-1.5">Cancelar</button>
      </div>
    </div>
  );
}

// ── GUPostCard (fuera del componente para evitar re-montaje) ──────────────────
function GUPostCard({ post, expandGuion, setExpandGuion, expandFeedback, setExpandFeedback, onEdit, onEstado, onRevisado, onFeedback }: {
  post: Post;
  expandGuion: number | null; setExpandGuion: (id: number | null) => void;
  expandFeedback: number | null; setExpandFeedback: (id: number | null) => void;
  onEdit: (p: Post) => void;
  onEstado: (id: number, e: string) => void;
  onRevisado: (p: Post) => void;
  onFeedback: (id: number, fb: string) => void;
}) {
  const GU = '#db2777';
  const GU_V = '#7c3aed';
  const fechas = parseFechas(post.fechas_prog);
  return (
    <div className="rounded-2xl p-4 flex gap-3" style={{ background: post.revisado ? '#f0fdf4' : '#fdf2f8', border: `1.5px solid ${post.revisado ? '#bbf7d0' : '#fbcfe8'}` }}>
      {post.imagen && (
        <img src={post.imagen} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" style={{ border: '1px solid #fbcfe8' }} />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 justify-between mb-1">
          <h3 className="font-dm text-sm font-semibold text-gray-800">{post.titulo}</h3>
          <select value={post.estado} onChange={e => onEstado(post.id, e.target.value)}
            className="font-dm text-[10px] font-semibold rounded-full px-2 py-0.5 border outline-none cursor-pointer shrink-0"
            style={{ background: ESTADO_BG[post.estado] || '#f3f4f6', color: ESTADO_FG[post.estado] || '#6b7280', borderColor: 'transparent' }}>
            {ESTADOS.map(e => <option key={e} value={e}>{ESTADO_LABEL[e]}</option>)}
          </select>
        </div>
        {post.caption && <p className="font-dm text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">{post.caption}</p>}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {fechas.map(d => (
            <span key={d} className="font-dm text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#fce7f3', color: '#be185d' }}>{formatAR(d)}</span>
          ))}
          <span className="font-dm text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{post.formato}</span>
          <span className="font-dm text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{post.pilar}</span>
          {post.tipo_grabacion && (
            <span className="font-dm text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={post.tipo_grabacion === 'tami_obra' ? { background: '#fef3c7', color: '#92400e' } : post.tipo_grabacion === 'camara' ? { background: '#ede9fe', color: '#7c3aed' } : { background: '#f0f9ff', color: '#0369a1' }}>
              {post.tipo_grabacion === 'tami_obra' ? 'Grabar en obra' : post.tipo_grabacion === 'camara' ? 'Camara a cara' : 'Diseno'}
            </span>
          )}
          {post.link_drive && <a href={post.link_drive} target="_blank" rel="noreferrer" className="font-dm text-[10px] underline" style={{ color: GU_V }}>Drive</a>}
        </div>

        {post.guion && (
          <div className="mb-2">
            <button onClick={() => setExpandGuion(expandGuion === post.id ? null : post.id)}
              className="font-dm text-[11px] font-semibold transition-colors" style={{ color: GU_V }}>
              {expandGuion === post.id ? 'Ocultar guion' : 'Ver guion completo'}
            </button>
            {expandGuion === post.id && (
              <pre className="mt-2 font-dm text-[11px] text-gray-600 whitespace-pre-wrap leading-relaxed p-3 rounded-xl max-h-64 overflow-y-auto"
                style={{ background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
                {post.guion}
              </pre>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid #fbcfe8' }}>
          <button onClick={() => onRevisado(post)}
            className="font-dm text-[11px] font-semibold px-3 py-1 rounded-full border transition-all"
            style={post.revisado
              ? { background: '#dcfce7', borderColor: '#bbf7d0', color: '#166534' }
              : { background: '#f9fafb', borderColor: '#e5e7eb', color: '#6b7280' }}>
            {post.revisado ? 'Revisado' : 'Marcar revisado'}
          </button>
          <button onClick={() => {
            setExpandFeedback(expandFeedback === post.id ? null : post.id);
          }}
            className="font-dm text-[11px] transition-colors"
            style={{ color: post.feedback ? GU : '#9ca3af' }}>
            {post.feedback ? 'Ver cambios' : 'Pedir cambios'}
          </button>
          <button onClick={() => onEdit(post)} className="font-dm text-[10px] text-gray-400 hover:text-gray-700 ml-auto">Editar</button>
        </div>

        {expandFeedback === post.id && (
          <FeedbackBox
            initialValue={post.feedback || ''}
            onSave={v => { onFeedback(post.id, v); setExpandFeedback(null); }}
            onCancel={() => setExpandFeedback(null)}
          />
        )}
        {expandFeedback !== post.id && post.feedback && (
          <div className="mt-2 rounded-xl px-3 py-2" style={{ background: '#fce7f3', border: '1px solid #fbcfe8' }}>
            <p className="font-dm text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: GU }}>Cambios solicitados</p>
            <p className="font-dm text-xs text-gray-600 whitespace-pre-line">{post.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}


