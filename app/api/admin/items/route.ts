import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllItems, addItem } from '@/lib/sheetsAdmin';
import type { MenuItem } from '@/lib/types';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const items = await getAllItems();
    return Response.json(items);
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error al obtener ítems' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body: Omit<MenuItem, 'id'> = await req.json();
    const item = await addItem(body);
    return Response.json(item, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error al crear ítem' }, { status: 500 });
  }
}
