import { addNotif, ensureNotifTables } from '@/lib/notifDb';

// Endpoint de un solo uso para insertar notificaciones de sistema
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('s');
  if (secret !== 'cubic2024') {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  const titulo = searchParams.get('titulo');
  const cuerpo = searchParams.get('cuerpo') ?? '';
  const portal = searchParams.get('portal') ?? 'all';
  const url = searchParams.get('url') ?? '/';
  if (!titulo) return Response.json({ error: 'Falta titulo' }, { status: 400 });
  try {
    await ensureNotifTables();
    await addNotif({ titulo, cuerpo, portal, url });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
