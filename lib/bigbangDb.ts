import postgres from 'postgres';

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no configurada.');
  return postgres(url, { ssl: 'require', max: 5, idle_timeout: 20, connect_timeout: 10 });
}

export async function ensureBigBangTables() {
  const sql = getClient();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS bb_servicios (
        id          SERIAL PRIMARY KEY,
        nombre      TEXT    NOT NULL DEFAULT '',
        descripcion TEXT    NOT NULL DEFAULT '',
        incluye     TEXT    NOT NULL DEFAULT '[]',
        precio      INTEGER NOT NULL DEFAULT 0,
        activo      BOOLEAN NOT NULL DEFAULT TRUE,
        orden       INTEGER NOT NULL DEFAULT 0,
        creado_el   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS bb_reservas (
        id            SERIAL PRIMARY KEY,
        cliente       TEXT    NOT NULL DEFAULT '',
        telefono      TEXT    NOT NULL DEFAULT '',
        fecha_evento  DATE    NOT NULL,
        hora_inicio   TEXT    NOT NULL DEFAULT '',
        hora_fin      TEXT    NOT NULL DEFAULT '',
        tipo_evento   TEXT    NOT NULL DEFAULT 'cumpleaños',
        servicio_id   INTEGER,
        servicio_nombre TEXT  NOT NULL DEFAULT '',
        cant_chicos   INTEGER NOT NULL DEFAULT 0,
        cant_adultos  INTEGER NOT NULL DEFAULT 0,
        total         INTEGER NOT NULL DEFAULT 0,
        sena          INTEGER NOT NULL DEFAULT 0,
        sena_pagada   BOOLEAN NOT NULL DEFAULT FALSE,
        estado        TEXT    NOT NULL DEFAULT 'pendiente',
        notas         TEXT    NOT NULL DEFAULT '',
        creado_el     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS bb_presupuestos (
        id            SERIAL PRIMARY KEY,
        cliente       TEXT    NOT NULL DEFAULT '',
        telefono      TEXT    NOT NULL DEFAULT '',
        fecha_evento  DATE,
        tipo_evento   TEXT    NOT NULL DEFAULT 'cumpleaños',
        servicio_id   INTEGER,
        servicio_nombre TEXT  NOT NULL DEFAULT '',
        cant_chicos   INTEGER NOT NULL DEFAULT 0,
        cant_adultos  INTEGER NOT NULL DEFAULT 0,
        items         TEXT    NOT NULL DEFAULT '[]',
        total         INTEGER NOT NULL DEFAULT 0,
        estado        TEXT    NOT NULL DEFAULT 'enviado',
        notas         TEXT    NOT NULL DEFAULT '',
        creado_el     TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS bb_diseno (
        id              SERIAL PRIMARY KEY,
        nombre          TEXT    NOT NULL DEFAULT '',
        descripcion     TEXT    NOT NULL DEFAULT '',
        status          TEXT    NOT NULL DEFAULT 'pendiente',
        archivos        TEXT    NOT NULL DEFAULT '[]',
        creado_el       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS bb_redes (
        id           SERIAL PRIMARY KEY,
        titulo       TEXT    NOT NULL DEFAULT '',
        caption      TEXT    NOT NULL DEFAULT '',
        plataforma   TEXT    NOT NULL DEFAULT 'instagram',
        formato      TEXT    NOT NULL DEFAULT 'feed',
        estado       TEXT    NOT NULL DEFAULT 'idea',
        fechas_prog  TEXT    NOT NULL DEFAULT '[]',
        link_drive   TEXT    NOT NULL DEFAULT '',
        pilar        TEXT    NOT NULL DEFAULT '',
        creado_el    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  } finally {
    await sql.end();
  }
}

// ── MARKETING: DISEÑO ────────────────────────────────────────────────────────
export async function getBBDiseno() {
  const sql = getClient();
  try { return await sql`SELECT * FROM bb_diseno ORDER BY creado_el DESC`; }
  finally { await sql.end(); }
}
export async function addBBDiseno(data: { nombre: string; descripcion: string }) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO bb_diseno (nombre, descripcion) VALUES (${data.nombre}, ${data.descripcion}) RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateBBDiseno(id: number, data: Partial<{ nombre: string; descripcion: string; status: string; archivos: string }>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE bb_diseno SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteBBDiseno(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM bb_diseno WHERE id=${id}`; }
  finally { await sql.end(); }
}

// ── MARKETING: REDES ─────────────────────────────────────────────────────────
export async function getBBRedes() {
  const sql = getClient();
  try { return await sql`SELECT * FROM bb_redes ORDER BY creado_el DESC`; }
  finally { await sql.end(); }
}
export async function addBBRedes(data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO bb_redes ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateBBRedes(id: number, data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE bb_redes SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteBBRedes(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM bb_redes WHERE id=${id}`; }
  finally { await sql.end(); }
}

// ── SERVICIOS ─────────────────────────────────────────────────────────────────
export async function getServicios() {
  const sql = getClient();
  try { return await sql`SELECT * FROM bb_servicios ORDER BY orden ASC, id ASC`; }
  finally { await sql.end(); }
}
export async function addServicio(data: { nombre: string; descripcion: string; incluye: string; precio: number; orden: number }) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO bb_servicios ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateServicio(id: number, data: Partial<{ nombre: string; descripcion: string; incluye: string; precio: number; activo: boolean; orden: number }>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE bb_servicios SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteServicio(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM bb_servicios WHERE id=${id}`; }
  finally { await sql.end(); }
}

// ── RESERVAS ──────────────────────────────────────────────────────────────────
export async function getReservas() {
  const sql = getClient();
  try { return await sql`SELECT * FROM bb_reservas ORDER BY fecha_evento ASC, id ASC`; }
  finally { await sql.end(); }
}
export async function addReserva(data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO bb_reservas ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateReserva(id: number, data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE bb_reservas SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteReserva(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM bb_reservas WHERE id=${id}`; }
  finally { await sql.end(); }
}

// ── PRESUPUESTOS ──────────────────────────────────────────────────────────────
export async function getPresupuestos() {
  const sql = getClient();
  try { return await sql`SELECT * FROM bb_presupuestos ORDER BY creado_el DESC`; }
  finally { await sql.end(); }
}
export async function addPresupuesto(data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO bb_presupuestos ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updatePresupuesto(id: number, data: Record<string, unknown>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE bb_presupuestos SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deletePresupuesto(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM bb_presupuestos WHERE id=${id}`; }
  finally { await sql.end(); }
}
