'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Notif {
  id: number;
  titulo: string;
  cuerpo: string;
  portal: string;
  url: string;
  leido: boolean;
  creado_el: string;
}

const PORTAL_EMOJI: Record<string, string> = {
  glowup: '🌸', bigbang: '🎯', cubic: '🍸', all: '📢',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const VAPID_PUBLIC = 'BDfQCVOrQoRsSXEYA05rVRoalgOfXrUvVpKrg0VQCsgty4kUL1UfIdeyovwdKVlvuXWNjoMW5pDJwT3RH669mWA';

async function subscribePush(portal: string) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  const reg = await navigator.serviceWorker.ready;
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') return;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
  });
  await fetch('/api/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub, portal }),
  });
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export default function BellNotif({ portal, accentColor }: { portal: string; accentColor: string }) {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [pushOk, setPushOk] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/notificaciones');
      if (r.ok) setNotifs(await r.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
      // Check if already subscribed
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) setPushOk(true);
        }).catch(() => {});
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter(n => !n.leido).length;

  async function handleOpen() {
    setOpen(o => !o);
    if (!open && unread > 0) {
      await fetch('/api/notificaciones', { method: 'PATCH' });
      setNotifs(prev => prev.map(n => ({ ...n, leido: true })));
    }
  }

  async function handlePush() {
    await subscribePush(portal);
    setPushOk(true);
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-full transition-all hover:opacity-80"
        style={{ background: open ? accentColor + '22' : 'transparent' }}>
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center font-dm text-[10px] font-bold text-white px-1"
            style={{ background: accentColor }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-xl border z-50 overflow-hidden"
          style={{ background: '#fff', borderColor: '#e5e7eb' }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#f3f4f6' }}>
            <span className="font-dm text-sm font-bold text-gray-800">Notificaciones</span>
            {!pushOk && (
              <button onClick={handlePush}
                className="font-dm text-xs px-3 py-1 rounded-full text-white"
                style={{ background: accentColor }}>
                Activar push 🔔
              </button>
            )}
            {pushOk && <span className="font-dm text-xs text-green-600">Push activado ✓</span>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 && (
              <p className="font-dm text-sm text-gray-400 text-center py-8">Sin notificaciones</p>
            )}
            {notifs.map(n => (
              <a key={n.id} href={n.url}
                className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b cursor-pointer block"
                style={{ borderColor: '#f9fafb', background: n.leido ? '#fff' : accentColor + '08' }}>
                <span className="text-lg mt-0.5 flex-shrink-0">{PORTAL_EMOJI[n.portal] || '📢'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-dm text-sm font-semibold text-gray-800 leading-snug">{n.titulo}</p>
                  {n.cuerpo && <p className="font-dm text-xs text-gray-500 mt-0.5 leading-snug truncate">{n.cuerpo}</p>}
                  <p className="font-dm text-[10px] text-gray-400 mt-1">{timeAgo(n.creado_el)}</p>
                </div>
                {!n.leido && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: accentColor }} />}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
