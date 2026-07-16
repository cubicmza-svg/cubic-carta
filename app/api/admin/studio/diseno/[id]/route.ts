import { isAuthenticated } from '@/lib/adminAuth';
import { updateDiseno, deleteDiseno } from '@/lib/studioDb';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const id = parseInt(params.id, 10);
  const body = await req.json();
  const row = await updateDiseno(id, body);
  return Response.json(row);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await deleteDiseno(parseInt(params.id, 10));
  return Response.json({ ok: true });
}
