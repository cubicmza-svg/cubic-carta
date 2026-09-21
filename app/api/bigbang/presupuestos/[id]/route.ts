import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { updatePresupuesto, deletePresupuesto } from '@/lib/bigbangDb';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  return Response.json(await updatePresupuesto(parseInt(params.id), await req.json()));
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await deletePresupuesto(parseInt(params.id));
  return Response.json({ ok: true });
}
