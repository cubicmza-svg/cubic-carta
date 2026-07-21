import postgres from 'postgres';

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no configurada.');
  return postgres(url, { ssl: 'require', max: 5, idle_timeout: 20, connect_timeout: 10 });
}

export async function ensureStudioTables() {
  const sql = getClient();
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS studio_eventos (
        id         SERIAL PRIMARY KEY,
        year       INTEGER NOT NULL,
        month      INTEGER NOT NULL,
        day        INTEGER NOT NULL,
        nombre     TEXT    NOT NULL DEFAULT '',
        tipo       TEXT    NOT NULL DEFAULT 'other',
        creado_el  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS studio_diseno (
        id              SERIAL PRIMARY KEY,
        nombre          TEXT    NOT NULL DEFAULT '',
        descripcion     TEXT    NOT NULL DEFAULT '',
        status          TEXT    NOT NULL DEFAULT 'pendiente',
        archivo         TEXT    NOT NULL DEFAULT '',
        archivo_nombre  TEXT    NOT NULL DEFAULT '',
        archivo_tipo    TEXT    NOT NULL DEFAULT '',
        creado_el       TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS studio_redes (
        id           SERIAL PRIMARY KEY,
        titulo       TEXT    NOT NULL DEFAULT '',
        caption      TEXT    NOT NULL DEFAULT '',
        plataforma   TEXT    NOT NULL DEFAULT 'instagram',
        formato      TEXT    NOT NULL DEFAULT 'feed',
        estado       TEXT    NOT NULL DEFAULT 'idea',
        fecha_prog   DATE,
        fechas_prog  TEXT    NOT NULL DEFAULT '[]',
        link_drive   TEXT    NOT NULL DEFAULT '',
        pilar        TEXT    NOT NULL DEFAULT '',
        creado_el    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    // Migraciones seguras
    await sql`ALTER TABLE studio_redes ADD COLUMN IF NOT EXISTS fechas_prog TEXT NOT NULL DEFAULT '[]'`;
    await sql`ALTER TABLE studio_redes ADD COLUMN IF NOT EXISTS link_drive  TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE studio_diseno ADD COLUMN IF NOT EXISTS archivos TEXT NOT NULL DEFAULT '[]'`;

    await sql`
      CREATE TABLE IF NOT EXISTS studio_campanas (
        id           SERIAL PRIMARY KEY,
        nombre       TEXT    NOT NULL DEFAULT '',
        fecha_inicio DATE    NOT NULL,
        fecha_fin    DATE    NOT NULL,
        idea         TEXT    NOT NULL DEFAULT '',
        eje          TEXT    NOT NULL DEFAULT '',
        productos    TEXT    NOT NULL DEFAULT '[]',
        tipo         TEXT    NOT NULL DEFAULT 'campaign',
        creado_el    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  } finally {
    await sql.end();
  }
}

// ── EVENTOS ──────────────────────────────────────────────────────────────────
export async function getEventos() {
  const sql = getClient();
  try { return await sql`SELECT * FROM studio_eventos ORDER BY year, month, day, id`; }
  finally { await sql.end(); }
}
export async function addEvento(data: { year: number; month: number; day: number; nombre: string; tipo: string }) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO studio_eventos ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteEvento(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM studio_eventos WHERE id = ${id}`; }
  finally { await sql.end(); }
}
export async function updateEvento(id: number, data: { nombre: string; tipo: string }) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE studio_eventos SET nombre=${data.nombre}, tipo=${data.tipo} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}

// ── CAMPAÑAS ──────────────────────────────────────────────────────────────────
export async function getCampanas() {
  const sql = getClient();
  try { return await sql`SELECT * FROM studio_campanas ORDER BY fecha_inicio ASC`; }
  finally { await sql.end(); }
}
export async function addCampana(data: {
  nombre: string; fecha_inicio: string; fecha_fin: string;
  idea: string; eje: string; productos: string; tipo: string;
}) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO studio_campanas ${sql(data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateCampana(id: number, data: Partial<{
  nombre: string; fecha_inicio: string; fecha_fin: string;
  idea: string; eje: string; productos: string; tipo: string;
}>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE studio_campanas SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteCampana(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM studio_campanas WHERE id = ${id}`; }
  finally { await sql.end(); }
}

// ── DISEÑO ────────────────────────────────────────────────────────────────────
export async function getDiseno() {
  const sql = getClient();
  try { return await sql`SELECT * FROM studio_diseno ORDER BY creado_el DESC`; }
  finally { await sql.end(); }
}
export async function addDiseno(data: { nombre: string; descripcion: string }) {
  const sql = getClient();
  try {
    const [row] = await sql`INSERT INTO studio_diseno (nombre, descripcion) VALUES (${data.nombre}, ${data.descripcion}) RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateDiseno(id: number, data: Partial<{ nombre: string; descripcion: string; status: string; archivo: string; archivo_nombre: string; archivo_tipo: string; archivos: string }>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE studio_diseno SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteDiseno(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM studio_diseno WHERE id = ${id}`; }
  finally { await sql.end(); }
}

// ── REDES ─────────────────────────────────────────────────────────────────────
export async function getRedes() {
  const sql = getClient();
  try { return await sql`SELECT * FROM studio_redes ORDER BY creado_el DESC`; }
  finally { await sql.end(); }
}
export async function addRedes(data: {
  titulo: string; caption: string; plataforma: string; formato: string;
  estado: string; fecha_prog: string | null; fechas_prog: string;
  link_drive: string; pilar: string;
}) {
  const sql = getClient();
  try {
    const row_data = { ...data, fecha_prog: data.fecha_prog || null };
    const [row] = await sql`INSERT INTO studio_redes ${sql(row_data)} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function updateRedes(id: number, data: Partial<{
  titulo: string; caption: string; plataforma: string; formato: string;
  estado: string; fecha_prog: string | null; fechas_prog: string;
  link_drive: string; pilar: string;
}>) {
  const sql = getClient();
  try {
    const [row] = await sql`UPDATE studio_redes SET ${sql(data)} WHERE id=${id} RETURNING *`;
    return row;
  } finally { await sql.end(); }
}
export async function deleteRedes(id: number) {
  const sql = getClient();
  try { await sql`DELETE FROM studio_redes WHERE id = ${id}`; }
  finally { await sql.end(); }
}
