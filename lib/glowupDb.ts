import postgres from 'postgres';

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no configurada.');
  return postgres(url, { ssl: 'require', max: 5, idle_timeout: 20, connect_timeout: 10 });
}

export async function ensureGlowUpTables() {
  const sql = getClient();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS gu_servicios (
        id          SERIAL PRIMARY KEY,
        nombre      TEXT    NOT NULL DEFAULT '',
        descripcion TEXT    NOT NULL DEFAULT '',
        incluye     TEXT    NOT NULL DEFAULT '[]',
        condiciones TEXT    NOT NULL DEFAULT '',
        precio_min  INTEGER NOT NULL DEFAULT 0,
        precio_max  INTEGER NOT NULL DEFAULT 0,
        tiempo      TEXT    NOT NULL DEFAULT '',
        activo      BOOLEAN NOT NULL DEFAULT TRUE,
        orden       INTEGER NOT NULL DEFAULT 0,
        creado_el   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS gu_pedidos (
        id            SERIAL PRIMARY KEY,
        cliente       TEXT    NOT NULL DEFAULT '',
        telefono      TEXT    NOT NULL DEFAULT '',
        fecha_evento  DATE    NOT NULL,
        hora          TEXT    NOT NULL DEFAULT '',
        lugar         TEXT    NOT NULL DEFAULT '',
        nombre_cumple TEXT    NOT NULL DEFAULT '',
        edad          TEXT    NOT NULL DEFAULT '',
        tematica      TEXT    NOT NULL DEFAULT '',
        servicio_id   INTEGER,
        servicio_nombre TEXT  NOT NULL DEFAULT '',
        colores       TEXT    NOT NULL DEFAULT '',
        total         INTEGER NOT NULL DEFAULT 0,
        sena          INTEGER NOT NULL DEFAULT 0,
        sena_pagada   BOOLEAN NOT NULL DEFAULT FALSE,
        estado        TEXT    NOT NULL DEFAULT 'pendiente',
        notas         TEXT    NOT NULL DEFAULT '',
        creado_el     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS gu_presupuestos (
        id            SERIAL PRIMARY KEY,
        cliente       TEXT    NOT NULL DEFAULT '',
        telefono      TEXT    NOT NULL DEFAULT '',
        fecha_evento  DATE,
        lugar         TEXT    NOT NULL DEFAULT '',
        nombre_cumple TEXT    NOT NULL DEFAULT '',
        edad          TEXT    NOT NULL DEFAULT '',
        tematica      TEXT    NOT NULL DEFAULT '',
        servicio_id   INTEGER,
        servicio_nombre TEXT  NOT NULL DEFAULT '',
        extras        TEXT    NOT NULL DEFAULT '[]',
        total         INTEGER NOT NULL DEFAULT 0,
        estado        TEXT    NOT NULL DEFAULT 'enviado',
        notas         TEXT    NOT NULL DEFAULT '',
        creado_el     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS gu_diseno (
        id          SERIAL PRIMARY KEY,
        nombre      TEXT    NOT NULL DEFAULT '',
        descripcion TEXT    NOT NULL DEFAULT '',
        status      TEXT    NOT NULL DEFAULT 'pendiente',
        archivos    TEXT    NOT NULL DEFAULT '[]',
        creado_el   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS gu_redes (
        id          SERIAL PRIMARY KEY,
        titulo      TEXT    NOT NULL DEFAULT '',
        caption     TEXT    NOT NULL DEFAULT '',
        plataforma  TEXT    NOT NULL DEFAULT 'instagram',
        formato     TEXT    NOT NULL DEFAULT 'feed',
        estado      TEXT    NOT NULL DEFAULT 'idea',
        fechas_prog TEXT    NOT NULL DEFAULT '[]',
        link_drive  TEXT    NOT NULL DEFAULT '',
        pilar       TEXT    NOT NULL DEFAULT '',
        creado_el   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    // Columnas de revision y guion (se agregan si no existen)
    await sql`ALTER TABLE gu_redes ADD COLUMN IF NOT EXISTS revisado BOOLEAN NOT NULL DEFAULT FALSE`;
    await sql`ALTER TABLE gu_redes ADD COLUMN IF NOT EXISTS feedback TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE gu_redes ADD COLUMN IF NOT EXISTS tipo_grabacion TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE gu_redes ADD COLUMN IF NOT EXISTS guion TEXT NOT NULL DEFAULT ''`;
  } finally { await sql.end(); }
}

// ── SERVICIOS ──────────────────────────────────────────────────────────────────
export async function getGUServicios() {
  const sql = getClient();
  try { return await sql`SELECT * FROM gu_servicios ORDER BY orden ASC, id ASC`; }
  finally { await sql.end(); }
}
export async function addGUServicio(data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO gu_servicios ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateGUServicio(id: number, data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE gu_servicios SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteGUServicio(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM gu_servicios WHERE id=${id}`; }
  finally { await sql.end(); }
}

// ── PEDIDOS ───────────────────────────────────────────────────────────────────
export async function getGUPedidos() {
  const sql = getClient();
  try { return await sql`SELECT * FROM gu_pedidos ORDER BY fecha_evento ASC, id ASC`; }
  finally { await sql.end(); }
}
export async function addGUPedido(data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO gu_pedidos ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateGUPedido(id: number, data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE gu_pedidos SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteGUPedido(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM gu_pedidos WHERE id=${id}`; }
  finally { await sql.end(); }
}

// ── PRESUPUESTOS ──────────────────────────────────────────────────────────────
export async function getGUPresupuestos() {
  const sql = getClient();
  try { return await sql`SELECT * FROM gu_presupuestos ORDER BY creado_el DESC`; }
  finally { await sql.end(); }
}
export async function addGUPresupuesto(data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO gu_presupuestos ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateGUPresupuesto(id: number, data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE gu_presupuestos SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteGUPresupuesto(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM gu_presupuestos WHERE id=${id}`; }
  finally { await sql.end(); }
}

// ── DISEÑO ────────────────────────────────────────────────────────────────────
export async function getGUDiseno() {
  const sql = getClient();
  try { return await sql`SELECT * FROM gu_diseno ORDER BY creado_el DESC`; }
  finally { await sql.end(); }
}
export async function addGUDiseno(data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO gu_diseno ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateGUDiseno(id: number, data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE gu_diseno SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteGUDiseno(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM gu_diseno WHERE id=${id}`; }
  finally { await sql.end(); }
}

// ── REDES ─────────────────────────────────────────────────────────────────────
export async function getGURedes() {
  const sql = getClient();
  try { return await sql`SELECT * FROM gu_redes ORDER BY creado_el DESC`; }
  finally { await sql.end(); }
}
export async function addGURedes(data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO gu_redes ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateGURedes(id: number, data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE gu_redes SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteGURedes(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM gu_redes WHERE id=${id}`; }
  finally { await sql.end(); }
}
