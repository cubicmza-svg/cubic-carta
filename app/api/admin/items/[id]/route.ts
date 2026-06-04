import { isAuthenticated } from '@/lib/adminAuth';
import { updateItem, deleteItem } from '@/lib/db';
import type { MenuItem } from '@/lib/types';

type Ctx = { params: { id: string } };

export async function PUT(req: Request, { params }: Ctx) {
  if (!isAuthenticated()) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return Response.json({ error: 'ID inválido' }, { status: 400 });

  try {
    const body: Omit<MenuItem, 'id'> = await req.json();
    const updated = await updateItem(id, body);
    return Response.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al actualizar';
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  if (!isAuthenticated()) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  const id = parseInt(params.id, 10);
  if (isNaN(id)) return Response.json({ error: 'ID inválido' }, { status: 400 });

  try {
    await deleteItem(id);
    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
