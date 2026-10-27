import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { ensureCartaTables, versiones, cartaVigente, guardarVersion } from '@/lib/cartaDb';
import { leerCartaPdf, compararCartas } from '@/lib/cartaIA';
import { CARTA_BASE } from '@/lib/cartaBase';
import { CARTAS_IDS, contarItems, type CartaId } from '@/lib/cartaTipos';

// Panel → Carta: subir el PDF de la carta (la IA lo pasa a la carta online), ver el estado y deshacer.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;   // leer un PDF de varias páginas puede llevar uno o dos minutos

const esCarta = (c: unknown): c is CartaId => CARTAS_IDS.includes(c as CartaId);

export async function GET() {
  if (!(await isAuthenticatedAsync())) return Response.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await ensureCartaTables();
    const out: Record<string, unknown> = {};
    for (const c of CARTAS_IDS) {
      const vs = await versiones(c, 6);
      const vigente = vs[0]?.datos ?? CARTA_BASE[c];
      out[c] = {
        actualizado: vs[0]?.creado ?? null,
        archivo: vs[0]?.archivo ?? '',
        secciones: vigente.secciones.length,
        productos: contarItems(vigente),
        historial: vs.map(v => ({ id: v.id, creado: v.creado, archivo: v.archivo, nota: v.nota, productos: contarItems(v.datos) })),
      };
    }
    return Response.json(out);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthenticatedAsync())) return Response.json({ error: 'No autorizado' }, { status: 401 });
  try {
    await ensureCartaTables();

    // deshacer: vuelve a publicar la versión anterior (o la carta inicial)
    if ((req.headers.get('content-type') ?? '').includes('application/json')) {
      const { accion, carta } = await req.json();
      if (accion !== 'deshacer' || !esCarta(carta)) return Response.json({ error: 'Pedido inválido' }, { status: 400 });
      const vs = await versiones(carta, 2);
      if (!vs.length) return Response.json({ error: 'No hay nada para deshacer' }, { status: 409 });
      const anterior = vs[1]?.datos ?? CARTA_BASE[carta];
      await guardarVersion(carta, anterior, vs[1]?.archivo ?? '', 'deshacer');
      return Response.json({ ok: true, productos: contarItems(anterior) });
    }

    const form = await req.formData();
    const carta = form.get('carta'), archivo = form.get('pdf');
    if (!esCarta(carta)) return Response.json({ error: 'Elegí qué carta es' }, { status: 400 });
    if (!(archivo instanceof File) || !archivo.size) return Response.json({ error: 'Falta el PDF' }, { status: 400 });
    if (archivo.type !== 'application/pdf' && !archivo.name.toLowerCase().endsWith('.pdf')) return Response.json({ error: 'Tiene que ser un PDF' }, { status: 400 });
    if (archivo.size > 4 * 1024 * 1024) return Response.json({ error: 'El PDF pesa más de 4 MB. Exportalo más liviano.' }, { status: 413 });

    const { datos: actual } = await cartaVigente(carta);
    const b64 = Buffer.from(await archivo.arrayBuffer()).toString('base64');
    const nueva = await leerCartaPdf(carta, b64, actual);
    await guardarVersion(carta, nueva, archivo.name);
    const dif = compararCartas(actual, nueva);
    return Response.json({ ok: true, secciones: nueva.secciones.length, productos: contarItems(nueva), antes: contarItems(actual), ...dif });
  } catch (e) {
    console.error('carta-pdf', e);
    return Response.json({ error: e instanceof Error ? e.message : 'No se pudo actualizar la carta' }, { status: 500 });
  }
}
