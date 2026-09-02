import { isAuthenticated } from '@/lib/adminAuth';
import { ensureGlowUpTables } from '@/lib/glowupDb';
import postgres from 'postgres';

function getClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no configurada.');
  return postgres(url, { ssl: 'require', max: 1 });
}

const SERVICIOS = [
  {
    nombre: 'Decoración y ambientación completa',
    descripcion: 'Ambientación personalizada para cada cliente. Un espacio físico creativo, estético y armónico que sirve de fondo para fotos donde se luce la temática elegida y la mesa dulce.',
    incluye: JSON.stringify([
      'Mesas decorativas',
      'Alzadas (bandejas y posa tortas según temática)',
      'Alfombra',
      'Paneles decorativos',
      'Accesorios (imágenes, flores, plantas, etc.)',
      'Carteles de luz neón (Happy Birthday y Nro.)',
      'Arco de globos 3 colores con globos dimensión 24" (de 1 a 4 metros)',
      'Nombre del cumpleañero/a',
    ]),
    condiciones: `• Reserva únicamente con seña del 50%
• Solo se llevan los globos y el nombre. El resto es EN ALQUILER.
• El envío se cotiza según la ubicación del salón.
• El saldo se cancela al llegar al lugar el día del evento, sin excepción.
• Zona de trabajo: Gran Mendoza (excluyendo Las Heras).
• Anticipación mínima: 1 semana antes del evento.`,
    precio_min: 100000,
    precio_max: 300000,
    tiempo: '2 a 3 horas',
    activo: true,
    orden: 1,
  },
  {
    nombre: 'Centro de mesa con globos',
    descripcion: 'Centros de mesa decorativos con globos temáticos para complementar la ambientación del evento.',
    incluye: JSON.stringify([
      'Globos temáticos según paleta de colores elegida',
      'Estructura base para el centro de mesa',
    ]),
    condiciones: `• Se cotiza por separado o como complemento de la decoración completa.
• Reserva con seña del 50%.
• Zona: Gran Mendoza (excluyendo Las Heras).`,
    precio_min: 0,
    precio_max: 0,
    tiempo: 'Incluido en el armado general',
    activo: true,
    orden: 2,
  },
  {
    nombre: 'Atril con globos',
    descripcion: 'Atril decorado con globos para dar marco a la entrada o al sector de fotos del evento.',
    incluye: JSON.stringify([
      'Atril decorativo',
      'Globos según temática y colores elegidos',
    ]),
    condiciones: `• Se cotiza según tamaño y cantidad de globos.
• Reserva con seña del 50%.`,
    precio_min: 0,
    precio_max: 0,
    tiempo: '30–60 minutos',
    activo: true,
    orden: 3,
  },
  {
    nombre: 'Bouquet con número en globo',
    descripcion: 'Bouquet de globos con número gigante para celebrar la edad del cumpleañero/a. Perfecto para fotos.',
    incluye: JSON.stringify([
      'Globo número según edad (dorado, plateado o color temático)',
      'Globos complementarios en paleta de colores elegida',
    ]),
    condiciones: `• Se cotiza según tamaño y colores.
• Disponible como add-on de cualquier decoración.`,
    precio_min: 0,
    precio_max: 0,
    tiempo: '20–30 minutos',
    activo: true,
    orden: 4,
  },
];

export async function POST() {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });
  await ensureGlowUpTables();
  const sql = getClient();
  try {
    const [{ count }] = await sql`SELECT COUNT(*)::int as count FROM gu_servicios`;
    if (count > 0) return Response.json({ ok: true, msg: 'Ya hay servicios cargados.' });
    for (const s of SERVICIOS) {
      await sql`INSERT INTO gu_servicios (nombre, descripcion, incluye, condiciones, precio_min, precio_max, tiempo, activo, orden)
                VALUES (${s.nombre}, ${s.descripcion}, ${s.incluye}, ${s.condiciones}, ${s.precio_min}, ${s.precio_max}, ${s.tiempo}, ${s.activo}, ${s.orden})`;
    }
    return Response.json({ ok: true, insertados: SERVICIOS.length });
  } finally { await sql.end(); }
}
