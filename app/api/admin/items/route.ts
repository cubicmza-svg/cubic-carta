import { isAuthenticated } from '@/lib/adminAuth';
import { getAllItems, addItem } from '@/lib/kv';
import type { MenuItem } from '@/lib/types';

// GET — listar todos los ítems (admin)
export async function GET() {
  if (!isAuthenticated()) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const items = await getAllItems();
    return Response.json(items);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error al obtener ítems' }, { status: 500 });
  }
}

// POST — agregar ítem nuevo
export async function POST(req: Request) {
  if (!isAuthenticated()) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const body: Omit<MenuItem, 'id'> = await req.json();
    if (!body.nombre?.trim()) {
      return Response.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    const item = await addItem(body);
    return Response.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Error al crear ítem';
    return Response.json({ error: msg }, { status: 500 });
  }
}
