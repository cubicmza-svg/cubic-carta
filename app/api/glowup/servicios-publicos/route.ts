import { ensureGlowUpTables, getGUServicios } from '@/lib/glowupDb';

export async function GET() {
  try {
    await ensureGlowUpTables();
    const servicios = await getGUServicios();
    return Response.json(servicios);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
