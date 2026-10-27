'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Carta: Cubic sube el PDF de cada carta y la IA actualiza la carta online (cubicmza.netlify.app/cafeteria y /resto).

type CartaId = 'cafeteria' | 'resto';
const CARTAS: { id: CartaId; nombre: string; url: string }[] = [
  { id: 'cafeteria', nombre: 'Cafetería & brunch', url: 'https://cubicmza.netlify.app/cafeteria' },
  { id: 'resto', nombre: 'Resto & bar', url: 'https://cubicmza.netlify.app/resto' },
];
interface Estado { actualizado: string | null; archivo: string; secciones: number; productos: number; historial: { id: number; creado: string; archivo: string; nota: string }[] }
interface Resultado { productos: number; antes: number; secciones: number; cambios: { n: string; sec: string; antes: number | null; ahora: number | null }[]; nuevos: string[]; quitados: string[] }

const plata = (v: number | null) => (v == null ? '—' : '$ ' + v.toLocaleString('es-AR'));
const fechaHora = (iso: string) => new Date(iso).toLocaleString('es-AR', { timeZone: 'America/Argentina/Mendoza', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

function TarjetaCarta({ c, estado, alCambiar }: { c: (typeof CARTAS)[number]; estado?: Estado; alCambiar: () => void }) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [trabajando, setTrabajando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [error, setError] = useState('');
  const [res, setRes] = useState<Resultado | null>(null);
  const [deshecho, setDeshecho] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!trabajando) return;
    setSegundos(0);
    const t = setInterval(() => setSegundos(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [trabajando]);

  function elegir(f?: File | null) {
    setError(''); setRes(null); setDeshecho(false);
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Tiene que ser un PDF'); return; }
    setArchivo(f);
  }

  async function actualizar() {
    if (!archivo) return;
    setTrabajando(true); setError(''); setRes(null);
    try {
      const fd = new FormData();
      fd.append('carta', c.id); fd.append('pdf', archivo);
      const r = await fetch('/api/admin/carta-pdf', { method: 'POST', body: fd });
      const d = await r.json().catch(() => ({ error: 'Tardó demasiado o se cortó la conexión. Probá de nuevo.' }));
      if (!r.ok || d.error) throw new Error(d.error || 'No se pudo actualizar');
      setRes(d); setArchivo(null); alCambiar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar');
    }
    setTrabajando(false);
  }

  async function deshacer() {
    setTrabajando(true); setError('');
    try {
      const r = await fetch('/api/admin/carta-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'deshacer', carta: c.id }) });
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error);
      setRes(null); setDeshecho(true); alCambiar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo deshacer');
    }
    setTrabajando(false);
  }

  return (
    <section className="rounded-2xl bg-cubic-card border border-cubic-border p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bebas text-3xl tracking-widest leading-none">{c.nombre.toUpperCase()}</h2>
          <p className="font-dm text-xs text-cubic-muted mt-2">
            {estado
              ? estado.actualizado
                ? <>Actualizada el {fechaHora(estado.actualizado)}{estado.archivo && <> · {estado.archivo}</>} · {estado.productos} productos</>
                : <>Todavía no subieron un PDF · {estado.productos} productos</>
              : 'Cargando…'}
          </p>
        </div>
        <a href={c.url} target="_blank" rel="noopener" className="shrink-0 font-dm text-xs text-cubic-muted hover:text-cubic-accent border border-cubic-border rounded-lg px-3 py-1.5">Ver carta ↗</a>
      </div>

      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={e => { e.preventDefault(); setArrastrando(true); }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={e => { e.preventDefault(); setArrastrando(false); elegir(e.dataTransfer.files?.[0]); }}
        disabled={trabajando}
        className={`rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${arrastrando ? 'border-cubic-accent bg-cubic-accent/10' : 'border-cubic-border hover:border-cubic-muted'}`}
      >
        <div className="text-3xl">📄</div>
        <p className="font-dm text-sm mt-2">{archivo ? <b>{archivo.name}</b> : <>Tocá acá o arrastrá el <b>PDF de la carta</b></>}</p>
        <p className="font-dm text-xs text-cubic-muted mt-1">{archivo ? `${(archivo.size / 1024).toFixed(0)} KB · tocá para cambiarlo` : 'el mismo PDF que mandan a imprimir'}</p>
      </button>
      <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={e => { elegir(e.target.files?.[0]); e.target.value = ''; }} />

      <button onClick={actualizar} disabled={!archivo || trabajando} className="w-full py-4 rounded-xl bg-cubic-accent text-[#0F0D14] font-bebas text-2xl tracking-widest disabled:opacity-30">
        {trabajando && archivo ? `LEYENDO LA CARTA… ${segundos}s` : 'ACTUALIZAR CARTA'}
      </button>
      {trabajando && archivo && <p className="font-dm text-xs text-cubic-muted text-center -mt-2">La IA está pasando el PDF a la carta online. Puede tardar uno o dos minutos, no cierres esta pantalla.</p>}

      {error && <p className="font-dm text-sm rounded-lg px-4 py-3 bg-red-500/10 text-red-300 border border-red-500/20">{error}</p>}
      {deshecho && <p className="font-dm text-sm rounded-lg px-4 py-3 bg-[#2D2840] text-white">Listo, volvió a estar publicada la versión anterior.</p>}

      {res && (
        <div className="rounded-xl bg-[#1A1721] border border-cubic-border p-4 flex flex-col gap-3">
          <p className="font-dm text-sm text-cubic-accent font-bold">✓ Carta actualizada y publicada · {res.secciones} secciones · {res.productos} productos</p>
          {res.productos < res.antes * 0.7 && (
            <p className="font-dm text-sm rounded-lg px-3 py-2 bg-amber-500/10 text-amber-200 border border-amber-500/20">Ojo: antes había {res.antes} productos y ahora {res.productos}. Revisá la carta; si algo no está bien, tocá Deshacer.</p>
          )}
          {res.cambios.length > 0 && (
            <div>
              <p className="font-bebas tracking-widest text-cubic-muted text-sm">PRECIOS QUE CAMBIARON ({res.cambios.length})</p>
              <ul className="mt-1 divide-y divide-cubic-border max-h-72 overflow-auto">
                {res.cambios.map((x, i) => (
                  <li key={i} className="py-1.5 flex justify-between gap-3 font-dm text-sm">
                    <span className="min-w-0 truncate">{x.n} <span className="text-cubic-muted text-xs">· {x.sec}</span></span>
                    <span className="shrink-0 tabular-nums"><span className="text-cubic-muted line-through">{plata(x.antes)}</span> → <b>{plata(x.ahora)}</b></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {res.nuevos.length > 0 && <p className="font-dm text-sm"><span className="font-bebas tracking-widest text-cubic-muted">NUEVOS:</span> {res.nuevos.join(', ')}</p>}
          {res.quitados.length > 0 && <p className="font-dm text-sm"><span className="font-bebas tracking-widest text-cubic-muted">YA NO ESTÁN:</span> {res.quitados.join(', ')}</p>}
          {!res.cambios.length && !res.nuevos.length && !res.quitados.length && <p className="font-dm text-sm text-cubic-muted">No cambió ningún precio ni producto.</p>}
          <div className="flex gap-2">
            <a href={c.url} target="_blank" rel="noopener" className="flex-1 text-center py-3 rounded-xl border border-cubic-border font-bebas text-lg tracking-widest">VER CÓMO QUEDÓ</a>
            <button onClick={deshacer} disabled={trabajando} className="flex-1 py-3 rounded-xl border border-red-500/30 text-red-300 font-bebas text-lg tracking-widest">DESHACER</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function CartaPdfPanel() {
  const [estado, setEstado] = useState<Record<CartaId, Estado> | null>(null);
  const cargar = () => fetch('/api/admin/carta-pdf').then(r => r.json()).then(d => !d.error && setEstado(d)).catch(() => {});
  useEffect(() => { cargar(); }, []);

  return (
    <div className="min-h-screen bg-cubic-bg text-white">
      <header className="border-b border-cubic-border px-5 py-4 flex items-center justify-between">
        <Link href="/admin" className="font-dm text-xs text-cubic-muted hover:text-white tracking-widest uppercase">← Panel</Link>
        <span className="font-bebas text-2xl tracking-widest">CARTA</span>
        <span className="w-12" />
      </header>
      <main className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
        <p className="font-dm text-sm text-cubic-muted">Cuando cambien precios o productos, subí el PDF nuevo de la carta y tocá <b className="text-white">Actualizar</b>. La carta online se actualiza sola y te muestra qué cambió.</p>
        {CARTAS.map(c => <TarjetaCarta key={c.id} c={c} estado={estado?.[c.id]} alCambiar={cargar} />)}
      </main>
    </div>
  );
}
