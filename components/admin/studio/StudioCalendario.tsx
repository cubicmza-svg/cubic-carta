'use client';

import { useState, useEffect, useCallback } from 'react';

type EventType = 'campaign' | 'special' | 'post' | 'promo' | 'other';

interface CalEvent {
  id: number;
  year: number;
  month: number;
  day: number;
  nombre: string;
  tipo: EventType;
}

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const TYPE_LABELS: Record<EventType, string> = {
  campaign: 'Campaña',
  special:  'Fecha especial',
  post:     'Publicación',
  promo:    'Promo',
  other:    'Otro',
};
const TYPE_COLORS: Record<EventType, string> = {
  campaign: 'bg-violet-500/20 text-violet-300',
  special:  'bg-pink-500/20 text-pink-300',
  post:     'bg-green-500/20 text-green-300',
  promo:    'bg-orange-500/20 text-orange-300',
  other:    'bg-sky-500/20 text-sky-300',
};

export default function StudioCalendario() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState<{ day: number; event: CalEvent | null } | null>(null);
  const [evName, setEvName] = useState('');
  const [evType, setEvType] = useState<EventType>('campaign');
  const [saving, setSaving] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/studio/eventos');
      if (res.ok) setEvents(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const changeMonth = (dir: number) => {
    setMonth((m) => {
      const nm = m + dir;
      if (nm < 0)  { setYear((y) => y - 1); return 11; }
      if (nm > 11) { setYear((y) => y + 1); return 0; }
      return nm;
    });
  };

  const openModal = (day: number, event: CalEvent | null) => {
    setEvName(event?.nombre ?? '');
    setEvType((event?.tipo as EventType) ?? 'campaign');
    setModal({ day, event });
  };

  const saveEvent = async () => {
    if (!evName.trim() || !modal || saving) return;
    setSaving(true);
    try {
      if (modal.event) {
        await fetch(`/api/admin/studio/eventos/${modal.event.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nombre: evName.trim(), tipo: evType }),
        });
      } else {
        await fetch('/api/admin/studio/eventos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year, month, day: modal.day, nombre: evName.trim(), tipo: evType }),
        });
      }
      await fetchEvents();
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async () => {
    if (!modal?.event || saving) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/studio/eventos/${modal.event.id}`, { method: 'DELETE' });
      await fetchEvents();
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();

  const eventsThisMonth = events.filter((e) => e.year === year && e.month === month);

  function dayEvents(day: number) {
    return eventsThisMonth.filter((e) => e.day === day);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bebas text-3xl tracking-widest text-white">
          {MONTHS_ES[month]} <span className="text-cubic-muted text-2xl">{year}</span>
        </h2>
        <div className="flex items-center gap-3">
          {loading && <span className="font-dm text-xs text-cubic-muted">Cargando…</span>}
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)}
              className="w-9 h-9 rounded-lg bg-cubic-card border border-cubic-border text-white flex items-center justify-center hover:border-cubic-accent transition-colors text-lg">‹</button>
            <button onClick={() => changeMonth(1)}
              className="w-9 h-9 rounded-lg bg-cubic-card border border-cubic-border text-white flex items-center justify-center hover:border-cubic-accent transition-colors text-lg">›</button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS_ES.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold tracking-widest text-cubic-muted uppercase pb-2">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const devs = dayEvents(d);
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
          return (
            <div key={d} onClick={() => openModal(d, null)}
              className={`min-h-[70px] p-1.5 rounded-lg bg-cubic-card border cursor-pointer transition-all duration-150 flex flex-col gap-1 hover:border-cubic-accent/60 ${isToday ? 'border-cubic-accent' : 'border-cubic-border'}`}>
              <span className={`text-xs font-bold font-dm leading-none ${isToday ? 'w-5 h-5 bg-cubic-accent text-black rounded-full flex items-center justify-center text-[10px]' : 'text-white'}`}>
                {d}
              </span>
              {devs.slice(0, 3).map((ev) => (
                <button key={ev.id} onClick={(e) => { e.stopPropagation(); openModal(d, ev); }}
                  className={`text-[9px] font-semibold rounded px-1 py-0.5 text-left leading-tight truncate w-full ${TYPE_COLORS[ev.tipo as EventType]}`}>
                  {ev.nombre}
                </button>
              ))}
              {devs.length > 3 && <span className="text-[9px] text-cubic-muted">+{devs.length - 3} más</span>}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-5">
        {(Object.entries(TYPE_LABELS) as [EventType, string][]).map(([type, label]) => (
          <span key={type} className="flex items-center gap-1.5 text-xs text-cubic-muted">
            <span className={`w-2 h-2 rounded-sm inline-block ${TYPE_COLORS[type].split(' ')[0]}`} />
            {label}
          </span>
        ))}
      </div>

      {/* Month event list */}
      {eventsThisMonth.length > 0 && (
        <div className="mt-8 border-t border-cubic-border pt-6">
          <p className="font-bebas text-xs tracking-widest text-cubic-muted uppercase mb-3">Eventos de {MONTHS_ES[month]}</p>
          <div className="flex flex-col divide-y divide-cubic-border">
            {[...eventsThisMonth].sort((a,b) => a.day - b.day).map((ev) => (
              <div key={ev.id} className="flex items-center gap-3 py-2.5">
                <span className="font-dm text-xs text-cubic-muted w-5 tabular-nums font-bold">{String(ev.day).padStart(2,'0')}</span>
                <span className="font-dm text-sm text-white flex-1">{ev.nombre}</span>
                <span className={`text-[10px] font-semibold rounded px-2 py-0.5 ${TYPE_COLORS[ev.tipo as EventType]}`}>{TYPE_LABELS[ev.tipo as EventType]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,8,18,0.88)', backdropFilter: 'blur(6px)' }}
          onClick={() => setModal(null)}>
          <div className="bg-cubic-card border border-cubic-border rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bebas text-xl tracking-widest text-white">
              {modal.event ? 'Editar evento' : 'Nuevo evento'}
            </h3>
            <p className="font-dm text-xs text-cubic-accent">
              {String(modal.day).padStart(2,'0')} de {MONTHS_ES[month]} {year}
            </p>
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
                onKeyDown={(e) => e.key === 'Enter' && saveEvent()} autoFocus
                placeholder="Ej: Lanzamiento menú invierno"
                className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted" />
            </div>
            <div className="flex gap-2 justify-end mt-1">
              {modal.event && (
                <button onClick={deleteEvent} disabled={saving}
                  className="font-dm text-sm px-4 py-2 rounded-lg border border-pink-500/30 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 transition-colors mr-auto">
                  Eliminar
                </button>
              )}
              <button onClick={() => setModal(null)}
                className="font-dm text-sm px-4 py-2 rounded-lg border border-cubic-border text-cubic-muted hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={saveEvent} disabled={saving}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-lg bg-cubic-accent text-black hover:bg-green-400 transition-colors disabled:opacity-50">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
