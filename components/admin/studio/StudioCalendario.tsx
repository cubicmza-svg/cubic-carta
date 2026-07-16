'use client';

import { useState, useEffect, useCallback } from 'react';

type EventType = 'campaign' | 'special' | 'post' | 'promo' | 'other';

interface CalEvent {
  name: string;
  type: EventType;
}

interface CalState {
  [dayKey: string]: CalEvent[];
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

function loadEvents(): CalState {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('cubic_cal') || '{}'); } catch { return {}; }
}
function saveEvents(state: CalState) {
  localStorage.setItem('cubic_cal', JSON.stringify(state));
}

export default function StudioCalendario() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<CalState>({});
  const [modal, setModal]   = useState<{ day: number; idx: number | null } | null>(null);
  const [evName, setEvName] = useState('');
  const [evType, setEvType] = useState<EventType>('campaign');

  useEffect(() => { setEvents(loadEvents()); }, []);

  const changeMonth = (dir: number) => {
    setMonth((m) => {
      const nm = m + dir;
      if (nm < 0)  { setYear((y) => y - 1); return 11; }
      if (nm > 11) { setYear((y) => y + 1); return 0; }
      return nm;
    });
  };

  const openModal = useCallback((day: number, idx: number | null) => {
    const key = `${year}-${month}-${day}`;
    const dayEvents = events[key] || [];
    if (idx !== null && dayEvents[idx]) {
      setEvName(dayEvents[idx].name);
      setEvType(dayEvents[idx].type);
    } else {
      setEvName('');
      setEvType('campaign');
    }
    setModal({ day, idx });
  }, [events, year, month]);

  const saveEvent = () => {
    if (!evName.trim() || !modal) return;
    const key = `${year}-${month}-${modal.day}`;
    const updated = { ...events };
    if (!updated[key]) updated[key] = [];
    if (modal.idx !== null) {
      updated[key][modal.idx] = { name: evName.trim(), type: evType };
    } else {
      updated[key] = [...updated[key], { name: evName.trim(), type: evType }];
    }
    setEvents(updated);
    saveEvents(updated);
    setModal(null);
  };

  const deleteEvent = () => {
    if (!modal || modal.idx === null) return;
    const key = `${year}-${month}-${modal.day}`;
    const updated = { ...events };
    updated[key] = (updated[key] || []).filter((_, i) => i !== modal.idx);
    if (!updated[key].length) delete updated[key];
    setEvents(updated);
    saveEvents(updated);
    setModal(null);
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  // Events list for this month
  const monthEvents: { day: number; ev: CalEvent }[] = [];
  for (const key in events) {
    const [ky, km, kd] = key.split('-').map(Number);
    if (ky === year && km === month) {
      (events[key] || []).forEach((ev) => monthEvents.push({ day: kd, ev }));
    }
  }
  monthEvents.sort((a, b) => a.day - b.day);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Cal header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bebas text-3xl tracking-widest text-white">
          {MONTHS_ES[month]} <span className="text-cubic-muted text-2xl">{year}</span>
        </h2>
        <div className="flex gap-2">
          <button onClick={() => changeMonth(-1)}
            className="w-9 h-9 rounded-lg bg-cubic-card border border-cubic-border text-white flex items-center justify-center hover:border-cubic-accent transition-colors text-lg">
            ‹
          </button>
          <button onClick={() => changeMonth(1)}
            className="w-9 h-9 rounded-lg bg-cubic-card border border-cubic-border text-white flex items-center justify-center hover:border-cubic-accent transition-colors text-lg">
            ›
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAYS_ES.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold tracking-widest text-cubic-muted uppercase pb-2">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const key = `${year}-${month}-${d}`;
          const dayEvs = events[key] || [];
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
          return (
            <div
              key={d}
              onClick={() => openModal(d, null)}
              className={`min-h-[70px] p-1.5 rounded-lg bg-cubic-card border cursor-pointer transition-all duration-150 flex flex-col gap-1 hover:border-cubic-accent/60 ${
                isToday ? 'border-cubic-accent' : 'border-cubic-border'
              }`}
            >
              <span className={`text-xs font-bold font-dm leading-none ${
                isToday
                  ? 'w-5 h-5 bg-cubic-accent text-black rounded-full flex items-center justify-center text-[10px]'
                  : 'text-white'
              }`}>
                {d}
              </span>
              {dayEvs.slice(0, 3).map((ev, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); openModal(d, idx); }}
                  className={`text-[9px] font-semibold rounded px-1 py-0.5 text-left leading-tight truncate w-full ${TYPE_COLORS[ev.type]}`}
                >
                  {ev.name}
                </button>
              ))}
              {dayEvs.length > 3 && (
                <span className="text-[9px] text-cubic-muted">+{dayEvs.length - 3} más</span>
              )}
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
      {monthEvents.length > 0 && (
        <div className="mt-8 border-t border-cubic-border pt-6">
          <p className="font-bebas text-xs tracking-widest text-cubic-muted uppercase mb-3">
            Eventos de {MONTHS_ES[month]}
          </p>
          <div className="flex flex-col divide-y divide-cubic-border">
            {monthEvents.map(({ day, ev }, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <span className="font-dm text-xs text-cubic-muted w-5 tabular-nums font-bold">
                  {String(day).padStart(2, '0')}
                </span>
                <span className="font-dm text-sm text-white flex-1">{ev.name}</span>
                <span className={`text-[10px] font-semibold rounded px-2 py-0.5 ${TYPE_COLORS[ev.type]}`}>
                  {TYPE_LABELS[ev.type]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(10,8,18,0.88)', backdropFilter: 'blur(6px)' }}
          onClick={() => setModal(null)}
        >
          <div
            className="bg-cubic-card border border-cubic-border rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bebas text-xl tracking-widest text-white">
              {modal.idx !== null ? 'Editar evento' : 'Nuevo evento'}
            </h3>
            <p className="font-dm text-xs text-cubic-accent">
              {String(modal.day).padStart(2,'0')} de {MONTHS_ES[month]} {year}
            </p>

            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Tipo</label>
              <select
                value={evType}
                onChange={(e) => setEvType(e.target.value as EventType)}
                className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent"
              >
                {(Object.entries(TYPE_LABELS) as [EventType, string][]).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-dm text-[10px] text-cubic-muted uppercase tracking-widest">Nombre</label>
              <input
                type="text"
                value={evName}
                onChange={(e) => setEvName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEvent()}
                autoFocus
                placeholder="Ej: Lanzamiento menú invierno"
                className="bg-cubic-bg border border-cubic-border rounded-lg text-white font-dm text-sm px-3 py-2 outline-none focus:border-cubic-accent placeholder:text-cubic-muted"
              />
            </div>

            <div className="flex gap-2 justify-end mt-1">
              {modal.idx !== null && (
                <button onClick={deleteEvent}
                  className="font-dm text-sm px-4 py-2 rounded-lg border border-pink-500/30 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 transition-colors mr-auto">
                  Eliminar
                </button>
              )}
              <button onClick={() => setModal(null)}
                className="font-dm text-sm px-4 py-2 rounded-lg border border-cubic-border text-cubic-muted hover:text-white transition-colors">
                Cancelar
              </button>
              <button onClick={saveEvent}
                className="font-dm text-sm font-semibold px-5 py-2 rounded-lg bg-cubic-accent text-black hover:bg-green-400 transition-colors">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
