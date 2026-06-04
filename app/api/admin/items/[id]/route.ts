import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateItem, deleteItem } from '@/lib/sheetsAdmin';

type Params = { params: { id: string } };

export async function PUT(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const updated = await updateItem(params.id, body);
    return Response.json(updated);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error al actualizar ítem' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await deleteItem(params.id);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error al eliminar ítem' }, { status: 500 });
  }
}
