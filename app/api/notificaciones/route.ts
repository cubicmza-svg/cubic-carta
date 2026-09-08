import { ensureNotifTables, getNotifs, markAllRead } from '@/lib/notifDb';

export async function GET() {
  try {
    await ensureNotifTables();
    return Response.json(await getNotifs(40));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    await markAllRead();
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
