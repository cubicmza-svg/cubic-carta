import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { ensureGlowUpTables, getGURedes, addGURedes } from '@/lib/glowupDb';
export const dynamic = 'force-dynamic';
export async function GET() {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureGlowUpTables();
  return Response.json(await getGURedes());
}
export async function POST(req: Request) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureGlowUpTables();
  return Response.json(await addGURedes(await req.json()), { status: 201 });
}
