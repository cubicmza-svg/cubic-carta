import { kv } from '@vercel/kv';
import type { MenuItem } from './types';
import { SEED_ITEMS } from './seedData';

export const KV_KEY = 'cubic:menu';

function configured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// ── Leer ─────────────────────────────────────────────────────────────────────
export async function getAllItems(): Promise<MenuItem[]> {
  if (!configured()) {
    console.warn('[KV] No configurado — usando datos de seed (solo lectura)');
    return SEED_ITEMS;
  }
  try {
    const data = await kv.get<MenuItem[]>(KV_KEY);
    // Si KV está vacío, devolver seed como fallback visual
    return data && data.length > 0 ? data : SEED_ITEMS;
  } catch (err) {
    console.error('[KV] Error al leer:', err);
    return SEED_ITEMS;
  }
}

// ── Escribir (requiere KV configurado) ───────────────────────────────────────
function requireKV(): void {
  if (!configured()) {
    throw new Error('KV no configurado. Agregá KV_REST_API_URL y KV_REST_API_TOKEN en las variables de entorno.');
  }
}

async function saveAll(items: MenuItem[]): Promise<void> {
  requireKV();
  await kv.set(KV_KEY, items);
}

// ── CRUD ──────────────────────────────────────────────────────────────────────
export async function addItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  const items = await getAllItems();
  const newItem: MenuItem = { ...data, id: crypto.randomUUID() };
  await saveAll([...items, newItem]);
  return newItem;
}

export async function updateItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
  const items = await getAllItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error(`Ítem ${id} no encontrado`);
  items[idx] = { ...items[idx], ...data, id };
  await saveAll(items);
  return items[idx];
}

export async function deleteItem(id: string): Promise<void> {
  const items = await getAllItems();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) throw new Error(`Ítem ${id} no encontrado`);
  await saveAll(filtered);
}

export async function seedItems(): Promise<number> {
  requireKV();
  await kv.set(KV_KEY, SEED_ITEMS);
  return SEED_ITEMS.length;
}
