import { isAuthenticated } from '@/lib/adminAuth';
import { updateGUDiseno, deleteGUDiseno } from '@/lib/glowupDb';
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  return Response.json(await updateGUDiseno(parseInt(params.id), await req.json()));
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await deleteGUDiseno(parseInt(params.id));
  return Response.json({ ok: true });
}
