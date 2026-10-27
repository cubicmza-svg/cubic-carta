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
// peso = chance relativa (suman 100 → es el %). topeDia = máximo por día; si se agota sale el "reemplazo".
export const PREMIOS = [
  { id: 'off10',     titulo: '10% off',          detalle: '10% de descuento en tu consumo', peso: 30 },
  { id: 'medialuna', titulo: 'medialuna gratis', detalle: 'una medialuna de regalo',         peso: 16, topeDia: 30, reemplazo: 'off10' },
  { id: 'cafe',      titulo: 'café gratis',      detalle: 'un café chico de regalo',         peso: 15, topeDia: 20, reemplazo: 'off10' },
  { id: 'brunch',    titulo: 'brunch gratis',    detalle: 'un brunch individual de regalo',  peso: 2,  topeDia: 1,  reemplazo: 'cafe' },
  { id: 'nada',      titulo: 'esta vez no',      detalle: '',                                peso: 37 },
] as const;
type Premio = (typeof PREMIOS)[number];

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

    // sorteo
    const total = PREMIOS.reduce((s, p) => s + p.peso, 0);
    let r = randomInt(0, total * 100) / 100;
    let p: Premio = PREMIOS[PREMIOS.length - 1];
    for (const x of PREMIOS) { if (r < x.peso) { p = x; break; } r -= x.peso; }
    for (let i = 0; i < 4 && 'topeDia' in p; i++) {   // topes diarios
      const [{ n }] = await sql`SELECT COUNT(*)::int AS n FROM juego_jugadas WHERE fecha = ${fecha} AND premio = ${p.id}`;
      if (n < p.topeDia) break;
      const rep: string = p.reemplazo;
      p = PREMIOS.find(x => x.id === rep) ?? PREMIOS[0];
    }

    let codigo: string | null = null;
    if (p.id !== 'nada') {
      const vence = hoyMza(new Date(Date.now() + DIAS_VALIDEZ * 864e5));
      for (let intento = 0; !codigo; intento++) {   // si el código ya existe (rarísimo), se genera otro
        const cod = nuevoCodigo();
        const ok = await sql`
          INSERT INTO juego_cupones (codigo, tel, nombre, premio, titulo, detalle, fecha, vence)
          VALUES (${cod}, ${tel}, ${nombre}, ${p.id}, ${p.titulo}, ${p.detalle}, ${fecha}, ${vence})
          ON CONFLICT (codigo) DO NOTHING RETURNING codigo`;
        if (ok.length) codigo = cod;
        else if (intento > 5) throw new Error('No se pudo generar el código');
      }
    }
    const ins = await sql`
      INSERT INTO juego_jugadas (tel, fecha, premio, codigo) VALUES (${tel}, ${fecha}, ${p.id}, ${codigo})
      ON CONFLICT (tel, fecha) DO NOTHING RETURNING tel`;
    if (!ins.length) {   // jugó dos veces al mismo tiempo: vale la primera
      if (codigo) await sql`DELETE FROM juego_cupones WHERE codigo = ${codigo}`;
      return jugar(nombre, telCrudo, promos);
    }
    const c = codigo ? await sql.unsafe(`SELECT ${COLS_CUPON} FROM juego_cupones WHERE codigo = $1`, [codigo]) : [];
    // lo que había "en los otros vasos" (solo para el show; el premio real es el de arriba)
    const show = PREMIOS.filter(x => x.id !== 'brunch');
    const otras = [0, 1].map(() => show[randomInt(0, show.length)].titulo);
    return { nombre, premio: p.id, titulo: p.titulo, cupon: c.length ? aCupon(c[0]) : null, otras };
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
