import postgres from 'postgres';
import type { Carta, CartaId } from './cartaTipos';
import { CARTA_BASE } from './cartaBase';

// Versiones de la carta online (cafetería / resto). La vigente es la última; "deshacer" vuelve a publicar la anterior.

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no configurada.');
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);   // base de prueba en la compu, sin SSL
  return postgres(url, { ssl: local ? false : 'require', max: local ? 1 : 5, idle_timeout: 20, connect_timeout: 10 });
}

export async function ensureCartaTables() {
  const sql = getClient();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS carta_versiones (
        id      SERIAL PRIMARY KEY,
        carta   TEXT NOT NULL,
        datos   JSONB NOT NULL,
        archivo TEXT NOT NULL DEFAULT '',
        nota    TEXT NOT NULL DEFAULT '',
        creado  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
  } finally {
    await sql.end();
  }
}

export interface Version { id: number; datos: Carta; archivo: string; nota: string; creado: string }
const aVersion = (r: Record<string, unknown>): Version => ({
  id: Number(r.id), datos: r.datos as Carta, archivo: String(r.archivo), nota: String(r.nota), creado: new Date(r.creado as string).toISOString(),
});

export async function versiones(carta: CartaId, limite = 6): Promise<Version[]> {
  const sql = getClient();
  try {
    const r = await sql`SELECT id, datos, archivo, nota, creado FROM carta_versiones WHERE carta = ${carta} ORDER BY id DESC LIMIT ${limite}`;
    return r.map(aVersion);
  } finally {
    await sql.end();
  }
}

// la vigente; si nunca subieron un PDF, la carta inicial
export async function cartaVigente(carta: CartaId): Promise<{ datos: Carta; actualizado: string | null; archivo: string }> {
  const [v] = await versiones(carta, 1);
  return v ? { datos: v.datos, actualizado: v.creado, archivo: v.archivo } : { datos: CARTA_BASE[carta], actualizado: null, archivo: '' };
}

export async function guardarVersion(carta: CartaId, datos: Carta, archivo: string, nota = ''): Promise<Version> {
  const sql = getClient();
  try {
    const [r] = await sql`
      INSERT INTO carta_versiones (carta, datos, archivo, nota)
      VALUES (${carta}, ${sql.json(datos as never)}, ${archivo}, ${nota})
      RETURNING id, datos, archivo, nota, creado`;
    return aVersion(r);
  } finally {
    await sql.end();
  }
}
