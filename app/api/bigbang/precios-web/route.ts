import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { ensureBigBangTables, getBBPreciosWeb, setBBPreciosWeb } from '@/lib/bigbangDb';

export async function GET() {
  try {
    await ensureBigBangTables();
    return Response.json(await getBBPreciosWeb());
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  try {
    const data = await req.json();
    await ensureBigBangTables();
    await setBBPreciosWeb(data);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
