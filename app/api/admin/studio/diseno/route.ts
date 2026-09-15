import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { ensureStudioTables, getDiseno, addDiseno } from '@/lib/studioDb';

export async function GET() {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureStudioTables();
  const rows = await getDiseno();
  return Response.json(rows);
}

export async function POST(req: Request) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const body = await req.json();
  const row = await addDiseno(body);
  return Response.json(row);
}
