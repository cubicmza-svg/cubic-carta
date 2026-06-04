import { isAuthenticated } from '@/lib/adminAuth';
import { updateItem, deleteItem } from '@/lib/kv';

type Ctx = { params: { id: string } };

// PUT — actualizar ítem
export async function PUT(req: Request, { params }: Ctx) {
  if (!isAuthenticated()) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const updated = await updateItem(params.id, body);
    return Response.json(updated);
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Error al actualizar';
    return Response.json({ error: msg }, { status: 500 });
  }
}

// DELETE — eliminar ítem
export async function DELETE(_: Request, { params }: Ctx) {
  if (!isAuthenticated()) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    await deleteItem(params.id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Error al eliminar';
    return Response.json({ error: msg }, { status: 500 });
  }
}
