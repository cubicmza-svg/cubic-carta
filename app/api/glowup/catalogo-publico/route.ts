import { ensureGlowUpTables, getGUCatalogoActivo } from '@/lib/glowupDb';

export async function GET() {
  try {
    await ensureGlowUpTables();
    return Response.json(await getGUCatalogoActivo());
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
