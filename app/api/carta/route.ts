import { ensureCartaTables, cartaVigente } from '@/lib/cartaDb';
import { CARTA_BASE } from '@/lib/cartaBase';
import { CARTAS_IDS, type CartaId } from '@/lib/cartaTipos';

// Público: la carta vigente para cubicmza.netlify.app/cafeteria y /resto.
export const dynamic = 'force-dynamic';

const CORS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=300' };

export async function GET(req: Request) {
  const c = new URL(req.url).searchParams.get('c') as CartaId;
  if (!CARTAS_IDS.includes(c)) return Response.json({ error: 'Carta inexistente' }, { status: 404, headers: CORS });
  try {
    await ensureCartaTables();
    return Response.json(await cartaVigente(c), { headers: CORS });
  } catch {
    return Response.json({ datos: CARTA_BASE[c], actualizado: null, archivo: '' }, { headers: CORS });
  }
}
