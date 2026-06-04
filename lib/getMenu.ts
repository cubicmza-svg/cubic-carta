import { getAllItems } from './db';
import type { MenuItem, MenuGroup } from './types';

export type { MenuItem, MenuGroup };

export async function getMenu(): Promise<MenuItem[]> {
  try {
    const items = await getAllItems();
    return items.filter((i) => i.activo);
  } catch (err) {
    console.error('[getMenu] Error al leer de PostgreSQL:', err);
    return [];
  }
}

export function groupByCategoria(items: MenuItem[]): MenuGroup[] {
  const map = new Map<string, MenuGroup>();
  for (const item of items) {
    if (!map.has(item.categoria)) {
      map.set(item.categoria, { categoria: item.categoria, subcategorias: {} });
    }
    const group = map.get(item.categoria)!;
    const sub = item.subcategoria || '_';
    if (!group.subcategorias[sub]) group.subcategorias[sub] = [];
    group.subcategorias[sub].push(item);
  }
  return Array.from(map.values());
}
