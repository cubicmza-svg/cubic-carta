import { sendPush } from '@/lib/sendPush';
import { ensureNotifTables } from '@/lib/notifDb';

export async function POST(req: Request) {
  try {
    await ensureNotifTables();
    const payload = await req.json();
    await sendPush(payload);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
