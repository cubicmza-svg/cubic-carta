import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { ensureGlowUpTables, getGUCatalogo, addGUCatalogo } from '@/lib/glowupDb';

export async function GET() {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureGlowUpTables();
  return Response.json(await getGUCatalogo());
}

export async function POST(req: Request) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureGlowUpTables();
  return Response.json(await addGUCatalogo(await req.json()), { status: 201 });
}
