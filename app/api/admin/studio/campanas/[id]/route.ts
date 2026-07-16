import { isAuthenticated } from '@/lib/adminAuth';
import { updateCampana, deleteCampana } from '@/lib/studioDb';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  const row = await updateCampana(parseInt(params.id, 10), body);
  return Response.json(row);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await deleteCampana(parseInt(params.id, 10));
  return Response.json({ ok: true });
}
