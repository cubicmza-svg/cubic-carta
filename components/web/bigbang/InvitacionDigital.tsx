'use client';
import { useEffect, useRef, useState } from 'react';

// Invitación digital gratis: los papás completan nombre, edad, fecha, turno y su WhatsApp para confirmar,
// ven la invitación con la estética Big Bang (1080×1920, ideal para WhatsApp e historias) y la descargan o comparten.
// Se dibuja en un <canvas> en el celu: no se manda ni se guarda nada en ningún servidor.

const TURNOS = ['13:00 a 16:00 hs', '16:30 a 19:30 hs', '20:00 a 23:00 hs'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DIRECCION = ['Calle 25 de Mayo 2985', 'Barrio Unimev, Villa Nueva'];
const W = 1080, H = 1920;

type Datos = { nombre: string; edad: string; fecha: string; turno: string; confirmar: string; mensaje: string };

const cargarImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
  const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
});

// número pseudoaleatorio con semilla, para que las estrellas no "salten" cada vez que se redibuja
function azar(semilla: number) { let s = semilla; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

function textoAjustado(ctx: CanvasRenderingContext2D, txt: string, max: number, tam: number, fuente: string) {
  let t = tam;
  do { ctx.font = `${t}px ${fuente}`; t -= 4; } while (ctx.measureText(txt).width > max && t > 40);
  return t + 4;
}

function rectRedondo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

async function dibujar(cv: HTMLCanvasElement, d: Datos, imgs: { logo: HTMLImageElement; astro: HTMLImageElement }) {
  const ctx = cv.getContext('2d')!;
  const SH = "'SuperHistories', 'Arial Black', sans-serif", DM = "'DM Sans', Arial, sans-serif";
  // fondo espacial
  const g = ctx.createRadialGradient(W / 2, 300, 100, W / 2, 700, 1500);
  g.addColorStop(0, '#2F6A9E'); g.addColorStop(.45, '#285582'); g.addColorStop(1, '#14243A');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = azar(7);
  for (let i = 0; i < 140; i++) { ctx.fillStyle = `rgba(255,255,255,${.3 + r() * .7})`; ctx.beginPath(); ctx.arc(r() * W, r() * H, 1 + r() * 2.4, 0, 7); ctx.fill(); }
  // ondas de colores abajo
  ['#E02A2C', '#D47315', '#EDBD19', '#3CB123', '#A1D1DF', '#2190C9'].forEach((c, i) => {
    ctx.strokeStyle = c; ctx.lineWidth = 34; ctx.beginPath();
    const y0 = 1780 + i * 30; ctx.moveTo(-40, y0 + 120); ctx.bezierCurveTo(300, y0 - 80, 700, y0 + 40, W + 40, y0 - 140); ctx.stroke();
  });
  // logo
  const lw = 270, lh = lw * imgs.logo.height / imgs.logo.width; ctx.drawImage(imgs.logo, (W - lw) / 2, 70, lw, lh);
  ctx.textAlign = 'center';
  // ¡Estás invitado!
  ctx.fillStyle = '#EDBD19'; ctx.font = `800 46px ${DM}`; ctx.fillText('¡ESTÁS INVITADO/A!', W / 2, 110 + lh + 40);
  ctx.fillStyle = '#fff'; ctx.font = `700 44px ${DM}`; ctx.fillText('al cumple de', W / 2, 110 + lh + 104);
  // nombre gigante con borde blanco y sombra roja (como los títulos de la marca)
  const nombre = (d.nombre || 'Tu nombre').toUpperCase();
  const tam = textoAjustado(ctx, nombre, 940, 200, SH);
  ctx.font = `${tam}px ${SH}`; ctx.lineJoin = 'round';
  const yN = 110 + lh + 104 + tam * .95;
  ctx.fillStyle = '#E02A2C'; ctx.strokeStyle = '#E02A2C'; ctx.lineWidth = tam * .16;
  ctx.strokeText(nombre, W / 2 + 14, yN + 14); ctx.fillText(nombre, W / 2 + 14, yN + 14);
  ctx.strokeStyle = '#fff'; ctx.strokeText(nombre, W / 2, yN);
  ctx.fillStyle = '#EDBD19'; ctx.fillText(nombre, W / 2, yN);
  // edad en una explosión roja
  let y = yN + 40;
  if (d.edad) {
    const cx = 270, cy = y + 165, puntas = 14;
    ctx.beginPath();
    for (let i = 0; i < puntas * 2; i++) { const a = (i / (puntas * 2)) * Math.PI * 2, rr = i % 2 ? 120 : 165; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = '#E02A2C'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = '#fff'; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = `800 30px ${DM}`; ctx.fillText('CUMPLE', cx, cy - 46);
    ctx.font = `${d.edad.length > 1 ? 104 : 130}px ${SH}`; ctx.fillText(d.edad, cx, cy + 52);
  }
  // astronauta con torta
  const aw = 330, ah = aw * imgs.astro.height / imgs.astro.width; ctx.drawImage(imgs.astro, d.edad ? 610 : (W - aw) / 2, y + 10, aw, ah);
  y += Math.max(ah, 350) + 40;
  // tarjeta con los datos
  const fechaTxt = d.fecha ? (() => { const f = new Date(d.fecha + 'T12:00:00'); return `${DIAS[f.getDay()]} ${f.getDate()} de ${MESES[f.getMonth()]}`; })() : 'Fecha a confirmar';
  const filas = [['📅', fechaTxt.charAt(0).toUpperCase() + fechaTxt.slice(1)], ['⏰', d.turno], ['📍', 'Big Bang Pelotero'], ...DIRECCION.map(l => ['', l])];
  const alto = 56 + filas.length * 64 + (d.mensaje ? 80 : 0);
  ctx.save(); ctx.shadowColor = '#E02A2C'; ctx.shadowOffsetX = 14; ctx.shadowOffsetY = 14;
  rectRedondo(ctx, 70, y, W - 140, alto, 40); ctx.fillStyle = '#FBF7EE'; ctx.fill(); ctx.restore();
  ctx.lineWidth = 7; ctx.strokeStyle = '#1C1A1D'; rectRedondo(ctx, 70, y, W - 140, alto, 40); ctx.stroke();
  ctx.textAlign = 'left';
  filas.forEach(([ic, txt], i) => {
    const yy = y + 76 + i * 64;
    ctx.font = `44px ${DM}`; ctx.fillText(ic, 120, yy);
    const dir = i >= 3; // renglones de la dirección, más chicos
    ctx.fillStyle = dir ? '#4b5563' : '#1C1A1D'; ctx.font = `${dir ? 600 : 800} ${dir ? 34 : 44}px ${DM}`;
    let t = txt; while (ctx.measureText(t).width > W - 330 && t.length > 4) t = t.slice(0, -2);
    ctx.fillText(t === txt ? t : t + '…', 190, yy); ctx.fillStyle = '#1C1A1D';
  });
  if (d.mensaje) {
    ctx.textAlign = 'center'; ctx.fillStyle = '#285582'; ctx.font = `italic 700 38px ${DM}`;
    let m = d.mensaje; while (ctx.measureText(m).width > W - 220 && m.length > 4) m = m.slice(0, -2);
    ctx.fillText(m === d.mensaje ? m : m + '…', W / 2, y + alto - 36);
  }
  y += alto + 90;
  // confirmación
  ctx.textAlign = 'center';
  if (d.confirmar) {
    rectRedondo(ctx, 150, y - 56, W - 300, 92, 46); ctx.fillStyle = '#25D366'; ctx.fill();
    ctx.fillStyle = '#06081a'; ctx.font = `900 40px ${DM}`; ctx.fillText(`Confirmá al ${d.confirmar}`, W / 2, y + 4);
  }
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = `700 30px ${DM}`; ctx.fillText('bigbangpelotero.com', W / 2, Math.max(1700, y + 100));
}

export default function InvitacionDigital() {
  const [d, setD] = useState<Datos>({ nombre: '', edad: '', fecha: '', turno: TURNOS[1], confirmar: '', mensaje: '' });
  const [listo, setListo] = useState(false);
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  const cv = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<{ logo: HTMLImageElement; astro: HTMLImageElement } | null>(null);

  useEffect(() => {
    (async () => {
      try { await Promise.all([document.fonts.load("200px 'SuperHistories'"), document.fonts.load("800 40px 'DM Sans'")]); } catch {}
      imgs.current = { logo: await cargarImg('/logo-bigbang.png'), astro: await cargarImg('/bigbang/astronauta-torta.png') };
      setListo(true);
    })().catch(() => {});
    setPuedeCompartir(typeof navigator !== 'undefined' && !!navigator.canShare);
  }, []);

  useEffect(() => { if (listo && cv.current && imgs.current) dibujar(cv.current, d, imgs.current); }, [d, listo]);

  const set = (k: keyof Datos) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setD(v => ({ ...v, [k]: e.target.value }));
  const archivo = () => `invitacion-${(d.nombre || 'cumple').toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-')}.png`;

  function descargar() {
    cv.current?.toBlob(b => {
      if (!b) return;
      const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = archivo(); a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  }
  function compartir() {
    cv.current?.toBlob(async b => {
      if (!b) return;
      const f = new File([b], archivo(), { type: 'image/png' });
      try {
        if (navigator.canShare?.({ files: [f] })) await navigator.share({ files: [f], title: `Cumple de ${d.nombre}` });
        else descargar();
      } catch {}
    }, 'image/png');
  }

  return (
    <section id="invitacion" className="inv">
      <style dangerouslySetInnerHTML={{ __html: `
        .inv { position: relative; z-index: 1; padding: 80px 24px; background: linear-gradient(180deg, rgba(6,8,26,0) 0%, rgba(20,36,58,.7) 50%, rgba(6,8,26,0) 100%); }
        .inv-in { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 380px; gap: 40px; align-items: start; }
        @media (max-width: 900px) { .inv-in { grid-template-columns: 1fr; } .inv-vista { order: -1; } }
        .inv h2 { font-family: 'SuperHistories', sans-serif; font-size: clamp(34px,5.5vw,58px); color: #fff; line-height: 1; }
        .inv h2 span { color: #EDBD19; }
        .inv-bajada { color: #94a3b8; font-size: 16px; margin: 12px 0 26px; line-height: 1.5; }
        .inv-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .inv-form .ancho { grid-column: 1 / -1; }
        @media (max-width: 520px) { .inv-form { grid-template-columns: 1fr; } }
        .inv-form label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: #94a3b8; }
        .inv-form input, .inv-form select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: #fff; border-radius: 12px; padding: 12px 14px; font: inherit; font-size: 15px; color-scheme: dark; }
        .inv-priv { margin-top: 14px; font-size: 12px; color: #64748b; }
        .inv-botones { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px; }
        .inv-btn { flex: 1; min-width: 160px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 18px; border-radius: 99px; border: none; cursor: pointer; font: inherit; font-weight: 900; font-size: 16px; }
        .inv-btn.desc { background: #EDBD19; color: #06081a; box-shadow: 0 6px 18px rgba(237,189,25,.3); }
        .inv-btn.comp { background: #25D366; color: #06081a; box-shadow: 0 6px 18px rgba(37,211,102,.3); }
        .inv-btn:disabled { opacity: .4; cursor: default; }
        .inv-vista canvas { width: 100%; max-width: 380px; aspect-ratio: 9 / 16; display: block; margin: 0 auto; border-radius: 22px; box-shadow: 0 18px 50px rgba(0,0,0,.5); background: #14243A; }
      ` }} />
      <div className="inv-in">
        <div>
          <h2>INVITACIÓN <span>DIGITAL GRATIS</span> 💌</h2>
          <p className="inv-bajada">¿Ya tenés tu fecha en Big Bang? Armá la invitación del cumple en un minuto y mandala por WhatsApp a todos los invitados.</p>
          <div className="inv-form">
            <label className="ancho">Nombre del cumpleañero/a<input value={d.nombre} onChange={set('nombre')} maxLength={18} placeholder="Ej: Juli" /></label>
            <label>¿Cuántos cumple?<input value={d.edad} onChange={e => setD(v => ({ ...v, edad: e.target.value.replace(/\D/g, '').slice(0, 2) }))} inputMode="numeric" placeholder="Ej: 6" /></label>
            <label>Fecha<input type="date" value={d.fecha} onChange={set('fecha')} /></label>
            <label className="ancho">Turno<select value={d.turno} onChange={set('turno')}>{TURNOS.map(t => <option key={t}>{t}</option>)}</select></label>
            <label>WhatsApp para confirmar<input value={d.confirmar} onChange={set('confirmar')} inputMode="tel" maxLength={20} placeholder="Ej: 261 555-1234" /></label>
            <label>Mensaje (opcional)<input value={d.mensaje} onChange={set('mensaje')} maxLength={42} placeholder="¡Te espero para jugar!" /></label>
          </div>
          <p className="inv-priv">🔒 La invitación se arma en tu celu: no guardamos ni enviamos ningún dato.</p>
          <div className="inv-botones">
            <button className="inv-btn desc" onClick={descargar} disabled={!listo || !d.nombre}>⬇️ Descargar invitación</button>
            {puedeCompartir && <button className="inv-btn comp" onClick={compartir} disabled={!listo || !d.nombre}>📲 Compartir</button>}
          </div>
        </div>
        <div className="inv-vista">
          <canvas ref={cv} width={W} height={H} aria-label="Vista previa de la invitación" />
        </div>
      </div>
    </section>
  );
}
