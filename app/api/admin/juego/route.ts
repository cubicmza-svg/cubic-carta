import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { ensureJuegoTables, buscarCupon, canjearCupon, resumenJuego, hoyMza } from '@/lib/juegoDb';

// Panel del mozo: buscar y canjear códigos del juego de las mesas + registros.
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticatedAsync())) return Response.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await ensureJuegoTables();
    return Response.json(await resumenJuego());
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticatedAsync())) return Response.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await ensureJuegoTables();
    const { accion, codigo: crudo } = await req.json();
    const codigo = String(crudo ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const c = await buscarCupon(codigo);
    if (!c) return Response.json({ error: 'Ese código no existe' }, { status: 404 });
    const vencido = c.vence < hoyMza();
    if (accion === 'canjear') {
      if (c.canjeado) return Response.json({ error: 'Este premio ya fue canjeado', cupon: c, vencido }, { status: 409 });
      if (vencido) return Response.json({ error: 'Este premio está vencido', cupon: c, vencido }, { status: 409 });
      const ok = await canjearCupon(codigo);
      return Response.json({ cupon: ok ?? c, vencido: false, canjeadoAhora: !!ok });
    }
    return Response.json({ cupon: c, vencido });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
