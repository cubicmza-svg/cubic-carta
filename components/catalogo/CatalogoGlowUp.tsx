'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Item {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string;
  incluye: string;
  precio_desde: number;
  imagen_url: string;
}

const GU = '#db2777';
const WA_NUM = '5492615734018';

export default function CatalogoGlowUp() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [catActiva, setCatActiva] = useState<string>('Todos');

  useEffect(() => {
    fetch('/api/glowup/catalogo-publico')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const categorias = ['Todos', ...Array.from(new Set(items.map(i => i.categoria).filter(Boolean)))];
  const filtrados = catActiva === 'Todos' ? items : items.filter(i => i.categoria === catActiva);

  function waLink(item: Item) {
    const msg = encodeURIComponent(`Hola Tami! Vi tu catálogo y me interesa: ${item.nombre} 🎀`);
    return `https://wa.me/${WA_NUM}?text=${msg}`;
  }

  const PASTEL_DOTS = [
    { color: '#fbcfe8', x: '5%',  y: '10%', size: 300 },
    { color: '#ddd6fe', x: '75%', y: '5%',  size: 260 },
    { color: '#bfdbfe', x: '85%', y: '55%', size: 200 },
    { color: '#bbf7d0', x: '2%',  y: '65%', size: 180 },
    { color: '#fef08a', x: '50%', y: '80%', size: 150 },
  ];

  return (
    <div className="relative min-h-screen" style={{ background: '#fefcff' }}>

      {/* Manchas pastel */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {PASTEL_DOTS.map((d, i) => (
          <div key={i} style={{
            position: 'absolute', left: d.x, top: d.y,
            width: d.size, height: d.size, borderRadius: '50%',
            background: d.color, opacity: 0.25, filter: 'blur(80px)',
          }} />
        ))}
      </div>

      {/* Franja rainbow */}
      <div className="h-2 w-full" style={{
        background: 'linear-gradient(90deg,#fbcfe8,#ddd6fe,#bfdbfe,#bbf7d0,#fef08a,#fbcfe8)',
        position: 'relative', zIndex: 2,
      }} />

      {/* Hero */}
      <div className="relative text-center px-6 pt-14 pb-10" style={{ zIndex: 1 }}>
        <div className="text-5xl mb-4">🎀</div>
        <h1 className="font-bebas text-5xl md:text-6xl tracking-widest text-gray-800 mb-2">
          GLOW UP DECO
        </h1>
        <p className="font-dm text-sm font-semibold uppercase tracking-widest mb-1"
          style={{ color: GU }}>Decoraciones personalizadas · Gran Mendoza</p>
        <p className="font-dm text-base text-gray-500 max-w-md mx-auto leading-relaxed mt-3">
          Cada evento es único. Trabajamos con vos para crear la decoración perfecta.
        </p>
        <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent('Hola Tami! Quiero consultar sobre decoración para mi evento 🎀')}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-2xl font-dm text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-85"
          style={{ background: GU }}>
          💬 Consultanos por WhatsApp
        </a>
      </div>

      {/* Filtros por categoría */}
      {categorias.length > 1 && (
        <div className="relative px-6 pb-6" style={{ zIndex: 1 }}>
          <div className="flex gap-2 flex-wrap justify-center">
            {categorias.map(cat => (
              <button key={cat} onClick={() => setCatActiva(cat)}
                className="font-dm text-sm font-semibold px-4 py-2 rounded-full transition-all"
                style={catActiva === cat
                  ? { background: GU, color: '#fff' }
                  : { background: '#fce7f3', color: '#be185d' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid de ítems */}
      <div className="relative px-6 pb-16 max-w-4xl mx-auto" style={{ zIndex: 1 }}>

        {loading && (
          <div className="py-20 text-center">
            <div className="font-dm text-sm text-gray-400">Cargando catálogo…</div>
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-dm text-4xl mb-4">🌸</p>
            <p className="font-dm text-base text-gray-500">
              El catálogo se está actualizando. ¡Escribinos para más info!
            </p>
            <a href={`https://wa.me/${WA_NUM}`} target="_blank" rel="noopener noreferrer"
              className="inline-block mt-4 font-dm text-sm font-semibold px-5 py-2 rounded-xl text-white"
              style={{ background: GU }}>
              Escribirnos →
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filtrados.map(item => {
            const incluye: string[] = (() => { try { return JSON.parse(item.incluye); } catch { return []; } })();
            return (
              <div key={item.id}
                className="rounded-3xl overflow-hidden shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                style={{ background: '#fff', border: '1.5px solid #fbcfe8' }}>

                {/* Imagen */}
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt={item.nombre}
                    className="w-full aspect-square object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center text-6xl"
                    style={{ background: 'linear-gradient(135deg,#fdf2f8,#fce7f3)' }}>
                    🎀
                  </div>
                )}

                {/* Contenido */}
                <div className="p-5">
                  <span className="font-dm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: '#fce7f3', color: '#be185d' }}>{item.categoria}</span>
                  <h2 className="font-bebas text-xl tracking-widest mt-2 text-gray-800">{item.nombre}</h2>

                  {item.descripcion && (
                    <p className="font-dm text-sm text-gray-500 leading-relaxed mt-1">{item.descripcion}</p>
                  )}

                  {incluye.length > 0 && (
                    <div className="mt-3">
                      <p className="font-dm text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">Incluye</p>
                      <div className="flex flex-wrap gap-1.5">
                        {incluye.map((inc, i) => (
                          <span key={i} className="font-dm text-xs px-2.5 py-1 rounded-full"
                            style={{ background: '#fdf2f8', color: '#be185d', border: '1px solid #fbcfe8' }}>
                            ✓ {inc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4"
                    style={{ borderTop: '1px solid #fce7f3' }}>
                    {item.precio_desde > 0 ? (
                      <p className="font-bebas text-xl" style={{ color: GU }}>
                        Desde ${item.precio_desde.toLocaleString('es-AR')}
                      </p>
                    ) : (
                      <p className="font-dm text-sm font-semibold text-gray-400">Consultar precio</p>
                    )}
                    <a href={waLink(item)} target="_blank" rel="noopener noreferrer"
                      className="font-dm text-xs font-semibold px-4 py-2 rounded-xl text-white transition-opacity hover:opacity-85"
                      style={{ background: GU }}>
                      Consultar →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="relative text-center py-10 px-6" style={{
        background: 'linear-gradient(180deg,transparent,#fdf2f8)',
        borderTop: '1px solid #fce7f3',
        zIndex: 1,
      }}>
        <p className="font-dm text-xs text-gray-400 uppercase tracking-widest mb-3">¿Tenés algo en mente?</p>
        <a href={`https://wa.me/${WA_NUM}?text=${encodeURIComponent('Hola Tami! Quiero consultar sobre decoración para mi evento 🎀')}`}
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-dm text-sm font-semibold px-6 py-3 rounded-2xl text-white shadow"
          style={{ background: GU }}>
          💬 Escribinos y armamos algo único para vos
        </a>
        <p className="font-dm text-xs text-gray-300 mt-6">
          🎀 Glow Up Deco · Gran Mendoza
        </p>
      </div>
    </div>
  );
}
