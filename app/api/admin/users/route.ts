import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUsers, addUser } from '@/lib/sheetsAdmin';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'superadmin')
    return Response.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const users = await getUsers();
    // Never expose password hashes
    return Response.json(users.map(({ password_hash: _, ...u }) => u));
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'superadmin')
    return Response.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { email, password, nombre, rol } = await req.json();
    if (!email || !password || !nombre)
      return Response.json({ error: 'Faltan campos requeridos' }, { status: 400 });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await addUser({ email, password_hash, nombre, rol: rol ?? 'admin', activo: true });
    const { password_hash: _, ...safe } = user;
    return Response.json(safe, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}
