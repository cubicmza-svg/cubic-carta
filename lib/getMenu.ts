import { getAllItems } from './kv';
import type { MenuItem, MenuGroup } from './types';

// Re-exportar los tipos para que los componentes existentes no cambien su import
export type { MenuItem, MenuGroup };

export async function getMenu(): Promise<MenuItem[]> {
  const items = await getAllItems();
  // Solo mostrar ítems activos en la carta pública
  return items.filter((i) => i.activo);
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
