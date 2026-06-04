import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateUser } from '@/lib/sheetsAdmin';
import bcrypt from 'bcryptjs';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'superadmin')
    return Response.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.nombre !== undefined) updates.nombre = body.nombre;
    if (body.rol !== undefined) updates.rol = body.rol;
    if (body.activo !== undefined) updates.activo = body.activo;
    if (body.password) updates.password_hash = await bcrypt.hash(body.password, 10);

    const updated = await updateUser(params.id, updates);
    const { password_hash: _, ...safe } = updated;
    return Response.json(safe);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}
