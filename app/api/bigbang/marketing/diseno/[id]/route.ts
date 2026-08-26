import { isAuthenticated } from '@/lib/adminAuth';
import { updateBBDiseno, deleteBBDiseno } from '@/lib/bigbangDb';
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  return Response.json(await updateBBDiseno(parseInt(params.id), await req.json()));
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await deleteBBDiseno(parseInt(params.id));
  return Response.json({ ok: true });
}
