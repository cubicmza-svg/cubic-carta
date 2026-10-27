'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Juego de las mesas: el mozo busca el código que le muestra el cliente y lo canjea.
// Abajo: números del día, premios entregados y registrados (con exportación a CSV).

interface Cupon {
  codigo: string; tel: string; nombre: string; premio: string; titulo: string; detalle: string;
  fecha: string; vence: string; creado: string; canjeado: string | null;
}
interface Registro { tel: string; nombre: string; promos: boolean; alta: string; ultima: string; jugadas: number; premios: number }
interface Resumen { hoy: { jugadas: number; premios: number; canjeados: number }; registros: Registro[]; cupones: Cupon[] }

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
