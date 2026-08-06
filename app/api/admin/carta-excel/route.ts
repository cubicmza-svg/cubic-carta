import { isAuthenticated } from '@/lib/adminAuth';
import { getAllItems, updateItem, addItem } from '@/lib/db';
import * as XLSX from 'xlsx';

// GET — descarga el Excel con todos los ítems
export async function GET() {
  if (!isAuthenticated()) return new Response('No autorizado', { status: 401 });

  const items = await getAllItems();

  const rows = items.map((it) => ({
    ID:                  it.id,
    Categoría:           it.categoria,
    Subcategoría:        it.subcategoria,
    Nombre:              it.nombre,
    Descripción:         it.descripcion,
    Precio:              it.precio,
    'Precio alternativo': it.precio_alternativo,
    Activo:              it.activo ? 'SI' : 'NO',
    Orden:               it.orden,
    // imagen_url se omite del Excel — solo se muestra para referencia, no se modifica
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Anchos de columna
  ws['!cols'] = [
    { wch: 6 }, { wch: 18 }, { wch: 18 }, { wch: 30 },
    { wch: 40 }, { wch: 10 }, { wch: 18 }, { wch: 8 }, { wch: 6 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Carta');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="carta-cubic.xlsx"',
    },
  });
}

// POST — recibe el Excel modificado, actualiza precios/info sin tocar imágenes
export async function POST(req: Request) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return Response.json({ error: 'No se recibió archivo' }, { status: 400 });

  const buf = await file.arrayBuffer();
  const wb  = XLSX.read(buf, { type: 'array' });
  const ws  = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  // Traemos los ítems actuales para preservar imagen_url
  const existing = await getAllItems();
  const byId     = new Map(existing.map((it) => [it.id, it]));

  let updated = 0;
  let created = 0;

  for (const row of rows) {
    const id          = row['ID'] != null ? Number(row['ID']) : null;
    const nombre      = String(row['Nombre']          ?? '').trim();
    const categoria   = String(row['Categoría']       ?? '').trim();
    const subcategoria = String(row['Subcategoría']   ?? '').trim();
    const descripcion = String(row['Descripción']     ?? '').trim();
    const precio      = Number(row['Precio']          ?? 0);
    const precioAlt   = String(row['Precio alternativo'] ?? '').trim();
    const activo      = String(row['Activo'] ?? 'SI').toUpperCase() !== 'NO';
    const orden       = Number(row['Orden']           ?? 0);

    if (!nombre) continue;

    if (id && byId.has(id)) {
      // Actualiza manteniendo la imagen existente
      const current = byId.get(id)!;
      await updateItem(id, {
        categoria, subcategoria, nombre, descripcion,
        precio, precio_alternativo: precioAlt,
        imagen_url: current.imagen_url, // preserva imagen
        activo, orden,
      });
      updated++;
    } else {
      // Ítem nuevo (sin ID o ID no encontrado)
      await addItem({
        categoria, subcategoria, nombre, descripcion,
        precio, precio_alternativo: precioAlt,
        imagen_url: '',
        activo, orden,
      });
      created++;
    }
  }

  return Response.json({ ok: true, updated, created });
}
