'use client';
import { useEffect, useRef, useState } from 'react';

// El astronauta guía: flota en la esquina inferior izquierda (la derecha es del WhatsApp y de la Low Cost),
// acompaña el scroll y en cada sección dice algo. El globito aparece al entrar a la sección y se guarda solo
// a los pocos segundos; tocando al astronauta se vuelve a abrir. Con la × se calla por el resto de la visita.
// Sin precios en los textos: los precios viven en el panel de la web.

type Parada = { id: string; texto: string; img: string; cta?: { label: string; href: string } };

const PULGAR = '/bigbang/inv/astronauta-pulgar.png';
const ESTRELLA = '/bigbang/inv/astronauta-estrella.png';
const TORTA = '/bigbang/astronauta-torta.png';
const NAVE = '/bigbang/nave-astronauta.png';

// en el orden en que aparecen en la página
const PARADAS: Parada[] = [
  { id: 'inicio', texto: '¡Hola, terrícola! 👋 Soy tu guía en Big Bang. Bajá que te muestro la nave.', img: PULGAR },
  { id: 'salon', texto: '3 inflables y 2 laberintos gigantes… ¿te animás a llegar al final? 🏃', img: ESTRELLA },
  { id: 'tour', texto: 'Pasá, pasá: recorré el salón en 360° sin moverte del sillón 🕹️', img: PULGAR },
  { id: 'galeria', texto: 'Así la pasamos acá. ¡Mirá esas caras de felicidad! 🎉', img: ESTRELLA },
  { id: 'promos', texto: '¿No sabés qué promo elegir? Más abajo te ayudo a armarlo 👇', img: PULGAR, cta: { label: 'Armá tu cumple', href: '#arma' } },
  { id: 'arma', texto: 'Elegí promo, día y extras: yo te hago la cuenta al toque 🧮', img: TORTA },
  { id: 'menu', texto: 'Acá están todos los precios, sin letra chica 📋', img: PULGAR },
  { id: 'invitacion', texto: 'Poné el nombre del cumpleañero y te armo la invitación gratis 💌', img: ESTRELLA },
  { id: 'contacto', texto: '¿Despegamos? Escribinos por WhatsApp y reservá tu fecha 🚀', img: NAVE, cta: { label: '💬 Escribir', href: 'wa' } },
];

const CALLADO = 'bb-guia-callado';
const MOSTRAR_MS = 7000;

export default function AstronautaGuia({ waHref }: { waHref: string }) {
  const [actual, setActual] = useState(0);
  const [globo, setGlobo] = useState(false);
  const [moviendo, setMoviendo] = useState(false);
  const [listo, setListo] = useState(false);
  const callado = useRef(false);
  const timerGlobo = useRef<ReturnType<typeof setTimeout>>();

  function abrirGlobo(auto: boolean) {
    if (auto && callado.current) return;
    setGlobo(true);
    clearTimeout(timerGlobo.current);
    if (auto) timerGlobo.current = setTimeout(() => setGlobo(false), MOSTRAR_MS);
  }

  // qué sección está en pantalla: la última cuyo borde de arriba ya pasó la mitad de la pantalla
  useEffect(() => {
    try { callado.current = sessionStorage.getItem(CALLADO) === '1'; } catch {}
    PARADAS.forEach(p => { const i = new Image(); i.src = p.img; });

    let quieto: ReturnType<typeof setTimeout>;
    let raf = 0;
    const medir = () => {
      raf = 0;
      const linea = window.innerHeight * 0.55;
      let idx = 0;
      PARADAS.forEach((p, i) => {
        const el = document.getElementById(p.id);
        if (el && el.getBoundingClientRect().top < linea) idx = i;
      });
      setActual(prev => (prev === idx ? prev : idx));
    };
    const onScroll = () => {
      setMoviendo(true);
      clearTimeout(quieto);
      quieto = setTimeout(() => setMoviendo(false), 220);
      if (!raf) raf = requestAnimationFrame(medir);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    medir();
    const t = setTimeout(() => { setListo(true); abrirGlobo(true); }, 1200);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      clearTimeout(t); clearTimeout(quieto); clearTimeout(timerGlobo.current);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // al cambiar de sección habla de nuevo
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) { primera.current = false; return; }
    abrirGlobo(true);
  }, [actual]);

  function callar() {
    callado.current = true;
    try { sessionStorage.setItem(CALLADO, '1'); } catch {}
    clearTimeout(timerGlobo.current);
    setGlobo(false);
  }

  function tocarAstronauta() {
    if (globo) { setGlobo(false); return; }
    callado.current = false;
    try { sessionStorage.removeItem(CALLADO); } catch {}
    abrirGlobo(false);
  }

  const p = PARADAS[actual];
  const ctaHref = p.cta?.href === 'wa' ? waHref : p.cta?.href;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .guia { position: fixed; left: 18px; bottom: 18px; z-index: 190; display: flex; align-items: flex-end; gap: 6px;
          pointer-events: none; opacity: 0; transform: translateY(40px); transition: opacity .5s, transform .6s cubic-bezier(.2,1.4,.4,1); }
        .guia.listo { opacity: 1; transform: none; }
        .guia-astro { pointer-events: auto; width: 104px; height: 104px; border: none; background: none; padding: 0; cursor: pointer; flex: none;
          animation: guia-flota 3.2s ease-in-out infinite; -webkit-tap-highlight-color: transparent; }
        .guia-astro img { width: 100%; height: 100%; object-fit: contain; display: block; filter: drop-shadow(0 8px 14px rgba(0,0,0,.5));
          transition: transform .35s cubic-bezier(.2,1.4,.4,1); }
        .guia.moviendo .guia-astro img { transform: rotate(-10deg) translateY(-8px) scale(1.04); }
        .guia-astro img.salta { animation: guia-salto .6s cubic-bezier(.2,1.5,.4,1); }
        @keyframes guia-flota { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-9px) rotate(3deg); } }
        @keyframes guia-salto { 0% { transform: scale(.6) rotate(-14deg); } 100% { transform: none; } }

        .guia-globo { pointer-events: auto; position: relative; margin-bottom: 64px; max-width: 250px;
          background: #fff; color: #0f172a; border-radius: 20px 20px 20px 6px; padding: 13px 34px 13px 15px;
          font-size: 14px; font-weight: 700; line-height: 1.35; box-shadow: 0 10px 30px rgba(0,0,0,.45), 0 0 0 3px rgba(253,224,71,.85);
          transform-origin: 0% 100%; animation: guia-pop .4s cubic-bezier(.2,1.5,.4,1) both; }
        .guia-globo::before { content: ''; position: absolute; left: -9px; bottom: 10px; border: 9px solid transparent;
          border-right-color: #fff; border-left: 0; }
        @keyframes guia-pop { 0% { transform: scale(.3) translate(-20px, 20px); opacity: 0; } 100% { transform: none; opacity: 1; } }
        .guia-x { position: absolute; top: 6px; right: 6px; width: 24px; height: 24px; border-radius: 50%; border: none;
          background: #f1f5f9; color: #64748b; font-size: 15px; line-height: 1; cursor: pointer; }
        .guia-cta { display: inline-block; margin-top: 8px; padding: 6px 12px; border-radius: 99px; background: #fde047; color: #0f172a;
          font-weight: 900; font-size: 13px; text-decoration: none; }
        .guia-cta.wa { background: #25D366; }

        /* en el celu el globito va arriba del astronauta y angosto, para no pisar la pastilla Low Cost ni el WhatsApp */
        @media (max-width: 640px) {
          .guia { left: 10px; bottom: 12px; flex-direction: column-reverse; align-items: flex-start; gap: 10px; }
          .guia-astro { width: 76px; height: 76px; }
          .guia-globo { max-width: calc(100vw - 215px); min-width: 150px; margin-bottom: 0; font-size: 13px; padding: 11px 28px 11px 13px;
            border-radius: 18px 18px 18px 6px; transform-origin: 20% 100%; }
          .guia-globo::before { left: 22px; bottom: -9px; border: 9px solid transparent; border-top-color: #fff; border-bottom: 0; }
        }
        /* mientras está abierta la tarjeta de la Low Cost, en el celu se corre para no taparla */
        @media (max-width: 640px) { body:has(.lc-tarjeta) .guia { opacity: 0; pointer-events: none; } }
        @media (prefers-reduced-motion: reduce) {
          .guia, .guia-astro, .guia-astro img, .guia-globo { animation: none !important; transition: none !important; }
        }
      ` }} />

      <div className={`guia${listo ? ' listo' : ''}${moviendo ? ' moviendo' : ''}`}>
        <button className="guia-astro" onClick={tocarAstronauta} aria-label={globo ? 'Ocultar mensaje del guía' : 'Ver mensaje del guía'}>
          <img key={p.img} className="salta" src={p.img} alt="" />
        </button>
        {globo && (
          <div key={p.id} className="guia-globo" role="status">
            <button className="guia-x" onClick={callar} aria-label="Silenciar al guía">×</button>
            {p.texto}
            {p.cta && ctaHref && (
              <div>
                <a className={`guia-cta${p.cta.href === 'wa' ? ' wa' : ''}`} href={ctaHref}
                  {...(p.cta.href === 'wa' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{p.cta.label}</a>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
