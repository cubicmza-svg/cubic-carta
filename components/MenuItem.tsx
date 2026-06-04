'use client';

import Image from 'next/image';
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

function PlaceholderImage({ nombre }: { nombre: string }) {
  const initial = nombre?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-cubic-card-hover flex items-center justify-center">
      <span className="font-bebas text-3xl text-cubic-accent">{initial}</span>
    </div>
  );
}

export default function MenuItem({ item }: Props) {
  const hasImage = Boolean(item.imagen_url);

  return (
    <div className="group flex gap-4 p-4 rounded-xl bg-cubic-card border border-cubic-border hover:border-cubic-accent transition-all duration-300">
      {/* Imagen o placeholder */}
      {hasImage ? (
        <div className="w-24 h-24 flex-shrink-0 relative rounded-lg overflow-hidden">
          <Image
            src={item.imagen_url}
            alt={item.nombre}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
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
  );
}
