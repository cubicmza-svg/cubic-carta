'use client';

import { useState, useEffect, useCallback } from 'react';

type EventType = 'campaign' | 'special' | 'post' | 'promo' | 'other';

interface CalEvent {
  id: number; year: number; month: number; day: number; nombre: string; tipo: EventType;
}
interface Campana {
  id: number; nombre: string; fecha_inicio: string; fecha_fin: string;
  idea: string; eje: string; productos: string; tipo: string;
}
interface MenuItem { id: number; nombre: string; categoria: string; subcategoria: string; precio: number; }

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const TYPE_LABELS: Record<EventType, string> = {
  campaign: 'Campaña', special: 'Fecha especial', post: 'Publicación', promo: 'Promo', other: 'Otro',
};
const TYPE_COLORS: Record<EventType, string> = {
  campaign: 'bg-violet-500/20 text-violet-300',
  special:  'bg-pink-500/20 text-pink-300',
  post:     'bg-green-500/20 text-green-300',
  promo:    'bg-orange-500/20 text-orange-300',
  other:    'bg-sky-500/20 text-sky-300',
};
const CAMPANA_COLORS = [
  'bg-violet-500/25 border-violet-500/50 text-violet-200',
  'bg-rose-500/25 border-rose-500/50 text-rose-200',
  'bg-amber-500/25 border-amber-500/50 text-amber-200',
  'bg-teal-500/25 border-teal-500/50 text-teal-200',
  'bg-sky-500/25 border-sky-500/50 text-sky-200',
];

function toDate(iso: string) { return new Date(iso + 'T12:00:00'); }
function isoFromYMD(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

export default function StudioCalendario() {
  const now = new Date();
  const [year, setYear]     = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // modal evento puntual
  const [evModal, setEvModal] = useState<{ day: number; event: CalEvent | null } | null>(null);
  const [evName, setEvName]   = useState('');
  const [evType, setEvType]   = useState<EventType>('campaign');
  const [evSaving, setEvSaving] = useState(false);

  // modal campaña
  const [campModal, setCampModal] = useState<Campana | null | 'new'>(null);
  const [campForm, setCampForm] = useState({
    nombre: '', fecha_inicio: '', fecha_fin: '',
    idea: '', eje: '', productos: [] as string[], tipo: 'campaign',
  });
  const [prodInput, setProdInput] = useState('');
  const [campSaving, setCampSaving] = useState(false);

  // vista: 'calendar' | 'campanas'
  const [vista, setVista] = useState<'calendar' | 'campanas'>('calendar');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, campRes, itemsRes] = await Promise.all([
        fetch('/api/admin/studio/eventos'),
        fetch('/api/admin/studio/campanas'),
        fetch('/api/admin/items'),
      ]);
      if (evRes.ok)    setEvents(await evRes.json());
      if (campRes.ok)  setCampanas(await campRes.json());
      if (itemsRes.ok) setMenuItems(await itemsRes.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const changeMonth = (dir: number) => {
    setMonth((m) => {
      const nm = m + dir;
      if (nm < 0)  { setYear((y) => y - 1); return 11; }
      if (nm > 11) { setYear((y) => y + 1); return 0; }
      return nm;
    });
  };

  // ── Evento puntual ──
  const openEvModal = (day: number, event: CalEvent | null) => {
    setEvName(event?.nombre ?? ''); setEvType(event?.tipo ?? 'campaign');
    setEvModal({ day, event });
  };
  const saveEv = async () => {
    if (!evName.trim() || evSaving || !evModal) return;
    setEvSaving(true);
    try {
      if (evModal.event) {
        await fetch(`/api/admin/studio/eventos/${evModal.event.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: evName.trim(), tipo: evType }),
        });
      } else {
        await fetch('/api/admin/studio/eventos', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year, month, day: evModal.day, nombre: evName.trim(), tipo: evType }),
        });
      }
      await fetchAll(); setEvModal(null);
    } finally { setEvSaving(false); }
  };
  const deleteEv = async () => {
    if (!evModal?.event || evSaving) return;
    setEvSaving(true);
    try {
      await fetch(`/api/admin/studio/eventos/${evModal.event.id}`, { method: 'DELETE' });
      await fetchAll(); setEvModal(null);
    } finally { setEvSaving(false); }
  };

  // ── Campaña ──
  const openNewCamp = () => {
    setCampForm({ nombre: '', fecha_inicio: '', fecha_fin: '', idea: '', eje: '', productos: [], tipo: 'campaign' });
    setProdInput(''); setCampModal('new');
  };
  const openEditCamp = (c: Campana) => {
    setCampForm({
      nombre: c.nombre, fecha_inicio: c.fecha_inicio.split('T')[0], fecha_fin: c.fecha_fin.split('T')[0],
      idea: c.idea, eje: c.eje, productos: JSON.parse(c.productos || '[]'), tipo: c.tipo,
    });
    setProdInput(''); setCampModal(c);
  };
  const addProd = (text: string) => {
    const t = text.trim();
    if (!t || campForm.productos.includes(t)) return;
    setCampForm({ ...campForm, productos: [...campForm.productos, t] });
    setProdInput('');
  };
  const removeProd = (p: string) => setCampForm({ ...campForm, productos: campForm.productos.filter((x) => x !== p) });

  const saveCamp = async () => {
    if (!campForm.nombre.trim() || !campForm.fecha_inicio || !campForm.fecha_fin || campSaving) return;
    setCampSaving(true);
    try {
      const body = { ...campForm, nombre: campForm.nombre.trim(), productos: JSON.stringify(campForm.productos) };
      if (campModal !== 'new' && campModal) {
        await fetch(`/api/admin/studio/campanas/${campModal.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      } else {
        await fetch('/api/admin/studio/campanas', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      }
      await fetchAll(); setCampModal(null);
    } finally { setCampSaving(false); }
  };
  const deleteCamp = async () => {
    if (campModal === 'new' || !campModal || campSaving) return;
    setCampSaving(true);
    try {
      await fetch(`/api/admin/studio/campanas/${campModal.id}`, { method: 'DELETE' });
      await fetchAll(); setCampModal(null);
    } finally { setCampSaving(false); }
  };

  // ── Render del calendario ──
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();
  const eventsThisMonth = events.filter((e) => e.year === year && e.month === month);

  // Campañas que tocan este mes
  const campanasMes = campanas.filter((c) => {
    const start = toDate(c.fecha_inicio.split('T')[0]);
    const end   = toDate(c.fecha_fin.split('T')[0]);
    const mStart = new Date(year, month, 1);
    const mEnd   = new Date(year, month + 1, 0);
    return start <= mEnd && end >= mStart;
  });

  function dayEvents(d: number) { return eventsThisMonth.filter((e) => e.day === d); }
  function dayCampanas(d: number) {
    const iso = isoFromYMD(year, month, d);
    return campanasMes.filter((c) => {
      const di = c.fecha_inicio.split('T')[0];
      const df = c.fecha_fin.split('T')[0];
      return iso >= di && iso <= df;
    });
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-bebas text-3xl tracking-widest text-white">
            {MONTHS_ES[month]} <span className="text-cubic-muted text-2xl">{year}</span>
          </h2>
          {loading && <span className="font-dm text-xs text-cubic-muted">Cargando…</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openNewCamp}
            className="font-dm text-sm font-semibold px-4 py-2 rounded-lg border border-violet-500/40 text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 transition-colors">
            + Campaña
          </button>
          <button onClick={() => changeMonth(-1)}
            className="w-9 h-9 rounded-lg bg-cubic-card border border-cubic-border text-white flex items-center justify-center hover:border-cubic-accent transition-colors text-lg">‹</button>
          <button onClick={() => changeMonth(1)}
            className="w-9 h-9 rounded-lg bg-cubic-card border border-cubic-border text-white flex items-center justify-center hover:border-cubic-accent transition-colors text-lg">›</button>
        </div>
      </div>

      {/* Campañas del mes — pills */}
      {campanasMes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {campanasMes.map((c, i) => (
            <button key={c.id} onClick={() => openEditCamp(c)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-dm font-semibold transition-all hover:opacity-90 ${CAMPANA_COLORS[i % CAMPANA_COLORS.length]}`}>
              <span>🎯</span>
              <span>{c.nombre}</span>
              <span className="opacity-60 font-normal">
                {c.fecha_inicio.split('T')[0].split('-').slice(1).reverse().join('/')} → {c.fecha_fin.split('T')[0].split('-').slice(1).reverse().join('/')}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Grilla del calendario */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS_ES.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold tracking-widest text-cubic-muted uppercase pb-2">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const devs  = dayEvents(d);
          const dcamps = dayCampanas(d);
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
          return (
            <div key={d} onClick={() => openEvModal(d, null)}
              className={`min-h-[72px] p-1.5 rounded-lg bg-cubic-card border cursor-pointer transition-all duration-150 flex flex-col gap-1 hover:border-cubic-accent/60 ${isToday ? 'border-cubic-accent' : dcamps.length > 0 ? 'border-violet-500/30' : 'border-cubic-border'}`}>
              <span className={`text-xs font-bold font-dm leading-none ${isToday ? 'w-5 h-5 bg-cubic-accent text-black rounded-full flex items-center justify-center text-[10px]' : 'text-white'}`}>
                {d}
              </span>
              {/* Indicadores de campaña */}
              {dcamps.slice(0, 2).map((c, i) => (
                <button key={c.id} onClick={(e) => { e.stopPropagation(); openEditCamp(c); }}
                  className={`text-[8px] font-bold rounded px-1 py-0.5 text-left leading-tight truncate w-full border ${CAMPANA_COLORS[campanas.indexOf(c) % CAMPANA_COLORS.length]}`}>
                  🎯 {c.nombre}
                </button>
              ))}
              {/* Eventos puntuales */}
              {devs.slice(0, 2).map((ev) => (
                <button key={ev.id} onClick={(e) => { e.stopPropagation(); openEvModal(d, ev); }}
                  className={`text-[9px] font-semibold rounded px-1 py-0.5 text-left leading-tight truncate w-full ${TYPE_COLORS[ev.tipo]}`}>
                  {ev.nombre}
                </button>
              ))}
              {(devs.length + dcamps.length) > 4 && <span className="text-[8px] text-cubic-muted">+{devs.length + dcamps.length - 4}</span>}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 mt-5">
        <span className="flex items-center gap-1.5 text-xs text-cubic-muted"><span className="w-2 h-2 rounded-sm bg-violet-500/40 inline-block" />Campaña activa</span>
        {(Object.entries(TYPE_LABELS) as [EventType, string][]).map(([type, label]) => (
          <span key={type} className="flex items-center gap-1.5 text-xs text-cubic-muted">
            <span className={`w-2 h-2 rounded-sm inline-block ${TYPE_COLORS[type].split(' ')[0]}`} />{label}
          </span>
        ))}
      </div>

      {/* Lista de eventos del mes */}
      {eventsThisMonth.length > 0 && (
        <div className="mt-8 border-t border-cubic-border pt-6">
          <p className="font-bebas text-xs tracking-widest text-cubic-muted uppercase mb-3">Eventos de {MONTHS_ES[month]}</p>
          <div className="flex flex-col divide-y divide-cubic-border">
            {[...eventsThisMonth].sort((a,b) => a.day - b.day).map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 py-2.5">
                <span className="font-dm text-xs text-cubic-muted w-5 tabular-nums font-bold">{String(ev.day).padStart(2,'0')}</span>
                <span className="font-dm text-sm text-white flex-1">{ev.nombre}</span>
                <span className={`text-[10px] font-semibold rounded px-2 py-0.5 ${TYPE_COLORS[ev.tipo]}`}>{TYPE_LABELS[ev.tipo]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal evento puntual ── */}
      {evModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,8,18,0.88)', backdropFilter: 'blur(6px)' }}
          onClick={() => setEvModal(null)}>
          <div className="bg-cubic-card border border-cubic-border rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest text-white">{evModal.event ? 'Editar evento' : 'Nuevo evento'}</h3>
            <p className="font-dm text-xs text-cubic-accent">{String(evModal.day).padStart(2,'0')} de {MONTHS_ES[month]} {year}</p>
            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Tipo</label>
              <select value={evType} onChange={(e) => setEvType(e.target.value as EventType)}
                className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent">
                {(Object.entries(TYPE_LABELS) as [EventType, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Nombre</label>
              <input type="text" value={evName} onChange={(e) => setEvName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEv()} autoFocus
                placeholder="Ej: Cerrado por feriado"
                className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted" />
            </div>
            <div className="flex gap-2 justify-end mt-1">
              {evModal.event && (
                <button onClick={deleteEv} disabled={evSaving}
                  className="font-dm text-sm px-4 py-2 rounded-lg border border-pink-500/30 text-pink-400 bg-pink-500/10 mr-auto">Eliminar</button>
              )}
              <button onClick={() => setEvModal(null)}
                className="font-dm text-sm px-4 py-2 rounded-lg border border-cubic-border text-cubic-muted hover:text-white transition-colors">Cancelar</button>
              <button onClick={saveEv} disabled={evSaving}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-lg bg-cubic-accent text-black hover:bg-green-400 transition-colors disabled:opacity-50">
                {evSaving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal campaña ── */}
      {campModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,8,18,0.88)', backdropFilter: 'blur(6px)' }}
          onClick={() => setCampModal(null)}>
          <div className="bg-cubic-card border border-cubic-border rounded-2xl p-6 w-full max-w-lg flex flex-col gap-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest text-white">
              {campModal === 'new' ? 'Nueva campaña' : 'Editar campaña'}
            </h3>

            {/* Nombre */}
            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Nombre de la campaña</label>
              <input type="text" value={campForm.nombre} autoFocus onChange={(e) => setCampForm({ ...campForm, nombre: e.target.value })}
                placeholder="Ej: Día del Niño, Semana del café, Lanzamiento menú…"
                className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted" />
            </div>

            {/* Fechas rango */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Fecha inicio</label>
                <input type="date" value={campForm.fecha_inicio} onChange={(e) => setCampForm({ ...campForm, fecha_inicio: e.target.value })}
                  className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Fecha fin</label>
                <input type="date" value={campForm.fecha_fin} onChange={(e) => setCampForm({ ...campForm, fecha_fin: e.target.value })}
                  className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent" />
              </div>
            </div>

            {/* Eje */}
            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Eje de la campaña</label>
              <input type="text" value={campForm.eje} onChange={(e) => setCampForm({ ...campForm, eje: e.target.value })}
                placeholder="Ej: Fidelización, Awareness, Lanzamiento de producto…"
                className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted" />
            </div>

            {/* Idea */}
            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Idea / concepto</label>
              <textarea value={campForm.idea} rows={3} onChange={(e) => setCampForm({ ...campForm, idea: e.target.value })}
                placeholder="Describí la idea creativa, el tono, referencias visuales, lo que sea que tengas…"
                className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted resize-none" />
            </div>

            {/* Productos vinculados */}
            <div className="flex flex-col gap-2">
              <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Productos / ítems participantes</label>

              {/* Selector de ítems de la carta */}
              {menuItems.length > 0 && (
                <select onChange={(e) => { if (e.target.value) { addProd(e.target.value); e.target.value = ''; } }}
                  className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent">
                  <option value="">— Elegir de la carta —</option>
                  {menuItems.map((item) => (
                    <option key={item.id} value={item.nombre} disabled={campForm.productos.includes(item.nombre)}>
                      {item.nombre} · {item.subcategoria || item.categoria}
                    </option>
                  ))}
                </select>
              )}

              {/* Input libre */}
              <div className="flex gap-2">
                <input type="text" value={prodInput} onChange={(e) => setProdInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { addProd(prodInput); } }}
                  placeholder="O escribí un producto / promo nueva…"
                  className="flex-1 bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted" />
                <button onClick={() => addProd(prodInput)}
                  className="px-4 py-2 rounded-lg bg-cubic-accent text-black font-dm text-sm font-bold hover:bg-green-400 transition-colors flex-shrink-0">+</button>
              </div>

              {/* Chips de productos seleccionados */}
              {campForm.productos.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {campForm.productos.map((p) => (
                    <span key={p} className="flex items-center gap-1 bg-cubic-accent/10 border border-cubic-accent/30 text-cubic-accent rounded-full px-3 py-1 text-xs font-dm">
                      {p}
                      <button onClick={() => removeProd(p)} className="ml-1 text-cubic-muted hover:text-pink-400 transition-colors font-bold leading-none">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-1">
              {campModal !== 'new' && (
                <button onClick={deleteCamp} disabled={campSaving}
                  className="font-dm text-sm px-4 py-2 rounded-lg border border-pink-500/30 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 transition-colors mr-auto">
                  Eliminar
                </button>
              )}
              <button onClick={() => setCampModal(null)}
                className="font-dm text-sm px-4 py-2 rounded-lg border border-cubic-border text-cubic-muted hover:text-white transition-colors">Cancelar</button>
              <button onClick={saveCamp} disabled={campSaving}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-lg bg-cubic-accent text-black hover:bg-green-400 transition-colors disabled:opacity-50">
                {campSaving ? 'Guardando…' : 'Guardar campaña'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
