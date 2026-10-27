import postgres from 'postgres';
import { randomBytes, randomInt } from 'crypto';

// Juego de las mesas de Cubic ("¿debajo de qué vaso está el premio?").
// El cliente escanea el QR del table tent → cubicmza.netlify.app/jugar → se registra (nombre + WhatsApp) → juega.
// El premio lo sortea el servidor; el mozo lo canjea desde /admin/juego.

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no configurada.');
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);   // base de prueba en la compu, sin SSL
  return postgres(url, { ssl: local ? false : 'require', max: local ? 1 : 5, idle_timeout: 20, connect_timeout: 10 });
}

// ─── Premios ──────────────────────────────────────────────────────────────────
// Los carga Cubic desde /admin/juego (tabla juego_premios): título, detalle, chance (%) y stock.
// Cada premio que sale descuenta 1 del stock; sin stock no sale más. Lo que falta para llegar a 100% es "sin premio".
export interface Premio { id: number; titulo: string; detalle: string; chance: number; stock: number; entregados: number; activo: boolean; orden: number }
const PREMIOS_INICIALES = [
  { titulo: 'brunch gratis',    detalle: 'un brunch individual de regalo',  chance: 2,  stock: 2 },
  { titulo: 'café gratis',      detalle: 'un café chico de regalo',         chance: 15, stock: 20 },
  { titulo: 'medialuna gratis', detalle: 'una medialuna de regalo',         chance: 16, stock: 30 },
  { titulo: '10% off',          detalle: '10% de descuento en tu consumo', chance: 30, stock: 100 },
];

export const DIAS_VALIDEZ = 7;
export const CONDICIONES = 'Válido por 7 días en Cubic (25 de Mayo 2985). Uno por persona, no acumulable con otras promos. Mostrale el código al mozo antes de pedir la cuenta.';

export interface Cupon {
  codigo: string; tel: string; nombre: string; premio: string; titulo: string; detalle: string;
  fecha: string; vence: string; creado: string; canjeado: string | null;
}

export const hoyMza = (d = new Date()) => d.toLocaleDateString('sv-SE', { timeZone: 'America/Argentina/Mendoza' });
const LETRAS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const nuevoCodigo = () => 'C' + Array.from(randomBytes(5), b => LETRAS[b % LETRAS.length]).join('');

// 261 15 555 1234 / +54 9 261 5551234 / 5551234 → 2615551234
export function normalizarTel(t: string): string {
  let tel = String(t || '').replace(/\D/g, '').replace(/^54/, '').replace(/^9/, '').replace(/^0/, '');
  if (tel.length === 12) for (const a of [3, 4, 2]) if (tel.substr(a, 2) === '15') { tel = tel.slice(0, a) + tel.slice(a + 2); break; }
  if (tel.length === 7) tel = '261' + tel;
  return tel;
}

export async function ensureJuegoTables() {
  const sql = getClient();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS juego_registros (
        tel     TEXT PRIMARY KEY,
        nombre  TEXT NOT NULL DEFAULT '',
        promos  BOOLEAN NOT NULL DEFAULT FALSE,
        alta    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ultima  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
    // una jugada por WhatsApp por día (la clave primaria lo garantiza)
    await sql`
      CREATE TABLE IF NOT EXISTS juego_jugadas (
        tel     TEXT NOT NULL,
        fecha   DATE NOT NULL,
        premio  TEXT NOT NULL,
        codigo  TEXT,
        creado  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (tel, fecha)
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS juego_cupones (
        codigo   TEXT PRIMARY KEY,
        tel      TEXT NOT NULL,
        nombre   TEXT NOT NULL DEFAULT '',
        premio   TEXT NOT NULL,
        titulo   TEXT NOT NULL DEFAULT '',
        detalle  TEXT NOT NULL DEFAULT '',
        fecha    DATE NOT NULL,
        vence    DATE NOT NULL,
        creado   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        canjeado TIMESTAMPTZ
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS juego_premios (
        id         SERIAL PRIMARY KEY,
        titulo     TEXT NOT NULL,
        detalle    TEXT NOT NULL DEFAULT '',
        chance     NUMERIC(5,2) NOT NULL DEFAULT 0,
        stock      INTEGER NOT NULL DEFAULT 0,
        entregados INTEGER NOT NULL DEFAULT 0,
        activo     BOOLEAN NOT NULL DEFAULT TRUE,
        orden      INTEGER NOT NULL DEFAULT 0
      )`;
    const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM juego_premios`;
    if (!n) for (const [i, p] of PREMIOS_INICIALES.entries())
      await sql`INSERT INTO juego_premios (titulo, detalle, chance, stock, orden) VALUES (${p.titulo}, ${p.detalle}, ${p.chance}, ${p.stock}, ${i})`;
  } finally {
    await sql.end();
  }
}

const aCupon = (r: Record<string, unknown>): Cupon => ({
  codigo: String(r.codigo), tel: String(r.tel), nombre: String(r.nombre), premio: String(r.premio),
  titulo: String(r.titulo), detalle: String(r.detalle),
  fecha: String(r.fecha_txt ?? r.fecha), vence: String(r.vence_txt ?? r.vence),
  creado: new Date(r.creado as string).toISOString(), canjeado: r.canjeado ? new Date(r.canjeado as string).toISOString() : null,
});
const COLS_CUPON = 'codigo, tel, nombre, premio, titulo, detalle, creado, canjeado, to_char(fecha, \'YYYY-MM-DD\') AS fecha_txt, to_char(vence, \'YYYY-MM-DD\') AS vence_txt';

// ─── Jugar ────────────────────────────────────────────────────────────────────
export async function jugar(nombre: string, telCrudo: string, promos: boolean) {
  const tel = normalizarTel(telCrudo);
  const sql = getClient();
  try {
    const fecha = hoyMza();
    await sql`
      INSERT INTO juego_registros (tel, nombre, promos) VALUES (${tel}, ${nombre}, ${promos})
      ON CONFLICT (tel) DO UPDATE SET nombre = EXCLUDED.nombre, promos = EXCLUDED.promos, ultima = NOW()`;

    // ¿ya jugó hoy? → le devolvemos lo que sacó
    const previa = await sql`SELECT premio, codigo FROM juego_jugadas WHERE tel = ${tel} AND fecha = ${fecha}`;
    if (previa.length) {
      const c = previa[0].codigo ? await sql.unsafe(`SELECT ${COLS_CUPON} FROM juego_cupones WHERE codigo = $1`, [previa[0].codigo]) : [];
      return { yaJugo: true, nombre, premio: String(previa[0].premio), cupon: c.length ? aCupon(c[0]) : null };
    }

    // sorteo entre los premios activos con stock; si las chances suman más de 100 se reparten proporcional
    const disponibles = (await sql`SELECT id, titulo, detalle, chance::float AS chance FROM juego_premios WHERE activo AND stock > 0 ORDER BY orden, id`)
      .map(x => ({ id: Number(x.id), titulo: String(x.titulo), detalle: String(x.detalle), chance: Number(x.chance) }));
    const total = Math.max(100, disponibles.reduce((s, x) => s + x.chance, 0));
    let r = randomInt(0, Math.round(total * 100)) / 100;
    let p: { id: number; titulo: string; detalle: string } | null = null;
    for (const x of disponibles) { if (r < x.chance) { p = x; break; } r -= x.chance; }
    // descuenta del stock (si justo se agotó en otra mesa, no hay premio)
    if (p && !(await sql`UPDATE juego_premios SET stock = stock - 1, entregados = entregados + 1 WHERE id = ${p.id} AND stock > 0 RETURNING id`).length) p = null;
    const premioId = p ? 'p' + p.id : 'nada';

    let codigo: string | null = null;
    if (p) {
      const vence = hoyMza(new Date(Date.now() + DIAS_VALIDEZ * 864e5));
      for (let intento = 0; !codigo; intento++) {   // si el código ya existe (rarísimo), se genera otro
        const cod = nuevoCodigo();
        const ok = await sql`
          INSERT INTO juego_cupones (codigo, tel, nombre, premio, titulo, detalle, fecha, vence)
          VALUES (${cod}, ${tel}, ${nombre}, ${premioId}, ${p.titulo}, ${p.detalle}, ${fecha}, ${vence})
          ON CONFLICT (codigo) DO NOTHING RETURNING codigo`;
        if (ok.length) codigo = cod;
        else if (intento > 5) throw new Error('No se pudo generar el código');
      }
    }
    const ins = await sql`
      INSERT INTO juego_jugadas (tel, fecha, premio, codigo) VALUES (${tel}, ${fecha}, ${premioId}, ${codigo})
      ON CONFLICT (tel, fecha) DO NOTHING RETURNING tel`;
    if (!ins.length) {   // jugó dos veces al mismo tiempo: vale la primera (y se devuelve el stock)
      if (codigo) await sql`DELETE FROM juego_cupones WHERE codigo = ${codigo}`;
      if (p) await sql`UPDATE juego_premios SET stock = stock + 1, entregados = entregados - 1 WHERE id = ${p.id}`;
      return jugar(nombre, telCrudo, promos);
    }
    const c = codigo ? await sql.unsafe(`SELECT ${COLS_CUPON} FROM juego_cupones WHERE codigo = $1`, [codigo]) : [];
    // lo que había "en los otros vasos" (solo para el show; el premio real es el de arriba)
    const show = disponibles.filter(x => x.chance >= 5).map(x => x.titulo).concat('esta vez no');
    const otras = [0, 1].map(() => show[randomInt(0, show.length)]);
    return { nombre, premio: premioId, titulo: p?.titulo ?? 'esta vez no', cupon: c.length ? aCupon(c[0]) : null, otras };
  } finally {
    await sql.end();
  }
}

// ─── Panel (mozo / admin) ─────────────────────────────────────────────────────
export async function buscarCupon(codigo: string): Promise<Cupon | null> {
  const sql = getClient();
  try {
    const r = await sql.unsafe(`SELECT ${COLS_CUPON} FROM juego_cupones WHERE codigo = $1`, [codigo]);
    return r.length ? aCupon(r[0]) : null;
  } finally {
    await sql.end();
  }
}

export async function canjearCupon(codigo: string): Promise<Cupon | null> {
  const sql = getClient();
  try {
    const r = await sql.unsafe(
      `UPDATE juego_cupones SET canjeado = NOW() WHERE codigo = $1 AND canjeado IS NULL AND vence >= $2::date RETURNING ${COLS_CUPON}`,
      [codigo, hoyMza()]);
    return r.length ? aCupon(r[0]) : null;
  } finally {
    await sql.end();
  }
}

export async function resumenJuego() {
  const sql = getClient();
  try {
    const hoy = hoyMza();
    const registros = await sql`
      SELECT r.tel, r.nombre, r.promos, r.alta, r.ultima,
             COUNT(j.*)::int AS jugadas,
             COUNT(j.codigo)::int AS premios
      FROM juego_registros r LEFT JOIN juego_jugadas j ON j.tel = r.tel
      GROUP BY r.tel ORDER BY r.ultima DESC LIMIT 2000`;
    const cupones = await sql.unsafe(`SELECT ${COLS_CUPON} FROM juego_cupones ORDER BY creado DESC LIMIT 300`);
    const [h] = await sql`
      SELECT COUNT(*)::int AS jugadas, COUNT(codigo)::int AS premios FROM juego_jugadas WHERE fecha = ${hoy}`;
    const [c] = await sql`SELECT COUNT(*)::int AS canjeados FROM juego_cupones WHERE (canjeado AT TIME ZONE 'America/Argentina/Mendoza')::date = ${hoy}::date`;
    return {
      hoy: { jugadas: h.jugadas, premios: h.premios, canjeados: c.canjeados },
      registros: registros.map(r => ({ ...r, alta: new Date(r.alta).toISOString(), ultima: new Date(r.ultima).toISOString() })),
      cupones: cupones.map(aCupon),
    };
  } finally {
    await sql.end();
  }
}

// ─── Premios (panel) ──────────────────────────────────────────────────────────
const aPremio = (r: Record<string, unknown>): Premio => ({
  id: Number(r.id), titulo: String(r.titulo), detalle: String(r.detalle), chance: Number(r.chance),
  stock: Number(r.stock), entregados: Number(r.entregados), activo: Boolean(r.activo), orden: Number(r.orden),
});

export async function listarPremios(): Promise<Premio[]> {
  const sql = getClient();
  try {
    return (await sql`SELECT id, titulo, detalle, chance::float AS chance, stock, entregados, activo, orden FROM juego_premios ORDER BY orden, id`).map(aPremio);
  } finally {
    await sql.end();
  }
}

// para la página del juego: los que pueden salir, del más valioso (menos chance) al más común
export async function premiosEnJuego(): Promise<string[]> {
  const sql = getClient();
  try {
    return (await sql`SELECT titulo FROM juego_premios WHERE activo AND stock > 0 AND chance > 0 ORDER BY chance, id`).map(r => String(r.titulo));
  } finally {
    await sql.end();
  }
}

export async function guardarPremio(p: { id?: number; titulo: string; detalle: string; chance: number; stock: number; activo: boolean }) {
  const sql = getClient();
  try {
    if (p.id) {
      await sql`UPDATE juego_premios SET titulo = ${p.titulo}, detalle = ${p.detalle}, chance = ${p.chance}, stock = ${p.stock}, activo = ${p.activo} WHERE id = ${p.id}`;
    } else {
      const [{ orden }] = await sql`SELECT COALESCE(MAX(orden), 0) + 1 AS orden FROM juego_premios`;
      await sql`INSERT INTO juego_premios (titulo, detalle, chance, stock, activo, orden) VALUES (${p.titulo}, ${p.detalle}, ${p.chance}, ${p.stock}, ${p.activo}, ${orden})`;
    }
  } finally {
    await sql.end();
  }
}

export async function borrarPremio(id: number) {
  const sql = getClient();
  try {
    await sql`DELETE FROM juego_premios WHERE id = ${id}`;   // los cupones ya entregados guardan su título y siguen valiendo
  } finally {
    await sql.end();
  }
}
