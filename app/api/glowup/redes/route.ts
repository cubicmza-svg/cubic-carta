import { isAuthenticated } from '@/lib/adminAuth';
import { ensureGlowUpTables, getGURedes, addGURedes } from '@/lib/glowupDb';
export async function GET() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureGlowUpTables();
  return Response.json(await getGURedes());
}
export async function POST(req: Request) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  return Response.json(await addGURedes(await req.json()), { status: 201 });
}
