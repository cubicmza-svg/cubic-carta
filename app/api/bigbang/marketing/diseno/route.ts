import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { ensureBigBangTables, getBBDiseno, addBBDiseno } from '@/lib/bigbangDb';
export async function GET() {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureBigBangTables();
  return Response.json(await getBBDiseno());
}
export async function POST(req: Request) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  return Response.json(await addBBDiseno(await req.json()), { status: 201 });
}
