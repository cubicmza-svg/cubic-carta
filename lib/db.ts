import postgres from 'postgres';
import type { MenuItem } from './types';

// ─── Conexión ─────────────────────────────────────────────────────────────────
function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL no configurada. ' +
      'Agregala en las variables de entorno de Vercel o en .env.local'
    );
  }
  return postgres(url, {
    ssl: 'require',
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

// ─── Mapeo DB row → MenuItem ──────────────────────────────────────────────────
function toItem(row: Record<string, unknown>): MenuItem {
  return {
    id:                   Number(row.id),
    categoria:            String(row.categoria   ?? ''),
    subcategoria:         String(row.subcategoria ?? ''),
    nombre:               String(row.nombre       ?? ''),
    descripcion:          String(row.descripcion  ?? ''),
    precio:               Number(row.precio       ?? 0),
    precio_alternativo:   String(row.precio_alternativo ?? ''),
    imagen_url:           String(row.imagen_url   ?? ''),
    activo:               Boolean(row.activo),
    orden:                Number(row.orden        ?? 0),
  };
}

// ─── Crear tabla (idempotente) ────────────────────────────────────────────────
export async function createTable(): Promise<void> {
  const sql = getClient();
  await sql`
    CREATE TABLE IF NOT EXISTS menu_items (
      id                 SERIAL PRIMARY KEY,
      categoria          TEXT    NOT NULL DEFAULT '',
      subcategoria       TEXT    NOT NULL DEFAULT '',
      nombre             TEXT    NOT NULL DEFAULT '',
      descripcion        TEXT    NOT NULL DEFAULT '',
      precio             INTEGER NOT NULL DEFAULT 0,
      precio_alternativo TEXT    NOT NULL DEFAULT '',
      imagen_url         TEXT    NOT NULL DEFAULT '',
      activo             BOOLEAN NOT NULL DEFAULT TRUE,
      orden              INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql.end();
}

// ─── CRUD ──────────────────────────────────────────────────────────────────────

export async function getAllItems(): Promise<MenuItem[]> {
  const sql = getClient();
  try {
    const rows = await sql<Record<string, unknown>[]>`
      SELECT id, categoria, subcategoria, nombre, descripcion,
             precio, precio_alternativo, imagen_url, activo, orden
      FROM menu_items
      ORDER BY orden ASC, id ASC
    `;
    return rows.map(toItem);
  } finally {
    await sql.end();
  }
}

export async function addItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
  const sql = getClient();
  try {
    const [row] = await sql<Record<string, unknown>[]>`
      INSERT INTO menu_items
        (categoria, subcategoria, nombre, descripcion, precio,
         precio_alternativo, imagen_url, activo, orden)
      VALUES
        (${data.categoria}, ${data.subcategoria}, ${data.nombre},
         ${data.descripcion}, ${data.precio}, ${data.precio_alternativo},
         ${data.imagen_url}, ${data.activo}, ${data.orden})
      RETURNING *
    `;
    return toItem(row);
  } finally {
    await sql.end();
  }
}

export async function updateItem(
  id: number,
  data: Omit<MenuItem, 'id'>
): Promise<MenuItem> {
  const sql = getClient();
  try {
    const [row] = await sql<Record<string, unknown>[]>`
      UPDATE menu_items SET
        categoria          = ${data.categoria},
        subcategoria       = ${data.subcategoria},
        nombre             = ${data.nombre},
        descripcion        = ${data.descripcion},
        precio             = ${data.precio},
        precio_alternativo = ${data.precio_alternativo},
        imagen_url         = ${data.imagen_url},
        activo             = ${data.activo},
        orden              = ${data.orden}
      WHERE id = ${id}
      RETURNING *
    `;
    if (!row) throw new Error(`Ítem ${id} no encontrado`);
    return toItem(row);
  } finally {
    await sql.end();
  }
}

export async function deleteItem(id: number): Promise<void> {
  const sql = getClient();
  try {
    const result = await sql`DELETE FROM menu_items WHERE id = ${id}`;
    if (result.count === 0) throw new Error(`Ítem ${id} no encontrado`);
  } finally {
    await sql.end();
  }
}

// ─── Seed (crea tabla + trunca + inserta todos los ítems) ─────────────────────
export async function seedDatabase(
  items: Omit<MenuItem, 'id'>[]
): Promise<number> {
  const sql = getClient();
  try {
    // 1. Crear tabla si no existe
    await sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id                 SERIAL PRIMARY KEY,
        categoria          TEXT    NOT NULL DEFAULT '',
        subcategoria       TEXT    NOT NULL DEFAULT '',
        nombre             TEXT    NOT NULL DEFAULT '',
        descripcion        TEXT    NOT NULL DEFAULT '',
        precio             INTEGER NOT NULL DEFAULT 0,
        precio_alternativo TEXT    NOT NULL DEFAULT '',
        imagen_url         TEXT    NOT NULL DEFAULT '',
        activo             BOOLEAN NOT NULL DEFAULT TRUE,
        orden              INTEGER NOT NULL DEFAULT 0
      )
    `;

    // 2. Limpiar datos actuales
    await sql`TRUNCATE TABLE menu_items RESTART IDENTITY`;

    // 3. Bulk insert con el helper nativo de postgres.js
    //    sql(rows) genera: VALUES ($1,$2,...),($n,$n+1,...) sin casteos manuales
    const rows = items.map((item) => ({
      categoria:          item.categoria,
      subcategoria:       item.subcategoria,
      nombre:             item.nombre,
      descripcion:        item.descripcion,
      precio:             item.precio,
      precio_alternativo: item.precio_alternativo,
      imagen_url:         item.imagen_url,
      activo:             item.activo,
      orden:              item.orden,
    }));

    await sql`INSERT INTO menu_items ${sql(rows)}`;

    return items.length;
  } finally {
    await sql.end();
  }
}
