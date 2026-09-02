import { isAuthenticated } from '@/lib/adminAuth';
import { updateGUPedido, deleteGUPedido } from '@/lib/glowupDb';
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  return Response.json(await updateGUPedido(parseInt(params.id), await req.json()));
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await deleteGUPedido(parseInt(params.id));
  return Response.json({ ok: true });
}
