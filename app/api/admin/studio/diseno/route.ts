import { isAuthenticated } from '@/lib/adminAuth';
import { getDiseno, addDiseno } from '@/lib/studioDb';

export async function GET() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const rows = await getDiseno();
  return Response.json(rows);
}

export async function POST(req: Request) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  const row = await addDiseno(body);
  return Response.json(row);
}
