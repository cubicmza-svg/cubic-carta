import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { ensureGlowUpTables, getGUServicios, addGUServicio } from '@/lib/glowupDb';
export async function GET() {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureGlowUpTables();
  return Response.json(await getGUServicios());
}
export async function POST(req: Request) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  return Response.json(await addGUServicio(await req.json()), { status: 201 });
}
