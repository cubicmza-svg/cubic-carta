'use client';
import { useMemo, useState } from 'react';

// "Armá tu cumple": el padre elige promo → fecha, turno e invitados → extras, ve el total estimado
// y manda todo armado por WhatsApp. Precios = los del panel de precios web (mismas claves que BigBangWeb).
// Condiciones de cada promo: las mismas que muestra la web (sección Promos) y el pop-up de la Low Cost.

type Precios = Record<string, string>;
type PromoKey = 'lowcost' | 'super' | 'clasic' | 'full';

const TURNOS = ['13:00 a 16:00 hs', '16:30 a 19:30 hs', '20:00 a 23:00 hs'];

const PROMOS: Record<PromoKey, {
  nombre: string; emoji: string; color: string; max: number; turnos: string[]; soloLunVie?: boolean;
  precio: (finde: boolean) => string; nota: string; pago: string;
}> = {
  lowcost: { nombre: 'Low Cost', emoji: '🚀', color: '#22c55e', max: 30, turnos: TURNOS,
    precio: () => 'promo_lowcost', nota: 'Hasta 30 personas · no incluye la sala de videojuegos', pago: 'Contado en efectivo al contratar' },
  super: { nombre: 'Súper Promo', emoji: '⚡', color: '#f59e0b', max: 60, turnos: TURNOS.slice(0, 2), soloLunVie: true,
    precio: () => 'promo_super_lv', nota: 'Lunes a viernes · hasta 60 personas', pago: 'Se abona el total en efectivo al contratar' },
  clasic: { nombre: 'Clasic', emoji: '🎉', color: '#ef4444', max: 60, turnos: TURNOS,
    precio: finde => finde ? 'promo_clasic_finde' : 'promo_clasic_lj', nota: 'Todos los días · hasta 60 personas', pago: 'Seña de $150.000 y saldo 15 días antes (efectivo)' },
  full: { nombre: 'Full', emoji: '👑', color: '#06b6d4', max: 60, turnos: TURNOS,
    precio: finde => finde ? 'promo_full_finde' : 'promo_full_lj', nota: 'Incluye 5 pizzas muzza + 24 panchos', pago: 'Seña del 50% y saldo 15 días antes (efectivo)' },
};

const EXTRAS: { grupo: string; items: { key: string; nombre: string; max: number }[] }[] = [
  { grupo: '⏱️ Servicio', items: [
    { key: 'adic_hora_extra', nombre: 'Hora extra', max: 3 },
    { key: 'adic_moza', nombre: 'Moza adicional', max: 3 },
    { key: 'adic_parrillero', nombre: 'Parrillero + leña', max: 1 },
    { key: 'adic_dispenser', nombre: 'Dispenser de jugo o café', max: 3 },
  ] },
  { grupo: '🍕 Comida', items: [
    { key: 'menu_pizza_muzza', nombre: 'Pizza muzzarella (12 porciones)', max: 15 },
    { key: 'menu_pizza_napo', nombre: 'Pizza napolitana o especial (12 porciones)', max: 15 },
    { key: 'menu_panchos_24', nombre: 'Combo 24 panchos con aderezos', max: 6 },
    { key: 'menu_hamburguesas_12', nombre: 'Combo 12 hamburguesas a la parrilla', max: 8 },
    { key: 'menu_snack', nombre: 'Combo snack (papas, chizitos, palitos)', max: 6 },
    { key: 'menu_empanadas', nombre: 'Docena de empanadas', max: 15 },
    { key: 'menu_sandwiches', nombre: 'Sándwiches de miga triples x100', max: 4 },
  ] },
  { grupo: '🥤 Bebidas', items: [
    { key: 'beb_gaseosa', nombre: 'Gaseosa Pepsi 1,5 L', max: 40 },
    { key: 'beb_agua_sab', nombre: 'Agua saborizada H2O 1,5 L', max: 40 },
    { key: 'beb_agua_min', nombre: 'Agua mineral 1,5 L', max: 40 },
    { key: 'beb_cerveza', nombre: 'Cerveza Quilmes 1 L', max: 40 },
    { key: 'beb_hielo', nombre: 'Bolsa de hielo 3,5 kg', max: 10 },
  ] },
];
const NOMBRE_EXTRA = Object.fromEntries(EXTRAS.flatMap(g => g.items.map(i => [i.key, i.nombre])));

const num = (p: Precios, k: string) => parseInt(p[k] ?? '0', 10) || 0;
const plata = (n: number) => '$' + n.toLocaleString('es-AR');
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export default function ArmaTuCumple({ precios, waLink }: { precios: Precios; waLink: (msg: string) => string }) {
  const [promo, setPromo] = useState<PromoKey>('clasic');
  const [fecha, setFecha] = useState('');
  const [feriado, setFeriado] = useState(false);
  const [turno, setTurno] = useState(TURNOS[1]);
  const [invitados, setInvitados] = useState(40);
  const [extras, setExtras] = useState<Record<string, number>>({});
  const [abierto, setAbierto] = useState<string>('⏱️ Servicio');

  const P = PROMOS[promo];
  const dia = fecha ? new Date(fecha + 'T12:00:00').getDay() : null;          // 0 = domingo
  const finde = feriado || dia === 0 || dia === 5 || dia === 6;              // Clasic/Full: vie a dom y feriados
  const fueraDeDia = P.soloLunVie && dia !== null && (dia === 0 || dia === 6);
  const invitadosOk = Math.min(invitados, P.max === 30 ? 30 : 200);
  const extraInvitados = P.max === 60 ? Math.max(0, invitadosOk - 60) : 0;

  const cuenta = useMemo(() => {
    const base = num(precios, P.precio(finde));
    const lineas: { txt: string; monto: number }[] = [{ txt: `Promo ${P.nombre}`, monto: base }];
    if (extraInvitados) lineas.push({ txt: `${extraInvitados} invitado${extraInvitados > 1 ? 's' : ''} extra (sobre 60)`, monto: extraInvitados * num(precios, 'adic_invitado_extra') });
    for (const [k, c] of Object.entries(extras)) if (c > 0) lineas.push({ txt: `${c} × ${NOMBRE_EXTRA[k]}`, monto: c * num(precios, k) });
    return { lineas, total: lineas.reduce((a, l) => a + l.monto, 0) };
  }, [precios, promo, finde, extraInvitados, extras]);

  function elegirPromo(k: PromoKey) {
    setPromo(k);
    if (!PROMOS[k].turnos.includes(turno)) setTurno(PROMOS[k].turnos[0]);
    if (k === 'lowcost' && invitados > 30) setInvitados(30);
  }
  const cambiar = (k: string, d: number, max: number) =>
    setExtras(e => ({ ...e, [k]: Math.max(0, Math.min(max, (e[k] || 0) + d)) }));

  const fechaTxt = fecha ? `${DIAS[dia!]} ${fecha.slice(8, 10)}/${fecha.slice(5, 7)}${feriado ? ' (feriado)' : ''}` : 'a definir';
  const mensaje = [
    '¡Hola Big Bang! Armé mi cumple en la web 🚀',
    `• Promo: ${P.nombre}`,
    `• Fecha: ${fechaTxt}`,
    `• Turno: ${turno}`,
    `• Invitados: ${invitadosOk}`,
    ...(cuenta.lineas.length > 1 ? ['• Extras: ' + cuenta.lineas.slice(1).map(l => l.txt).join(', ')] : []),
    `• Total estimado: ${plata(cuenta.total)}`,
    '¿Tienen disponible esa fecha?',
  ].join('\n');

  return (
    <section id="arma" className="atc">
      <style dangerouslySetInnerHTML={{ __html: `
        .atc { position: relative; z-index: 1; padding: 80px 24px; }
        .atc-in { max-width: 1100px; margin: 0 auto; }
        .atc-cab { text-align: center; margin-bottom: 40px; }
        .atc-cab h2 { font-family: 'SuperHistories', sans-serif; font-size: clamp(36px,6vw,64px); color: #fff; line-height: 1; }
        .atc-cab h2 span { color: #22c55e; }
        .atc-cab p { color: #94a3b8; font-size: 16px; margin-top: 12px; }
        .atc-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; align-items: start; }
        @media (max-width: 900px) { .atc-grid { grid-template-columns: 1fr; } }
        .atc-paso { background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); border-radius: 24px; padding: 22px 22px 20px; margin-bottom: 16px; }
        .atc-paso h3 { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 16px; }
        .atc-n { width: 32px; height: 32px; border-radius: 50%; background: #22c55e; color: #06081a; display: grid; place-items: center; font-weight: 900; font-size: 16px; flex: none; }
        .atc-promos { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        @media (max-width: 640px) { .atc-promos { grid-template-columns: repeat(2, 1fr); } }
        .atc-promo { cursor: pointer; border-radius: 18px; padding: 14px 10px; text-align: center; border: 2px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #cbd5e1; transition: all .2s; font: inherit; }
        .atc-promo b { display: block; font-family: 'SuperHistories', sans-serif; font-weight: 400; font-size: 17px; margin: 4px 0; }
        .atc-promo small { font-size: 13px; font-weight: 800; color: #fff; }
        .atc-nota { margin-top: 12px; font-size: 13px; color: #94a3b8; }
        .atc-fila { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 14px; }
        .atc-fila label { font-size: 13px; color: #94a3b8; font-weight: 700; }
        .atc-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #fff; border-radius: 12px; padding: 10px 14px; font: inherit; font-size: 15px; color-scheme: dark; }
        .atc-chk { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #cbd5e1; cursor: pointer; }
        .atc-chk input { width: 18px; height: 18px; accent-color: #22c55e; }
        .atc-pill { cursor: pointer; padding: 9px 16px; border-radius: 99px; border: 1.5px solid rgba(255,255,255,0.12); background: transparent; color: #cbd5e1; font: inherit; font-size: 14px; font-weight: 600; }
        .atc-pill.on { border-color: #22c55e; background: rgba(34,197,94,0.15); color: #fff; }
        .atc-rango { width: 100%; accent-color: #22c55e; }
        .atc-inv { font-family: 'SuperHistories', sans-serif; font-size: 34px; color: #fff; min-width: 60px; }
        .atc-aviso { margin-top: 8px; font-size: 13px; font-weight: 700; color: #fca5a5; }
        .atc-grupo { border-top: 1px solid rgba(255,255,255,0.06); }
        .atc-grupo:first-of-type { border-top: none; }
        .atc-grupo > button { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 14px 2px; background: none; border: none; color: #fff; font: inherit; font-weight: 800; font-size: 15px; cursor: pointer; }
        .atc-item { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 9px 2px; }
        .atc-item span { font-size: 14px; color: #cbd5e1; }
        .atc-item em { display: block; font-style: normal; font-size: 12px; color: #f59e0b; font-weight: 700; }
        .atc-step { display: flex; align-items: center; gap: 8px; flex: none; }
        .atc-step button { width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid rgba(255,255,255,0.18); background: rgba(255,255,255,0.05); color: #fff; font-size: 18px; cursor: pointer; }
        .atc-step button:disabled { opacity: .3; cursor: default; }
        .atc-step b { min-width: 22px; text-align: center; color: #fff; }
        .atc-res { position: sticky; top: 90px; background: linear-gradient(160deg, #1b1446 0%, #0b0e2a 75%); border: 2px solid rgba(34,197,94,0.45); border-radius: 26px; padding: 24px; box-shadow: 0 18px 50px rgba(0,0,0,0.45); }
        .atc-res h3 { font-family: 'SuperHistories', sans-serif; font-size: 26px; color: #fff; margin-bottom: 14px; }
        .atc-dato { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; color: #94a3b8; padding: 4px 0; }
        .atc-dato b { color: #fff; text-align: right; }
        .atc-lin { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; color: #cbd5e1; padding: 6px 0; border-bottom: 1px dashed rgba(255,255,255,0.08); }
        .atc-total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 14px; }
        .atc-total span { font-size: 13px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .atc-total b { font-family: 'SuperHistories', sans-serif; font-size: 40px; color: #fde047; text-shadow: 0 0 22px rgba(253,224,71,.3); }
        .atc-pago { font-size: 12px; color: #94a3b8; margin-top: 6px; }
        .atc-cta { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; padding: 15px 18px; border-radius: 99px; background: #25D366; color: #06081a; font-weight: 900; font-size: 16px; text-decoration: none; box-shadow: 0 6px 18px rgba(37,211,102,.35); }
        .atc-letra { font-size: 11px; color: #64748b; margin-top: 10px; line-height: 1.4; text-align: center; }
      ` }} />

      <div className="atc-in">
        <div className="atc-cab">
          <h2>ARMÁ TU <span>CUMPLE</span></h2>
          <p>Elegí la promo, la fecha y los extras: te mostramos el total y nos lo mandás por WhatsApp en un toque.</p>
        </div>

        <div className="atc-grid">
          <div>
            <div className="atc-paso">
              <h3><span className="atc-n">1</span>Elegí la promo</h3>
              <div className="atc-promos">
                {(Object.keys(PROMOS) as PromoKey[]).map(k => {
                  const p = PROMOS[k], on = promo === k;
                  return (
                    <button key={k} className="atc-promo" onClick={() => elegirPromo(k)}
                      style={on ? { borderColor: p.color, background: `${p.color}22`, boxShadow: `0 0 22px ${p.color}44` } : undefined}>
                      <span style={{ fontSize: 24 }}>{p.emoji}</span>
                      <b style={{ color: p.color }}>{p.nombre}</b>
                      <small>{k === 'clasic' || k === 'full' ? 'desde ' : ''}{plata(num(precios, p.precio(false)))}</small>
                    </button>
                  );
                })}
              </div>
              <p className="atc-nota">{P.emoji} {P.nota}</p>
            </div>

            <div className="atc-paso">
              <h3><span className="atc-n">2</span>Fecha, turno e invitados</h3>
              <div className="atc-fila">
                <label htmlFor="atc-fecha">Fecha</label>
                <input id="atc-fecha" className="atc-input" type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
                <label className="atc-chk"><input type="checkbox" checked={feriado} onChange={e => setFeriado(e.target.checked)} />Es feriado</label>
              </div>
              {fueraDeDia && <p className="atc-aviso">La Súper Promo es de lunes a viernes: para ese día te conviene la Clasic o la Low Cost.</p>}
              <div className="atc-fila" style={{ marginTop: 6 }}>
                {P.turnos.map(t => (
                  <button key={t} className={`atc-pill${turno === t ? ' on' : ''}`} onClick={() => setTurno(t)}>{t}</button>
                ))}
              </div>
              <div className="atc-fila" style={{ marginBottom: 4 }}>
                <label htmlFor="atc-inv">Invitados</label>
                <span className="atc-inv">{invitadosOk}</span>
              </div>
              <input id="atc-inv" className="atc-rango" type="range" min={10} max={P.max === 30 ? 30 : 90} value={invitadosOk}
                onChange={e => setInvitados(+e.target.value)} />
              {promo === 'lowcost' && <p className="atc-nota">La Low Cost es hasta 30 personas. ¿Son más? Probá con la Súper o la Clasic.</p>}
              {extraInvitados > 0 && <p className="atc-nota">Sobre 60 personas se suma {plata(num(precios, 'adic_invitado_extra'))} por invitado extra.</p>}
            </div>

            <div className="atc-paso">
              <h3><span className="atc-n">3</span>Sumá extras (opcional)</h3>
              {EXTRAS.map(g => (
                <div key={g.grupo} className="atc-grupo">
                  <button onClick={() => setAbierto(a => a === g.grupo ? '' : g.grupo)} aria-expanded={abierto === g.grupo}>
                    <span>{g.grupo}</span><span>{abierto === g.grupo ? '−' : '+'}</span>
                  </button>
                  {abierto === g.grupo && g.items.map(it => (
                    <div key={it.key} className="atc-item">
                      <span>{it.nombre}<em>{plata(num(precios, it.key))}</em></span>
                      <div className="atc-step">
                        <button onClick={() => cambiar(it.key, -1, it.max)} disabled={!extras[it.key]} aria-label={`Quitar ${it.nombre}`}>−</button>
                        <b>{extras[it.key] || 0}</b>
                        <button onClick={() => cambiar(it.key, 1, it.max)} disabled={(extras[it.key] || 0) >= it.max} aria-label={`Sumar ${it.nombre}`}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <aside className="atc-res">
            <h3>Tu cumple 🎈</h3>
            <div className="atc-dato"><span>Promo</span><b style={{ color: P.color }}>{P.emoji} {P.nombre}</b></div>
            <div className="atc-dato"><span>Fecha</span><b>{fechaTxt}</b></div>
            <div className="atc-dato"><span>Turno</span><b>{turno}</b></div>
            <div className="atc-dato" style={{ marginBottom: 12 }}><span>Invitados</span><b>{invitadosOk}</b></div>
            {cuenta.lineas.map(l => (
              <div key={l.txt} className="atc-lin"><span>{l.txt}</span><span>{plata(l.monto)}</span></div>
            ))}
            <div className="atc-total"><span>Total estimado</span><b>{plata(cuenta.total)}</b></div>
            {!fecha && (promo === 'clasic' || promo === 'full') && <p className="atc-pago">Precio de lunes a jueves: elegí la fecha para ver el de tu día.</p>}
            <p className="atc-pago">💳 {P.pago}</p>
            <a className="atc-cta" href={waLink(mensaje)} target="_blank" rel="noopener noreferrer">💬 Mandar mi cumple por WhatsApp</a>
            <p className="atc-letra">Total estimado según la lista de precios vigente. La disponibilidad y el precio final se confirman por WhatsApp.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
