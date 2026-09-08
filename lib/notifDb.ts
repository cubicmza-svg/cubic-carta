import postgres from 'postgres';

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no configurada.');
  return postgres(url, { ssl: 'require', max: 5, idle_timeout: 20, connect_timeout: 10 });
}

export async function ensureNotifTables() {
  const sql = getClient();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id         SERIAL PRIMARY KEY,
        endpoint   TEXT NOT NULL UNIQUE,
        p256dh     TEXT NOT NULL,
        auth       TEXT NOT NULL,
        portal     TEXT NOT NULL DEFAULT 'all',
        creado_el  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id         SERIAL PRIMARY KEY,
        titulo     TEXT NOT NULL,
        cuerpo     TEXT NOT NULL DEFAULT '',
        portal     TEXT NOT NULL DEFAULT 'all',
        url        TEXT NOT NULL DEFAULT '/',
        leido      BOOLEAN NOT NULL DEFAULT FALSE,
        creado_el  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  } finally { await sql.end(); }
}

export async function saveSubscription(sub: { endpoint: string; p256dh: string; auth: string; portal: string }) {
  const sql = getClient();
  try {
    await sql`
      INSERT INTO push_subscriptions (endpoint, p256dh, auth, portal)
      VALUES (${sub.endpoint}, ${sub.p256dh}, ${sub.auth}, ${sub.portal})
      ON CONFLICT (endpoint) DO UPDATE SET p256dh=EXCLUDED.p256dh, auth=EXCLUDED.auth, portal=EXCLUDED.portal
    `;
  } finally { await sql.end(); }
}

export async function getSubscriptions() {
  const sql = getClient();
  try { return await sql`SELECT * FROM push_subscriptions`; }
  finally { await sql.end(); }
}

export async function removeSubscription(endpoint: string) {
  const sql = getClient();
  try { await sql`DELETE FROM push_subscriptions WHERE endpoint=${endpoint}`; }
  finally { await sql.end(); }
}

export async function addNotif(data: { titulo: string; cuerpo: string; portal: string; url: string }) {
  const sql = getClient();
  try {
    await sql`INSERT INTO notificaciones ${sql(data)}`;
  } finally { await sql.end(); }
}

export async function getNotifs(limit = 30) {
  const sql = getClient();
  try { return await sql`SELECT * FROM notificaciones ORDER BY creado_el DESC LIMIT ${limit}`; }
  finally { await sql.end(); }
}

export async function markAllRead() {
  const sql = getClient();
  try { await sql`UPDATE notificaciones SET leido=TRUE WHERE leido=FALSE`; }
  finally { await sql.end(); }
}
