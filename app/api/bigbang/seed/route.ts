import { isAuthenticated } from '@/lib/adminAuth';
import { ensureBigBangTables } from '@/lib/bigbangDb';
import postgres from 'postgres';

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no configurada.');
  return postgres(url, { ssl: 'require', max: 1 });
}

const SERVICIOS = [
  {
    nombre: 'Promo Clásic',
    descripcion: 'El paquete esencial de Big Bang con todo lo que necesitás para un cumpleaños infantil inolvidable.',
    incluye: JSON.stringify([
      'Cocinera incluida',
      'Monitora incluida',
      'Sala de juegos completa (11 videojuegos, pool, metegol, ping pong, tejo)',
      'Sala de destreza (3 inflables, 2 laberintos)',
      'Cancha de fútbol',
      '2 TV + consolas PlayStation',
      'Cocina equipada',
    ]),
    precio_min: 300000,
    precio_max: 370000,
    precio: 300000,
    duracion: '3 horas',
    cupo: 30,
    activo: true,
    orden: 1,
  },
  {
    nombre: 'Promo Full',
    descripcion: 'El paquete completo con menú incluido, personal completo y acceso a todos los juegos.',
    incluye: JSON.stringify([
      'Cocinera incluida',
      'Monitora incluida',
      'Moza incluida',
      'Menú: 24 panchos + 5 pizzas muzza',
      'Todos los videojuegos',
      'Sala de destreza completa (3 inflables, 2 laberintos)',
      'Cancha de fútbol',
      '2 TV + consolas PlayStation',
    ]),
    precio_min: 350000,
    precio_max: 400000,
    precio: 350000,
    duracion: '3 horas',
    cupo: 30,
    activo: true,
    orden: 2,
  },
];

export async function POST() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureBigBangTables();
  const sql = getClient();
  try {
    // Solo inserta si la tabla está vacía
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM bb_servicios`;
    if (count > 0) return Response.json({ ok: true, msg: 'Ya hay servicios cargados, no se repitió el seed.' });

    for (const s of SERVICIOS) {
      await sql`INSERT INTO bb_servicios (nombre, descripcion, incluye, precio, activo, orden)
                VALUES (${s.nombre}, ${s.descripcion}, ${s.incluye}, ${s.precio}, ${s.activo}, ${s.orden})`;
    }
    return Response.json({ ok: true, insertados: SERVICIOS.length });
  } finally { await sql.end(); }
}
