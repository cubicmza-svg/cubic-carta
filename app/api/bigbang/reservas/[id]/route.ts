import { isAuthenticated } from '@/lib/adminAuth';
import { updateReserva, deleteReserva } from '@/lib/bigbangDb';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  return Response.json(await updateReserva(parseInt(params.id), await req.json()));
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await deleteReserva(parseInt(params.id));
  return Response.json({ ok: true });
}
