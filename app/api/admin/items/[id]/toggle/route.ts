import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toggleItem } from '@/lib/sheetsAdmin';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { activo }: { activo: boolean } = await req.json();
    await toggleItem(params.id, activo);
    return Response.json({ ok: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error al cambiar estado' }, { status: 500 });
  }
}
