'use client';
import { useEffect, useState } from 'react';

// Pop-up de la Promo Low Cost: a los pocos segundos entra una nave (el astronauta en su cohete) desde la esquina
// inferior derecha, "suelta" la tarjeta de la promo arriba del botón de WhatsApp y sigue viaje.
// Si la cierran, no vuelve a volar en esa visita: queda una pastilla "🚀 Low Cost" para abrirla de nuevo.
// Condiciones de la promo confirmadas por Big Bang (bigbang-contenido/PRECIOS.md); el precio sale del panel de precios web.

const VISTO = 'bb-lowcost-visto';
const ESPERA_MS = 3500;

type Fase = 'espera' | 'volando' | 'abierto' | 'cerrado';

export default function PopupLowCost({ precio, waHref }: { precio: string; waHref: string }) {
  const [fase, setFase] = useState<Fase>('espera');
  const [reabierta, setReabierta] = useState(false);

  useEffect(() => {
    let visto = false;
    try { visto = sessionStorage.getItem(VISTO) === '1'; } catch {}
    if (visto) { setFase('cerrado'); return; }
    const t = setTimeout(() => setFase('volando'), ESPERA_MS);
    return () => clearTimeout(t);
  }, []);

  // la nave termina su recorrido y queda solo la tarjeta
  useEffect(() => {
    if (fase !== 'volando') return;
    const t = setTimeout(() => setFase('abierto'), 2400);
    return () => clearTimeout(t);
  }, [fase]);

  useEffect(() => {
    if (fase !== 'volando' && fase !== 'abierto') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fase]);

  function cerrar() {
    try { sessionStorage.setItem(VISTO, '1'); } catch {}
    setFase('cerrado');
  }

  const tarjetaVisible = fase === 'volando' || fase === 'abierto';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .lc-nave {
          position: fixed; z-index: 260; right: 40px; bottom: 150px; width: 150px;
          pointer-events: none; animation: lc-vuelo 2.4s cubic-bezier(.3,.7,.4,1) forwards;
          filter: drop-shadow(0 10px 18px rgba(0,0,0,.45));
        }
        .lc-nave img { width: 100%; display: block; }
        @keyframes lc-vuelo {
          0%   { transform: translate(260px, 300px) rotate(-18deg) scale(.55); opacity: 0; }
          8%   { opacity: 1; }
          42%  { transform: translate(0, 0) rotate(-6deg) scale(1); }
          52%  { transform: translate(6px, -8px) rotate(-2deg) scale(1); }
          100% { transform: translate(-115vw, -95vh) rotate(-24deg) scale(.45); opacity: 0; }
        }
        .lc-estela {
          position: fixed; z-index: 255; right: 70px; bottom: 170px; width: 10px; height: 10px; border-radius: 50%;
          background: #fde047; box-shadow: 0 0 18px 8px rgba(253,224,71,.55); pointer-events: none;
          animation: lc-chispa 1.1s ease-out .9s forwards; opacity: 0;
        }
        @keyframes lc-chispa { 0% { opacity: 1; transform: scale(.4); } 100% { opacity: 0; transform: scale(9); } }

        .lc-tarjeta {
          position: fixed; z-index: 250; right: 24px; bottom: 100px; width: min(350px, calc(100vw - 32px));
          background: linear-gradient(160deg, #1b1446 0%, #0b0e2a 70%); color: #e2e8f0;
          border: 2px solid rgba(34,197,94,.55); border-radius: 26px; padding: 22px 22px 18px;
          box-shadow: 0 18px 50px rgba(0,0,0,.55), 0 0 0 6px rgba(34,197,94,.08);
          transform-origin: 85% 100%;
        }
        .lc-tarjeta.entra { animation: lc-pop .55s cubic-bezier(.2,1.5,.4,1) 1s both; }
        .lc-tarjeta.reabre { animation: lc-pop .45s cubic-bezier(.2,1.5,.4,1) both; }
        @keyframes lc-pop {
          0%   { transform: translate(40px, 40px) scale(.15) rotate(8deg); opacity: 0; }
          100% { transform: none; opacity: 1; }
        }
        .lc-cerrar {
          position: absolute; top: 10px; right: 12px; width: 34px; height: 34px; border-radius: 50%;
          border: none; background: rgba(255,255,255,.08); color: #cbd5e1; font-size: 20px; line-height: 1; cursor: pointer;
        }
        .lc-cerrar:hover { background: rgba(255,255,255,.16); color: #fff; }
        .lc-kicker { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase;
          color: #0b0e2a; background: #fde047; padding: 5px 10px; border-radius: 99px; }
        .lc-titulo { font-family: 'SuperHistories', sans-serif; font-size: 30px; line-height: 1; color: #fff; margin: 12px 0 2px; letter-spacing: .5px; }
        .lc-titulo span { color: #22c55e; }
        .lc-precio { font-family: 'SuperHistories', sans-serif; font-size: 46px; line-height: 1.05; color: #fde047; text-shadow: 0 0 22px rgba(253,224,71,.35); }
        .lc-lista { list-style: none; display: grid; gap: 6px; margin: 12px 0 10px; font-size: 14px; font-weight: 600; }
        .lc-lista li { display: flex; gap: 8px; align-items: flex-start; }
        .lc-incluye { font-size: 12px; color: #94a3b8; line-height: 1.45; }
        .lc-aviso { margin-top: 8px; font-size: 12px; font-weight: 700; color: #fca5a5; }
        .lc-cta {
          display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; padding: 13px 16px;
          border-radius: 99px; background: #25D366; color: #06081a; font-weight: 900; font-size: 15px; text-decoration: none;
          box-shadow: 0 6px 18px rgba(37,211,102,.4); transition: transform .2s;
        }
        .lc-cta:hover { transform: translateY(-2px); }
        .lc-pastilla {
          position: fixed; z-index: 199; right: 24px; bottom: 96px; border: 2px solid rgba(34,197,94,.6);
          background: #0e1540; color: #fff; font-weight: 800; font-size: 13px; padding: 9px 14px; border-radius: 99px;
          cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,.4); animation: lc-flota 3s ease-in-out infinite;
        }
        @keyframes lc-flota { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        @media (max-width: 640px) {
          .lc-tarjeta { right: 16px; bottom: 96px; padding: 20px 18px 16px; }
          .lc-nave { right: 20px; bottom: 140px; width: 120px; }
          .lc-titulo { font-size: 26px; } .lc-precio { font-size: 40px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lc-nave, .lc-estela { display: none; }
          .lc-tarjeta.entra, .lc-tarjeta.reabre, .lc-pastilla { animation: none; }
        }
      ` }} />

      {fase === 'volando' && (
        <>
          <div className="lc-nave" aria-hidden="true"><img src="/bigbang/nave-astronauta.png" alt="" /></div>
          <div className="lc-estela" aria-hidden="true" />
        </>
      )}

      {tarjetaVisible && (
        <div className={`lc-tarjeta ${fase === 'volando' ? 'entra' : reabierta ? 'reabre' : ''}`} role="dialog" aria-label="Promo Low Cost">
          <button className="lc-cerrar" onClick={cerrar} aria-label="Cerrar">×</button>
          <span className="lc-kicker">🚀 Big Bang te ayuda este fin de año</span>
          <div className="lc-titulo">Promo <span>Low Cost</span></div>
          <div className="lc-precio">{precio}</div>
          <ul className="lc-lista">
            <li>⏱️ Turno de 3 horas</li>
            <li>👥 Hasta 30 personas</li>
            <li>📅 Todos los días, en cualquiera de los 3 turnos</li>
          </ul>
          <p className="lc-incluye">
            Incluye coordinadora, cocinera, auxiliar de control de niños, laberintos, plaza blanda, inflables, pool, metegol, ping pong y tejo.
          </p>
          <p className="lc-aviso">No incluye la sala de videojuegos · Pago contado en efectivo al contratar</p>
          <a className="lc-cta" href={waHref} target="_blank" rel="noopener noreferrer">💬 Quiero la Low Cost</a>
        </div>
      )}

      {fase === 'cerrado' && (
        <button className="lc-pastilla" onClick={() => { setReabierta(true); setFase('abierto'); }} aria-label="Ver la Promo Low Cost">🚀 Low Cost {precio}</button>
      )}
    </>
  );
}
