import { isAuthenticated } from '@/lib/adminAuth';
import { ensureStudioTables, getRedes, addRedes } from '@/lib/studioDb';

export async function GET() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureStudioTables();
  const rows = await getRedes();
  return Response.json(rows);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  const row = await addRedes(body);
  return Response.json(row);
}
