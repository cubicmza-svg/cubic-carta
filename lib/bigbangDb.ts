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
    // Columnas de revision (se agregan si no existen)
    await sql`ALTER TABLE bb_redes ADD COLUMN IF NOT EXISTS revisado BOOLEAN NOT NULL DEFAULT FALSE`;
    await sql`ALTER TABLE bb_redes ADD COLUMN IF NOT EXISTS feedback TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE bb_redes ADD COLUMN IF NOT EXISTS tipo_grabacion TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE bb_redes ADD COLUMN IF NOT EXISTS guion TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE bb_redes ADD COLUMN IF NOT EXISTS imagen TEXT NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE bb_redes ADD COLUMN IF NOT EXISTS video_url TEXT NOT NULL DEFAULT ''`;
    // Precios web
    await sql`
      CREATE TABLE IF NOT EXISTS bb_precios_web (
        clave       TEXT PRIMARY KEY,
        valor       TEXT NOT NULL DEFAULT '',
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    // Imágenes web
    await sql`
      CREATE TABLE IF NOT EXISTS bb_imagenes_web (
        clave       TEXT PRIMARY KEY,
        valor       TEXT NOT NULL DEFAULT '',
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  } finally {
    await sql.end();
  }
}

// ── IMÁGENES WEB ─────────────────────────────────────────────────────────────
export const BB_IMAGENES_DEFAULT: Record<string, string> = {
  hero:        '1rqMg9_jnepmftZwyt63geejGvnDN2oPF',
  featured_1:  '1Rueuki_-g9EFv1I1jAF5PvC8anQXrEyt',
  featured_2:  '1cAig93_4i5wOjtoOucopXkK7VmySx1QL',
  featured_3:  '1-3o8b-Sh41cqE-TnqJ4hEOQJI1ar5B-F',
  featured_4:  '1rqMg9_jnepmftZwyt63geejGvnDN2oPF',
  galeria_1:   '1uxVr8q2TCZqpS-DHbBaStNa8fd_ioQz4',
  galeria_2:   '1cAig93_4i5wOjtoOucopXkK7VmySx1QL',
  galeria_3:   '1rqMg9_jnepmftZwyt63geejGvnDN2oPF',
  galeria_4:   '1j5JJdLCg8r6RP_49vgAeXKTQF3W3e5Bq',
  galeria_5:   '1tbGYmdkt1kDBn3EkDBqYFahkWhV47BKX',
  galeria_6:   '1lBUXlOID7rN0XpR6qlFGCBjOnVh4X8k9',
  galeria_7:   '1z6uHKUwYk-HKBjT35Wx-ViHzY3JOI0g1',
  galeria_8:   '1nvqtnhzXEYN_eleRhvMBFCvZ-Fg_dJ-R',
  galeria_9:   '18hdqot3j9kr3PYJwTP7NSbSJY_0bBkmS',
  galeria_10:  '1TKv6DWbdQ-JThIikz5WfH6UNsORf5rcM',
  galeria_11:  '1-3o8b-Sh41cqE-TnqJ4hEOQJI1ar5B-F',
  galeria_12:  '1Rueuki_-g9EFv1I1jAF5PvC8anQXrEyt',
};

export async function getBBImagenesWeb(): Promise<Record<string, string>> {
  const sql = getClient();
  try {
    const rows = await sql<{ clave: string; valor: string }[]>`SELECT clave, valor FROM bb_imagenes_web`;
    const result = { ...BB_IMAGENES_DEFAULT };
    for (const r of rows) result[r.clave] = r.valor;
    return result;
  } finally { await sql.end(); }
}

export async function setBBImagenesWeb(data: Record<string, string>) {
  const sql = getClient();
  try {
    for (const [clave, valor] of Object.entries(data)) {
      await sql`
        INSERT INTO bb_imagenes_web (clave, valor, updated_at) VALUES (${clave}, ${valor}, NOW())
        ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, updated_at = NOW()
      `;
    }
  } finally { await sql.end(); }
}

// ── PRECIOS WEB ───────────────────────────────────────────────────────────────
export const BB_PRECIOS_DEFAULT: Record<string, string> = {
  promo_super_lv:       '265000',
  promo_clasic_lj:      '310000',
  promo_clasic_finde:   '335000',
  promo_clasic_sena:    '150000',
  promo_full_lj:        '370000',
  promo_full_finde:     '399000',
  adic_hora_extra:      '103000',
  adic_invitado_extra:  '5170',
  adic_moza:            '40500',
  adic_parrillero:      '49000',
  adic_dispenser:       '18000',
  menu_pizza_muzza:     '17500',
  menu_pizza_napo:      '20700',
  menu_panchos_24:      '53500',
  menu_hamburguesas_12: '70000',
  menu_snack:           '48500',
  menu_empanadas:       '20000',
  menu_sandwiches:      '110000',
  beb_gaseosa:          '7500',
  beb_agua_sab:         '7500',
  beb_agua_min:         '7500',
  beb_cerveza:          '9200',
  beb_hielo:            '7900',
};

export async function getBBPreciosWeb(): Promise<Record<string, string>> {
  const sql = getClient();
  try {
    const rows = await sql<{ clave: string; valor: string }[]>`SELECT clave, valor FROM bb_precios_web`;
    const result = { ...BB_PRECIOS_DEFAULT };
    for (const r of rows) result[r.clave] = r.valor;
    return result;
  } finally { await sql.end(); }
}

export async function setBBPreciosWeb(data: Record<string, string>) {
  const sql = getClient();
  try {
    for (const [clave, valor] of Object.entries(data)) {
      await sql`
        INSERT INTO bb_precios_web (clave, valor, updated_at) VALUES (${clave}, ${valor}, NOW())
        ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, updated_at = NOW()
      `;
    }
  } finally { await sql.end(); }
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
