'use client';

import { useEffect, useState } from 'react';
import type { MenuItem as MenuItemType } from '@/lib/getMenu';

interface Props {
  item: MenuItemType;
}

function formatPrice(price: number): string {
  if (!price || price === 0) return 'Consultar';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({
  src,
  alt,
  nombre,
  descripcion,
  precio,
  onClose,
}: {
  src: string;
  alt: string;
  nombre: string;
  descripcion: string;
  precio: number;
  onClose: () => void;
}) {
  // Cerrar con ESC y bloquear scroll del body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    /* Overlay — click fuera de la imagen cierra */
    <div
      className="lb-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(10, 8, 16, 0.92)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen de ${nombre}`}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full font-dm text-white text-lg transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.22)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
        aria-label="Cerrar"
      >
        ✕
      </button>

      {/* Contenedor de imagen — stopPropagation para que click en imagen no cierre */}
      <div
        className="lb-image relative flex flex-col items-center"
        style={{ maxWidth: 'min(92vw, 680px)', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="rounded-2xl object-contain shadow-2xl"
          style={{
            maxWidth: '100%',
            maxHeight: 'calc(90vh - 90px)', // dejar espacio para el caption
            display: 'block',
          }}
        />

        {/* Caption */}
        <div className="w-full mt-4 px-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-bebas text-white text-2xl tracking-widest leading-tight">
                {nombre}
              </p>
              {descripcion && (
                <p className="font-dm text-[#9B97A8] text-sm mt-0.5 leading-snug">
                  {descripcion}
                </p>
              )}
            </div>
            <span className="font-bebas text-[#4ADE80] text-2xl tracking-wide flex-shrink-0">
              {formatPrice(precio)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder cuando no hay imagen ────────────────────────────────────────
function PlaceholderImage({ nombre }: { nombre: string }) {
  return (
    <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-cubic-card-hover flex items-center justify-center">
      <span className="font-bebas text-3xl text-cubic-accent">
        {nombre?.charAt(0)?.toUpperCase() ?? '?'}
      </span>
    </div>
  );
}

// ─── Card del ítem ────────────────────────────────────────────────────────────
export default function MenuItem({ item }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasImage = Boolean(item.imagen_url);

  return (
    <>
      <div className="group flex gap-4 p-4 rounded-xl bg-cubic-card border border-cubic-border hover:border-cubic-accent transition-all duration-300">

        {/* Imagen o placeholder */}
        {hasImage ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="w-24 h-24 flex-shrink-0 relative rounded-lg overflow-hidden cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-cubic-accent"
            aria-label={`Ver foto de ${item.nombre}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imagen_url}
              alt={item.nombre}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hint de zoom al hover */}
            <span
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xl"
              style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
              aria-hidden
            >
              🔍
            </span>
          </button>
        ) : (
          <PlaceholderImage nombre={item.nombre} />
        )}

        {/* Contenido */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
          <div>
            <h3 className="font-dm font-semibold text-white text-base leading-snug">
              {item.nombre}
            </h3>
            {item.descripcion && (
              <p className="font-dm text-cubic-muted text-sm mt-0.5 leading-snug">
                {item.descripcion}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="font-bebas text-cubic-accent text-xl tracking-wide">
              {formatPrice(item.precio)}
            </span>
            {item.precio_alternativo && (
              <span className="text-xs font-dm text-cubic-muted bg-cubic-card-hover px-2 py-0.5 rounded-full border border-cubic-border">
                {item.precio_alternativo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          src={item.imagen_url}
          alt={item.nombre}
          nombre={item.nombre}
          descripcion={item.descripcion}
          precio={item.precio}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
