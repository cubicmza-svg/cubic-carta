'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Juego de las mesas: el mozo busca el código que le muestra el cliente y lo canjea.
// Abajo: números del día, premios con su stock (los carga Cubic), premios entregados y registrados (con exportación a CSV).

interface Cupon {
  codigo: string; tel: string; nombre: string; premio: string; titulo: string; detalle: string;
  fecha: string; vence: string; creado: string; canjeado: string | null;
}
interface Registro { tel: string; nombre: string; promos: boolean; alta: string; ultima: string; jugadas: number; premios: number }
interface Premio { id?: number; titulo: string; detalle: string; chance: number; stock: number; entregados?: number; activo: boolean }
interface Resumen { hoy: { jugadas: number; premios: number; canjeados: number }; registros: Registro[]; cupones: Cupon[]; premios: Premio[] }

const hoyMza = () => new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Mendoza' });
const fecha = (f: string) => f.split('-').reverse().slice(0, 2).join('/');
const fechaHora = (iso: string) => new Date(iso).toLocaleString('es-AR', { timeZone: 'America/Argentina/Mendoza', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const telLindo = (t: string) => t.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2-$3');
const estadoDe = (c: Cupon) => c.canjeado ? 'canjeado' : c.vence < hoyMza() ? 'vencido' : 'valido';

const ESTILO_ESTADO = {
  valido:   { txt: 'VÁLIDO',        cls: 'bg-[#4ADE80] text-[#0F0D14]' },
  canjeado: { txt: 'YA CANJEADO',   cls: 'bg-[#2D2840] text-[#9B97A8]' },
  vencido:  { txt: 'VENCIDO',       cls: 'bg-red-500/20 text-red-300' },
};

export default function JuegoPanel() {
  const [codigo, setCodigo] = useState('');
  const [cupon, setCupon] = useState<Cupon | null>(null);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; txt: string } | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [tab, setTab] = useState<'premios' | 'registrados'>('premios');
  const [filtro, setFiltro] = useState('');

  const cargarResumen = () => fetch('/api/admin/juego').then(r => r.json()).then(d => !d.error && setResumen(d)).catch(() => {});
  useEffect(() => { cargarResumen(); }, []);

  async function llamar(accion: 'ver' | 'canjear', cod = codigo) {
    if (!cod.trim()) return;
    setCargando(true); setMsg(null);
    try {
      const r = await fetch('/api/admin/juego', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion, codigo: cod }) });
      const d = await r.json();
      setCupon(d.cupon ?? null);
      if (d.error) setMsg({ tipo: 'error', txt: d.error });
      else if (accion === 'canjear') { setMsg({ tipo: 'ok', txt: '¡Listo! Premio canjeado ✓' }); cargarResumen(); }
    } catch {
      setMsg({ tipo: 'error', txt: 'No hay conexión, probá de nuevo' });
    }
    setConfirmar(false); setCargando(false);
  }

  function exportar() {
    if (!resumen) return;
    const filas = [['Nombre', 'WhatsApp', 'Acepta promos', 'Jugadas', 'Premios', 'Alta', 'Última vez']]
      .concat(resumen.registros.map(r => [r.nombre, '+549' + r.tel, r.promos ? 'sí' : 'no', String(r.jugadas), String(r.premios), fechaHora(r.alta), fechaHora(r.ultima)]));
    const csv = '﻿' + filas.map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `cubic-juego-registrados-${hoyMza()}.csv`;
    a.click();
  }

  const est = cupon ? estadoDe(cupon) : null;
  const q = filtro.toLowerCase().trim();
  const registros = (resumen?.registros ?? []).filter(r => !q || r.nombre.toLowerCase().includes(q) || r.tel.includes(q));
  const cupones = (resumen?.cupones ?? []).filter(c => !q || c.nombre.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q) || c.tel.includes(q));

  return (
    <div className="min-h-screen bg-cubic-bg text-white">
      <header className="border-b border-cubic-border px-5 py-4 flex items-center justify-between">
        <Link href="/admin" className="font-dm text-xs text-cubic-muted hover:text-white tracking-widest uppercase">← Panel</Link>
        <span className="font-bebas text-2xl tracking-widest">JUEGO <span className="text-cubic-accent">·</span> PREMIOS</span>
        <span className="w-12" />
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Canjear */}
        <section className="rounded-2xl bg-cubic-card border border-cubic-border p-5">
          <h2 className="font-bebas text-2xl tracking-widest">CANJEAR UN PREMIO</h2>
          <p className="font-dm text-sm text-cubic-muted mt-1">Pedile al cliente el código que le salió en el celu (empieza con C).</p>
          <form className="flex gap-2 mt-4" onSubmit={e => { e.preventDefault(); llamar('ver'); }}>
            <input
              value={codigo}
              onChange={e => { setCodigo(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setCupon(null); setMsg(null); setConfirmar(false); }}
              placeholder="C7K3PQ"
              maxLength={8}
              autoCapitalize="characters"
              autoComplete="off"
              className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-[#1A1721] border border-cubic-border font-mono text-2xl tracking-[.2em] uppercase placeholder-[#4a4558] focus:outline-none focus:border-cubic-accent"
            />
            <button disabled={cargando || !codigo} className="px-5 rounded-xl bg-cubic-accent text-[#0F0D14] font-bebas text-xl tracking-widest disabled:opacity-40">
              {cargando && !confirmar ? '…' : 'BUSCAR'}
            </button>
          </form>

          {msg && (
            <p className={`mt-4 font-dm text-sm rounded-lg px-4 py-3 ${msg.tipo === 'ok' ? 'bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>{msg.txt}</p>
          )}

          {cupon && est && (
            <div className="mt-4 rounded-xl bg-[#1A1721] border border-cubic-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bebas text-4xl tracking-wide leading-none">{cupon.titulo.toUpperCase()}</p>
                  <p className="font-dm text-sm text-cubic-muted mt-1">{cupon.detalle}</p>
                </div>
                <span className={`shrink-0 font-bebas tracking-widest text-sm px-3 py-1 rounded-full ${ESTILO_ESTADO[est].cls}`}>{ESTILO_ESTADO[est].txt}</span>
              </div>
              <dl className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 font-dm text-sm">
                <dt className="text-cubic-muted">Cliente</dt><dd>{cupon.nombre}</dd>
                <dt className="text-cubic-muted">WhatsApp</dt><dd>{telLindo(cupon.tel)}</dd>
                <dt className="text-cubic-muted">Lo ganó</dt><dd>{fecha(cupon.fecha)}</dd>
                <dt className="text-cubic-muted">Vence</dt><dd>{fecha(cupon.vence)}</dd>
                {cupon.canjeado && (<><dt className="text-cubic-muted">Canjeado</dt><dd>{fechaHora(cupon.canjeado)}</dd></>)}
              </dl>
              {est === 'valido' && !confirmar && (
                <button onClick={() => setConfirmar(true)} className="mt-5 w-full py-4 rounded-xl bg-cubic-accent text-[#0F0D14] font-bebas text-2xl tracking-widest">CANJEAR</button>
              )}
              {est === 'valido' && confirmar && (
                <div className="mt-5 flex flex-col gap-2">
                  <p className="font-dm text-sm text-center">¿Ya le diste <b>{cupon.titulo}</b> a {cupon.nombre}? Una vez canjeado no se puede volver a usar.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmar(false)} className="flex-1 py-3 rounded-xl border border-cubic-border font-bebas text-xl tracking-widest text-cubic-muted">NO</button>
                    <button onClick={() => llamar('canjear', cupon.codigo)} disabled={cargando} className="flex-[2] py-3 rounded-xl bg-cubic-accent text-[#0F0D14] font-bebas text-xl tracking-widest">SÍ, CANJEAR</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Hoy */}
        <section className="grid grid-cols-3 gap-3">
          {[['Jugaron hoy', resumen?.hoy.jugadas], ['Premios hoy', resumen?.hoy.premios], ['Canjeados hoy', resumen?.hoy.canjeados]].map(([t, n]) => (
            <div key={String(t)} className="rounded-2xl bg-cubic-card border border-cubic-border p-4 text-center">
              <p className="font-bebas text-4xl leading-none tabular-nums">{n ?? '–'}</p>
              <p className="font-dm text-[11px] text-cubic-muted mt-1 uppercase tracking-wider">{t}</p>
            </div>
          ))}
        </section>

        {resumen && <PremiosStock premios={resumen.premios} alGuardar={ps => setResumen({ ...resumen, premios: ps })} />}

        {/* Listas */}
        <section className="rounded-2xl bg-cubic-card border border-cubic-border overflow-hidden">
          <div className="flex border-b border-cubic-border">
            {(['premios', 'registrados'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 font-bebas text-lg tracking-widest ${tab === t ? 'text-cubic-accent border-b-2 border-cubic-accent' : 'text-cubic-muted'}`}>
                {t === 'premios' ? `PREMIOS (${resumen?.cupones.length ?? 0})` : `REGISTRADOS (${resumen?.registros.length ?? 0})`}
              </button>
            ))}
          </div>
          <div className="p-4 flex gap-2">
            <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar nombre, WhatsApp o código" className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#1A1721] border border-cubic-border font-dm text-sm placeholder-[#6b667a] focus:outline-none focus:border-cubic-accent" />
            {tab === 'registrados' && <button onClick={exportar} className="px-3 rounded-lg border border-cubic-border font-dm text-xs text-cubic-muted hover:text-white whitespace-nowrap">Exportar CSV</button>}
          </div>

          {!resumen && <p className="px-4 pb-5 font-dm text-sm text-cubic-muted">Cargando…</p>}

          {resumen && tab === 'premios' && (
            <ul className="divide-y divide-cubic-border">
              {cupones.length === 0 && <li className="px-4 pb-5 font-dm text-sm text-cubic-muted">Todavía no hay premios.</li>}
              {cupones.map(c => {
                const e = estadoDe(c);
                return (
                  <li key={c.codigo}>
                    <button onClick={() => { setCodigo(c.codigo); llamar('ver', c.codigo); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-cubic-card-hover">
                      <span className="font-mono text-sm tracking-widest text-cubic-muted w-20 shrink-0">{c.codigo}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-dm text-sm truncate">{c.titulo} · {c.nombre}</span>
                        <span className="block font-dm text-xs text-cubic-muted">ganado {fecha(c.fecha)} · vence {fecha(c.vence)}</span>
                      </span>
                      <span className={`shrink-0 font-bebas tracking-widest text-xs px-2 py-0.5 rounded-full ${ESTILO_ESTADO[e].cls}`}>{ESTILO_ESTADO[e].txt}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {resumen && tab === 'registrados' && (
            <ul className="divide-y divide-cubic-border">
              {registros.length === 0 && <li className="px-4 pb-5 font-dm text-sm text-cubic-muted">Todavía no se registró nadie.</li>}
              {registros.map(r => (
                <li key={r.tel} className="px-4 py-3 flex items-center gap-3">
                  <span className="flex-1 min-w-0">
                    <span className="block font-dm text-sm truncate">{r.nombre} {r.promos && <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-cubic-accent">acepta promos</span>}</span>
                    <span className="block font-dm text-xs text-cubic-muted">{telLindo(r.tel)} · {r.jugadas} {r.jugadas === 1 ? 'jugada' : 'jugadas'} · {r.premios} {r.premios === 1 ? 'premio' : 'premios'}</span>
                  </span>
                  <a href={`https://wa.me/549${r.tel}`} target="_blank" rel="noopener" className="shrink-0 font-dm text-xs text-cubic-muted hover:text-cubic-accent border border-cubic-border rounded-lg px-2 py-1">WhatsApp</a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

// ─── Premios y stock ──────────────────────────────────────────────────────────
const VACIO: Premio = { titulo: '', detalle: '', chance: 10, stock: 10, activo: true };

function PremiosStock({ premios, alGuardar }: { premios: Premio[]; alGuardar: (p: Premio[]) => void }) {
  const [editando, setEditando] = useState<Premio | null>(null);
  const [borrar, setBorrar] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const enJuego = premios.filter(p => p.activo && p.stock > 0);
  const suma = enJuego.reduce((s, p) => s + p.chance, 0);

  async function enviar(cuerpo: object) {
    setGuardando(true); setError('');
    try {
      const r = await fetch('/api/admin/juego', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
      const d = await r.json();
      if (!r.ok || d.error) throw new Error(d.error || 'No se pudo guardar');
      alGuardar(d.premios); setEditando(null); setBorrar(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    }
    setGuardando(false);
  }

  const campo = 'w-full px-3 py-2 rounded-lg bg-[#1A1721] border border-cubic-border font-dm text-sm focus:outline-none focus:border-cubic-accent';
  const etiqueta = 'font-dm text-[11px] text-cubic-muted uppercase tracking-wider';

  return (
    <section className="rounded-2xl bg-cubic-card border border-cubic-border p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bebas text-2xl tracking-widest">PREMIOS Y STOCK</h2>
        {!editando && <button onClick={() => { setEditando({ ...VACIO }); setBorrar(false); setError(''); }} className="font-bebas tracking-widest text-sm px-3 py-1.5 rounded-lg bg-cubic-accent text-[#0F0D14]">+ AGREGAR</button>}
      </div>
      <p className="font-dm text-sm text-cubic-muted mt-1">
        Cada premio que sale en el juego descuenta 1 del stock. Cuando llega a 0 deja de salir.
        {' '}Hoy se gana algo en el <b className="text-white">{Math.min(100, Math.round(suma))}%</b> de las jugadas{suma < 100 && <> (el {Math.round(100 - suma)}% sale “vacío”)</>}.
      </p>
      {suma > 100 && <p className="font-dm text-xs mt-2 rounded-lg px-3 py-2 bg-amber-500/10 text-amber-200 border border-amber-500/20">Las chances suman {Math.round(suma)}%: siempre sale algún premio y se reparten en proporción.</p>}

      {editando && (
        <div className="mt-4 rounded-xl bg-[#1A1721] border border-cubic-accent/40 p-4 flex flex-col gap-3">
          <p className="font-bebas tracking-widest text-cubic-accent">{editando.id ? 'EDITAR PREMIO' : 'NUEVO PREMIO'}</p>
          <label className="flex flex-col gap-1"><span className={etiqueta}>Premio</span>
            <input className={campo} value={editando.titulo} maxLength={40} placeholder="café gratis" onChange={e => setEditando({ ...editando, titulo: e.target.value })} /></label>
          <label className="flex flex-col gap-1"><span className={etiqueta}>Qué incluye (lo ve el cliente)</span>
            <input className={campo} value={editando.detalle} maxLength={80} placeholder="un café chico de regalo" onChange={e => setEditando({ ...editando, detalle: e.target.value })} /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1"><span className={etiqueta}>Chance (%)</span>
              <input className={campo} type="number" inputMode="decimal" min={0} max={100} step={0.5} value={editando.chance} onChange={e => setEditando({ ...editando, chance: Number(e.target.value) })} /></label>
            <label className="flex flex-col gap-1"><span className={etiqueta}>Stock</span>
              <input className={campo} type="number" inputMode="numeric" min={0} step={1} value={editando.stock} onChange={e => setEditando({ ...editando, stock: Number(e.target.value) })} /></label>
          </div>
          <div className="flex gap-2">
            {[5, 10, 20].map(n => <button key={n} type="button" onClick={() => setEditando({ ...editando, stock: (editando.stock || 0) + n })} className="flex-1 py-1.5 rounded-lg border border-cubic-border font-dm text-xs text-cubic-muted hover:text-white">+{n} al stock</button>)}
          </div>
          <label className="flex items-center gap-2 font-dm text-sm"><input type="checkbox" checked={editando.activo} onChange={e => setEditando({ ...editando, activo: e.target.checked })} className="w-4 h-4 accent-[#4ADE80]" /> En juego (destildalo para pausarlo)</label>
          {error && <p className="font-dm text-sm text-red-300">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => { setEditando(null); setBorrar(false); }} className="flex-1 py-3 rounded-xl border border-cubic-border font-bebas text-lg tracking-widest text-cubic-muted">CANCELAR</button>
            <button onClick={() => enviar({ accion: 'premio-guardar', premio: editando })} disabled={guardando} className="flex-[2] py-3 rounded-xl bg-cubic-accent text-[#0F0D14] font-bebas text-lg tracking-widest">{guardando ? '…' : 'GUARDAR'}</button>
          </div>
          {editando.id && (!borrar
            ? <button onClick={() => setBorrar(true)} className="font-dm text-xs text-red-300/80 self-center">Borrar este premio</button>
            : <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 bg-red-500/10 border border-red-500/20">
                <span className="font-dm text-xs text-red-200">¿Borrar “{editando.titulo}”? Los códigos ya ganados siguen valiendo.</span>
                <button onClick={() => enviar({ accion: 'premio-borrar', id: editando.id })} className="shrink-0 font-bebas tracking-widest text-sm px-3 py-1 rounded bg-red-500/80 text-white">BORRAR</button>
              </div>)}
        </div>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        {premios.length === 0 && <li className="font-dm text-sm text-cubic-muted">No hay premios cargados: el juego no da premios hasta que agregues uno.</li>}
        {premios.map(p => {
          const estado = !p.activo ? { t: 'PAUSADO', c: 'bg-[#2D2840] text-[#9B97A8]' } : p.stock <= 0 ? { t: 'AGOTADO', c: 'bg-red-500/20 text-red-300' } : p.stock <= 3 ? { t: 'QUEDAN POCOS', c: 'bg-amber-500/20 text-amber-200' } : null;
          return (
            <li key={p.id}>
              <button onClick={() => { setEditando({ ...p }); setBorrar(false); setError(''); }} className="w-full text-left rounded-xl bg-[#1A1721] border border-cubic-border hover:border-cubic-muted p-3 flex items-center gap-3">
                <span className="flex-1 min-w-0">
                  <span className="block font-dm text-sm font-bold truncate">{p.titulo}</span>
                  <span className="block font-dm text-xs text-cubic-muted truncate">{p.detalle || '—'}</span>
                  <span className="block font-dm text-xs text-cubic-muted mt-1">chance {p.chance}% · entregados {p.entregados ?? 0}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-bebas text-3xl leading-none tabular-nums">{p.stock}</span>
                  <span className="block font-dm text-[10px] text-cubic-muted uppercase tracking-wider">en stock</span>
                  {estado && <span className={`inline-block mt-1 font-bebas tracking-widest text-[10px] px-2 py-0.5 rounded-full ${estado.c}`}>{estado.t}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
