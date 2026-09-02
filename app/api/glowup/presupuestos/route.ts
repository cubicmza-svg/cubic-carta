import { isAuthenticated } from '@/lib/adminAuth';
import { ensureGlowUpTables, getGUPresupuestos, addGUPresupuesto } from '@/lib/glowupDb';
export async function GET() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureGlowUpTables();
  return Response.json(await getGUPresupuestos());
}
export async function POST(req: Request) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  return Response.json(await addGUPresupuesto(await req.json()), { status: 201 });
}
