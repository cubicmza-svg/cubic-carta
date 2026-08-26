import { isAuthenticated } from '@/lib/adminAuth';
import { ensureBigBangTables, getServicios, addServicio } from '@/lib/bigbangDb';

export async function GET() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureBigBangTables();
  return Response.json(await getServicios());
}
export async function POST(req: Request) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  const b = await req.json();
  return Response.json(await addServicio(b), { status: 201 });
}
