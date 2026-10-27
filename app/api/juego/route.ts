import { ensureJuegoTables, jugar, normalizarTel, premiosEnJuego, CONDICIONES } from '@/lib/juegoDb';

// Público: lo llama la página del QR (cubicmza.netlify.app/jugar). Registra y sortea el premio del día.
export const dynamic = 'force-dynamic';

const ORIGENES = ['https://cubicmza.netlify.app', 'http://localhost:8840'];
const cors = (req: Request) => {
  const o = req.headers.get('origin') ?? '';
  return {
    'Access-Control-Allow-Origin': ORIGENES.includes(o) ? o : ORIGENES[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
};

export function OPTIONS(req: Request) {
  return new Response(null, { status: 204, headers: cors(req) });
}

// los premios que pueden salir hoy (para mostrarlos en la página del juego)
export async function GET(req: Request) {
  try {
    await ensureJuegoTables();
    return Response.json({ premios: await premiosEnJuego() }, { headers: cors(req) });
  } catch {
    return Response.json({ premios: [] }, { status: 500, headers: cors(req) });
  }
}

export async function POST(req: Request) {
  const h = cors(req);
  try {
    const body = await req.json().catch(() => ({}));
    const nombre = String(body.nombre ?? '').trim().slice(0, 40);
    const tel = String(body.tel ?? '');
    if (nombre.length < 2) return Response.json({ error: 'Poné tu nombre' }, { status: 400, headers: h });
    if (normalizarTel(tel).length !== 10) return Response.json({ error: 'Revisá el WhatsApp: código de área + número, ej. 261 555 1234' }, { status: 400, headers: h });
    await ensureJuegoTables();
    const r = await jugar(nombre, tel, !!body.promos);
    // al cliente no le mandamos su teléfono de vuelta
    const cupon = r.cupon && { codigo: r.cupon.codigo, titulo: r.cupon.titulo, detalle: r.cupon.detalle, vence: r.cupon.vence, canjeado: r.cupon.canjeado, condiciones: CONDICIONES };
    return Response.json({ ...r, cupon }, { headers: h });
  } catch (e) {
    console.error('juego', e);
    return Response.json({ error: 'No pudimos conectar, probá de nuevo' }, { status: 500, headers: h });
  }
}
