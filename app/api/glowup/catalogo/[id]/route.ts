import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { updateGUCatalogo, deleteGUCatalogo } from '@/lib/glowupDb';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  return Response.json(await updateGUCatalogo(Number(id), await req.json()));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const { id } = await params;
  await deleteGUCatalogo(Number(id));
  return Response.json({ ok: true });
}
