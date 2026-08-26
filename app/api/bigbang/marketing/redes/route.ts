import { isAuthenticated } from '@/lib/adminAuth';
import { ensureBigBangTables, getBBRedes, addBBRedes } from '@/lib/bigbangDb';
export async function GET() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureBigBangTables();
  return Response.json(await getBBRedes());
}
export async function POST(req: Request) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  return Response.json(await addBBRedes(await req.json()), { status: 201 });
}
