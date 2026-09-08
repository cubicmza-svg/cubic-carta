import webpush from 'web-push';
import { addNotif, getSubscriptions, removeSubscription } from './notifDb';

export async function sendPush(payload: {
  titulo: string;
  cuerpo: string;
  portal: string;
  url: string;
}) {
  await addNotif(payload);

  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return;

  webpush.setVapidDetails('mailto:admin@cubic.com', pub, priv);

  let subs: Awaited<ReturnType<typeof getSubscriptions>>;
  try { subs = await getSubscriptions(); }
  catch { return; }

  const msg = JSON.stringify({
    title: payload.titulo,
    body: payload.cuerpo,
    url: payload.url,
    icon: '/icon-192.png',
  });

  await Promise.allSettled(
    subs.map(async s => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          msg
        );
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'statusCode' in err) {
          const code = (err as { statusCode: number }).statusCode;
          if (code === 404 || code === 410) await removeSubscription(s.endpoint);
        }
      }
    })
  );
}
