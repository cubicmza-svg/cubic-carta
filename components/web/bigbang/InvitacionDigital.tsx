'use client';
import { useEffect, useRef, useState } from 'react';

// Invitación digital gratis, estilo "misión espacial" (referencia que pasó Jose el 2/11/2026):
// nombre gigante blanco + amarillo, cinta azul con la edad, recuadro punteado con íconos, luna con banderita,
// planeta, cohete y astronauta. Los papás pueden sumar una foto del cumpleañero (va dentro de un casco).
// Se dibuja en un <canvas> 1080×1620 en el celu: no se manda ni se guarda nada en ningún servidor.

const TURNOS = ['13:00 a 16:00 hs', '16:30 a 19:30 hs', '20:00 a 23:00 hs'];
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DIRECCION = ['Calle 25 de Mayo 2985', 'Barrio Unimev, Villa Nueva'];
const W = 1080, H = 1620;
const AMARILLO = '#F5C518', AZUL = '#1E4FA8', AZUL_OSC = '#0F2A5E';
const ANTON = "'Anton', 'Arial Narrow', 'Arial Black', sans-serif", DM = "'DM Sans', Arial, sans-serif";

type Datos = { nombre: string; edad: string; fecha: string; turno: string; confirmar: string };
type Imgs = Record<'cohete' | 'saturno' | 'astro' | 'astroGrande' | 'logo', HTMLImageElement>;

const cargarImg = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
  const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
});
// pseudoaleatorio con semilla: las estrellas no "saltan" cada vez que se redibuja
function azar(semilla: number) { let s = semilla; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

function ajustar(ctx: CanvasRenderingContext2D, txt: string, max: number, tam: number, fuente: string) {
  let t = tam;
  do { ctx.font = `${t}px ${fuente}`; t -= 3; } while (ctx.measureText(txt).width > max && t > 30);
  return t + 3;
}
function redondo(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function estrella(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color = AMARILLO) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
function imagen(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, x: number, y: number, w: number, rot = 0) {
  if (!img) return 0;
  const h = w * img.height / img.width;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.drawImage(img, -w / 2, -h / 2, w, h); ctx.restore();
  return h;
}
// íconos planos del recuadro (calendario amarillo, reloj azul, pin rojo)
function iconoCal(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.lineWidth = 7; ctx.strokeStyle = AMARILLO; redondo(ctx, x, y + 8, 76, 66, 10); ctx.stroke();
  ctx.fillStyle = AMARILLO; ctx.fillRect(x, y + 8, 76, 18); ctx.fillRect(x + 16, y - 2, 8, 20); ctx.fillRect(x + 52, y - 2, 8, 20);
  for (let f = 0; f < 2; f++) for (let c = 0; c < 3; c++) ctx.fillRect(x + 14 + c * 19, y + 36 + f * 17, 10, 10);
}
function iconoReloj(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.lineWidth = 7; ctx.strokeStyle = '#3B82F6'; ctx.beginPath(); ctx.arc(cx, cy, 36, 0, 7); ctx.stroke();
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - 22); ctx.moveTo(cx, cy); ctx.lineTo(cx + 16, cy + 8); ctx.stroke(); ctx.lineCap = 'butt';
}
function iconoPin(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = '#EF4444'; ctx.beginPath(); ctx.arc(cx, cy - 10, 30, Math.PI, 0); ctx.lineTo(cx, cy + 42); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy - 10, 30, 0, 7); ctx.fill(); ctx.fillStyle = '#0b1530'; ctx.beginPath(); ctx.arc(cx, cy - 10, 12, 0, 7); ctx.fill();
}

function dibujar(cv: HTMLCanvasElement, d: Datos, im: Imgs, foto: HTMLImageElement | null) {
  const ctx = cv.getContext('2d')!;
  ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  // cielo
  const g = ctx.createRadialGradient(W * .55, H * .35, 80, W * .5, H * .5, 1100);
  g.addColorStop(0, '#13245a'); g.addColorStop(.55, '#0a1435'); g.addColorStop(1, '#050a1c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const r = azar(11);
  for (let i = 0; i < 170; i++) { ctx.fillStyle = `rgba(255,255,255,${.25 + r() * .75})`; ctx.beginPath(); ctx.arc(r() * W, r() * H, .8 + r() * 2.2, 0, 7); ctx.fill(); }
  [[58, 62, 22], [740, 74, 20], [42, 450, 16], [672, 712, 18], [44, 1100, 16], [420, 1350, 20], [980, 1470, 14]].forEach(([x, y, s]) => estrella(ctx, x, y, s));
  // planeta y cohete arriba
  imagen(ctx, im.saturno, 760, 30, 300, .08);
  imagen(ctx, im.cohete, 40, 30, 190, -.15);
  ctx.setLineDash([10, 14]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.5)';
  ctx.beginPath(); ctx.moveTo(80, 260); ctx.bezierCurveTo(30, 360, 130, 420, 60, 520); ctx.stroke(); ctx.setLineDash([]);

  // encabezado
  ctx.textAlign = 'center'; const cx = 520;
  ctx.font = `46px ${ANTON}`;
  const linea = (partes: [string, string][], y: number) => {
    const total = partes.reduce((a, [t]) => a + ctx.measureText(t).width, 0); let x = cx - total / 2; ctx.textAlign = 'left';
    for (const [t, c] of partes) { ctx.fillStyle = c; ctx.fillText(t, x, y); x += ctx.measureText(t).width; }
    ctx.textAlign = 'center';
  };
  linea([['¡VENÍ A UNA MISIÓN ', '#fff']], 118);
  linea([['ESPACIAL', AMARILLO], [' PARA FESTEJAR', '#fff']], 176);
  linea([['MI CUMPLE!', '#fff']], 234);

  // nombre: primera palabra blanca, el resto amarillo (si es una sola, amarilla)
  const palabras = (d.nombre || 'Tu nombre').trim().toUpperCase().split(/\s+/);
  const l1 = palabras.length > 1 ? palabras[0] : '', l2 = palabras.length > 1 ? palabras.slice(1).join(' ') : palabras[0];
  const izq = 95, ancho = 610; let y = 300;
  ctx.textAlign = 'left';
  const sombra = () => { ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowOffsetY = 8; ctx.shadowBlur = 0; };
  if (l1) {
    const t1 = ajustar(ctx, l1, ancho, 165, ANTON); y += t1 * .95;
    ctx.save(); sombra(); ctx.fillStyle = '#F4F4F5'; ctx.fillText(l1, izq, y); ctx.restore(); y += 14;
  }
  const t2 = ajustar(ctx, l2, ancho, l1 ? 135 : 190, ANTON); y += t2 * .95;
  ctx.save(); sombra(); ctx.fillStyle = AMARILLO; ctx.fillText(l2, izq, y); ctx.restore();

  // cinta con la edad
  y += 40;
  const cint = d.edad ? `${d.edad} ${d.edad === '1' ? 'AÑO' : 'AÑOS'}` : '¡A FESTEJAR!';
  const cw = 440, ch = 96, cx0 = izq + 40;
  ctx.fillStyle = AZUL_OSC;
  ctx.beginPath(); ctx.moveTo(cx0 - 30, y + 14); ctx.lineTo(cx0 + 10, y + 14); ctx.lineTo(cx0 + 10, y + ch + 14); ctx.lineTo(cx0 - 30, y + ch + 14); ctx.lineTo(cx0 - 8, y + 14 + ch / 2); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx0 + cw + 30, y + 14); ctx.lineTo(cx0 + cw - 10, y + 14); ctx.lineTo(cx0 + cw - 10, y + ch + 14); ctx.lineTo(cx0 + cw + 30, y + ch + 14); ctx.lineTo(cx0 + cw + 8, y + 14 + ch / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = AZUL; ctx.fillRect(cx0, y, cw, ch); ctx.strokeStyle = '#6EA0FF'; ctx.lineWidth = 4; ctx.strokeRect(cx0 + 6, y + 6, cw - 12, ch - 12);
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ajustar(ctx, cint, cw - 60, 70, ANTON); ctx.fillText(cint, cx0 + cw / 2, y + ch - 20);
  // astronauta flotando a la izquierda de la cinta
  imagen(ctx, im.astro, -10, y - 40, 120, -.2);

  // recuadro punteado con fecha, hora y lugar
  y += ch + 50;
  const bx = 95, bw = 545, filaH = 114, bh = filaH * 2 + 212;
  ctx.setLineDash([12, 10]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,.75)'; redondo(ctx, bx, y, bw, bh, 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + 24, y + filaH); ctx.lineTo(bx + bw - 24, y + filaH); ctx.moveTo(bx + 24, y + filaH * 2); ctx.lineTo(bx + bw - 24, y + filaH * 2); ctx.stroke(); ctx.setLineDash([]);
  const f = d.fecha ? new Date(d.fecha + 'T12:00:00') : null;
  ctx.textAlign = 'left';
  iconoCal(ctx, bx + 34, y + 26);
  ctx.fillStyle = '#fff'; ctx.font = `44px ${ANTON}`; ctx.fillText(f ? DIAS[f.getDay()].toUpperCase() : 'FECHA', bx + 140, y + 58);
  ctx.fillStyle = AMARILLO; ctx.font = `50px ${ANTON}`;
  ctx.fillText(f ? `${String(f.getDate()).padStart(2, '0')}/${String(f.getMonth() + 1).padStart(2, '0')}/${String(f.getFullYear()).slice(2)}` : 'A CONFIRMAR', bx + 140, y + 112);
  iconoReloj(ctx, bx + 72, y + filaH + 64);
  ctx.fillStyle = '#fff'; ajustar(ctx, d.turno.toUpperCase(), bw - 170, 48, ANTON); ctx.fillText(d.turno.toUpperCase(), bx + 140, y + filaH + 82);
  iconoPin(ctx, bx + 72, y + filaH * 2 + 70);
  ctx.fillStyle = AMARILLO; ctx.font = `40px ${ANTON}`; ctx.fillText('LUGAR DE LA MISIÓN', bx + 140, y + filaH * 2 + 62);
  ctx.fillStyle = '#fff'; ctx.font = `800 36px ${DM}`; ctx.fillText('Big Bang Pelotero', bx + 140, y + filaH * 2 + 112);
  ctx.fillStyle = '#c7d2fe'; ctx.font = `600 28px ${DM}`;
  DIRECCION.forEach((l, i) => ctx.fillText(l, bx + 140, y + filaH * 2 + 154 + i * 36));
  const finCaja = y + bh;

  // confirmación
  if (d.confirmar) {
    const ty = finCaja + 26; redondo(ctx, bx, ty, bw, 74, 37); ctx.fillStyle = '#25D366'; ctx.fill();
    ctx.fillStyle = '#06111f'; ctx.textAlign = 'center'; ctx.font = `800 34px ${DM}`; ctx.fillText(`Confirmá al ${d.confirmar}`, bx + bw / 2, ty + 49);
  }

  // luna abajo a la izquierda, con cráteres y banderita
  const lx = 230, ly = H + 230, lr = 400;
  const gl = ctx.createRadialGradient(lx - 120, ly - 220, 40, lx, ly, lr);
  gl.addColorStop(0, '#e5e7eb'); gl.addColorStop(1, '#6b7280'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(lx, ly, lr, 0, 7); ctx.fill();
  [[110, H - 150, 46], [300, H - 190, 34], [420, H - 80, 52], [190, H - 40, 30], [40, H - 60, 26]].forEach(([x, yy, rr]) => {
    ctx.fillStyle = 'rgba(75,85,99,.45)'; ctx.beginPath(); ctx.ellipse(x, yy, rr, rr * .55, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, yy - 3, rr, rr * .55, 0, Math.PI, 0); ctx.stroke();
  });
  const px = 120, py = H - 255;
  ctx.fillStyle = '#9ca3af'; ctx.fillRect(px - 4, py, 8, 160); ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill();
  ctx.fillStyle = AZUL; ctx.beginPath(); ctx.moveTo(px + 4, py + 6); ctx.lineTo(px + 300, py + 22); ctx.lineTo(px + 270, py + 64); ctx.lineTo(px + 300, py + 108); ctx.lineTo(px + 4, py + 118); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.font = `800 30px ${DM}`;
  ctx.fillText('¡CONTAMOS', px + 140, py + 54); ctx.fillText('CON VOS!', px + 140, py + 92);

  // derecha: foto del cumpleañero dentro de un casco, o el astronauta grande
  const fx = 868, fy = 1080, fr = 185;
  if (foto) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 40; ctx.fillStyle = '#d1d5db'; ctx.beginPath(); ctx.arc(fx, fy, fr + 34, 0, 7); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#f3f4f6'; ctx.beginPath(); ctx.arc(fx, fy, fr + 22, 0, 7); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, fr, 0, 7); ctx.clip();
    const esc = Math.max((fr * 2) / foto.width, (fr * 2) / foto.height), iw = foto.width * esc, ih = foto.height * esc;
    ctx.drawImage(foto, fx - iw / 2, fy - fr - (ih - fr * 2) * .3, iw, ih);   // un poco hacia arriba: caras
    const brillo = ctx.createLinearGradient(fx - fr, fy - fr, fx, fy); brillo.addColorStop(0, 'rgba(255,255,255,.28)'); brillo.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = brillo; ctx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2); ctx.restore();
    ctx.lineWidth = 12; ctx.strokeStyle = '#3B82F6'; ctx.beginPath(); ctx.arc(fx, fy, fr + 6, 0, 7); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.arc(fx + Math.cos(a) * (fr + 22), fy + Math.sin(a) * (fr + 22), 7, 0, 7); ctx.fill(); }
    // parche de misión
    ctx.fillStyle = AZUL_OSC; ctx.beginPath(); ctx.arc(fx - fr + 10, fy + fr - 30, 62, 0, 7); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = AMARILLO; ctx.stroke();
    estrella(ctx, fx - fr + 10, fy + fr - 34, 34);
  } else {
    imagen(ctx, im.astroGrande, 640, 820, 420, .06);
  }

  // marca Big Bang abajo a la derecha
  const lh = imagen(ctx, im.logo, 870, H - 175, 170);
  ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'center'; ctx.font = `700 24px ${DM}`; ctx.fillText('bigbangpelotero.com', 955, H - 175 + lh + 30);
}

export default function InvitacionDigital() {
  const [d, setD] = useState<Datos>({ nombre: '', edad: '', fecha: '', turno: TURNOS[1], confirmar: '' });
  const [listo, setListo] = useState(false);
  const [version, setVersion] = useState(0);
  const [foto, setFoto] = useState<HTMLImageElement | null>(null);
  const [puedeCompartir, setPuedeCompartir] = useState(false);
  const cv = useRef<HTMLCanvasElement>(null);
  const imgs = useRef<Imgs | null>(null);

  useEffect(() => {
    (async () => {
      // en iPhone document.fonts.load a veces no resuelve nunca: no esperamos más de 2,5 s
      const fuentes = Promise.all([document.fonts.load("100px 'Anton'"), document.fonts.load("800 40px 'DM Sans'")]).catch(() => {});
      await Promise.race([fuentes, new Promise(r => setTimeout(r, 2500))]);
      const [cohete, saturno, astro, astroGrande, logo] = await Promise.all(['/bigbang/inv/cohete.png', '/bigbang/inv/planeta-saturno.png',
        '/bigbang/inv/astronauta-pulgar.png', '/bigbang/inv/astronauta-estrella.png', '/logo-bigbang.png'].map(u => cargarImg(u).catch(() => null)));
      imgs.current = { cohete, saturno, astro, astroGrande, logo } as Imgs;
      setListo(true);
      fuentes.then(() => setVersion(v => v + 1));   // si la letra llega tarde, se redibuja con la letra buena
    })().catch(() => setListo(true));
    setPuedeCompartir(typeof navigator !== 'undefined' && !!navigator.canShare);
  }, []);

  useEffect(() => { if (listo && cv.current && imgs.current) dibujar(cv.current, d, imgs.current, foto); }, [d, listo, foto, version]);

  const set = (k: keyof Datos) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setD(v => ({ ...v, [k]: e.target.value }));
  const archivo = () => `invitacion-${(d.nombre || 'cumple').toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-')}.png`;

  function elegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    cargarImg(url).then(setFoto).catch(() => {}).finally(() => setTimeout(() => URL.revokeObjectURL(url), 2000));
  }
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
        @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
        .inv { position: relative; z-index: 1; padding: 80px 24px; background: linear-gradient(180deg, rgba(6,8,26,0) 0%, rgba(20,36,58,.7) 50%, rgba(6,8,26,0) 100%); }
        .inv-in { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 400px; gap: 40px; align-items: start; }
        @media (max-width: 900px) { .inv-in { grid-template-columns: 1fr; } } .inv-vista h3 { display: block; }
        .inv h2 { font-family: 'SuperHistories', sans-serif; font-size: clamp(34px,5.5vw,58px); color: #fff; line-height: 1; }
        .inv h2 span { color: #EDBD19; }
        .inv-bajada { color: #94a3b8; font-size: 16px; margin: 12px 0 26px; line-height: 1.5; }
        .inv-form { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .inv-form .ancho { grid-column: 1 / -1; }
        @media (max-width: 520px) { .inv-form { grid-template-columns: 1fr; } }
        .inv-form label { display: grid; gap: 6px; font-size: 13px; font-weight: 700; color: #94a3b8; }
        .inv-form input, .inv-form select { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); color: #fff; border-radius: 12px; padding: 12px 14px; font: inherit; font-size: 15px; color-scheme: dark; }
        .inv-form input[type=file] { padding: 10px; font-size: 14px; }
        .inv-vista h3 { display: none; font-size: 15px; font-weight: 800; color: #fff; text-align: center; margin-bottom: 12px; }
        .inv-falta { margin-top: 10px; font-size: 13px; font-weight: 700; color: #fde047; text-align: center; }
        .inv-priv { margin-top: 14px; font-size: 12px; color: #64748b; }
        .inv-botones { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px; }
        .inv-btn { flex: 1; min-width: 160px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 18px; border-radius: 99px; border: none; cursor: pointer; font: inherit; font-weight: 900; font-size: 16px; }
        .inv-btn.desc { background: #EDBD19; color: #06081a; box-shadow: 0 6px 18px rgba(237,189,25,.3); }
        .inv-btn.comp { background: #25D366; color: #06081a; box-shadow: 0 6px 18px rgba(37,211,102,.3); }
        .inv-btn:disabled { opacity: .4; cursor: default; }
        .inv-sacar { background: none; border: none; color: #fca5a5; font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; justify-self: start; padding: 0; }
        .inv-vista canvas { width: 100%; max-width: 400px; aspect-ratio: 2 / 3; display: block; margin: 0 auto; border-radius: 22px; box-shadow: 0 18px 50px rgba(0,0,0,.5); background: #0a1435; }
      ` }} />
      <div className="inv-in">
        <div>
          <h2>INVITACIÓN <span>DIGITAL GRATIS</span> 💌</h2>
          <p className="inv-bajada">¿Ya tenés tu fecha en Big Bang? Armá la invitación de la misión espacial en un minuto y mandala por WhatsApp a todos los invitados.</p>
          <div className="inv-form">
            <label className="ancho">Nombre del cumpleañero/a<input value={d.nombre} onChange={set('nombre')} maxLength={24} placeholder="Ej: Juli Pérez" /></label>
            <label>¿Cuántos cumple?<input value={d.edad} onChange={e => setD(v => ({ ...v, edad: e.target.value.replace(/\D/g, '').slice(0, 2) }))} inputMode="numeric" placeholder="Ej: 6" /></label>
            <label>Fecha<input type="date" value={d.fecha} onChange={set('fecha')} /></label>
            <label>Turno<select value={d.turno} onChange={set('turno')}>{TURNOS.map(t => <option key={t}>{t}</option>)}</select></label>
            <label>WhatsApp para confirmar<input value={d.confirmar} onChange={set('confirmar')} inputMode="tel" maxLength={20} placeholder="Ej: 261 555-1234" /></label>
            <label className="ancho">Foto del cumpleañero/a (opcional, va en el casco)
              <input type="file" accept="image/*" onChange={elegirFoto} />
            </label>
            {foto && <button className="inv-sacar ancho" onClick={() => setFoto(null)}>✕ Sacar la foto</button>}
          </div>
          <p className="inv-priv">🔒 La invitación (y la foto) se arman en tu celu: no guardamos ni enviamos ningún dato.</p>
        </div>
        <div className="inv-vista">
          <h3>👇 Así queda tu invitación</h3>
          <canvas ref={cv} width={W} height={H} aria-label="Vista previa de la invitación" />
          {!d.nombre && <p className="inv-falta">Escribí el nombre del cumpleañero/a para poder descargarla</p>}
          <div className="inv-botones">
            <button className="inv-btn desc" onClick={descargar} disabled={!listo || !d.nombre}>⬇️ Descargar invitación</button>
            {puedeCompartir && <button className="inv-btn comp" onClick={compartir} disabled={!listo || !d.nombre}>📲 Compartir</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
