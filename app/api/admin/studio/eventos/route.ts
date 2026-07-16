import { isAuthenticated } from '@/lib/adminAuth';
import { ensureStudioTables, getEventos, addEvento } from '@/lib/studioDb';

export async function GET() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureStudioTables();
  const rows = await getEventos();
  return Response.json(rows);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  const row = await addEvento(body);
  return Response.json(row);
}
