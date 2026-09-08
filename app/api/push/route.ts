import { ensureNotifTables, saveSubscription } from '@/lib/notifDb';

export async function POST(req: Request) {
  try {
    await ensureNotifTables();
    const { subscription, portal } = await req.json();
    await saveSubscription({
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      portal: portal || 'all',
    });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
