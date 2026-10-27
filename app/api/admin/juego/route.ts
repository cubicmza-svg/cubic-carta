import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { ensureJuegoTables, buscarCupon, canjearCupon, resumenJuego, hoyMza, listarPremios, guardarPremio, borrarPremio } from '@/lib/juegoDb';

// Panel del mozo: buscar y canjear códigos del juego de las mesas, premios con stock y registros.
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticatedAsync())) return Response.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await ensureJuegoTables();
    return Response.json({ ...(await resumenJuego()), premios: await listarPremios() });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticatedAsync())) return Response.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await ensureJuegoTables();
    const body = await req.json();
    const { accion, codigo: crudo } = body;

    if (accion === 'premio-guardar') {
      const p = body.premio ?? {};
      const titulo = String(p.titulo ?? '').trim().slice(0, 40);
      const chance = Math.max(0, Math.min(100, Number(p.chance) || 0));
      const stock = Math.max(0, Math.floor(Number(p.stock) || 0));
      if (!titulo) return Response.json({ error: 'Poné el nombre del premio' }, { status: 400 });
      await guardarPremio({ id: Number(p.id) || undefined, titulo, detalle: String(p.detalle ?? '').trim().slice(0, 80), chance, stock, activo: p.activo !== false });
      return Response.json({ premios: await listarPremios() });
    }
    if (accion === 'premio-borrar') {
      await borrarPremio(Number(body.id));
      return Response.json({ premios: await listarPremios() });
    }

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
