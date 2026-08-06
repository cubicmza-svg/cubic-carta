import { isAuthenticated } from '@/lib/adminAuth';
import { getAllItems, updateItem, addItem } from '@/lib/db';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

// ARGB = FF + hex RGB (FF = totalmente opaco)
const HDR_BG   = 'FF4ADE80'; // verde CUBIC
const HDR_FG   = 'FF1A1721'; // oscuro
const GOOD_FG  = 'FF166534'; // verde texto
const BAD_FG   = 'FF991B1B'; // rojo texto
const BODY_FG  = 'FF1A1721';

// Color de fondo por categoría (filas pares)
const CAT_COLORS: Record<string, string> = {
  'BRUNCH':                 'FFFFF8EE',
  'PROMOS':                 'FFEDFFF3',
  'CAFETERIA E INFUSIONES': 'FFE8F3FF',
  'BEBIDAS':                'FFFFF0F4',
  'COCTELERIA':             'FFF8F0FF',
  'MINUTAS':                'FFE8FFFC',
  'POSTRES':                'FFFFFCE8',
};
const CAT_DEFAULT = 'FFF9F9F9';

// Versión levemente más oscura para filas impares
function darken(argb: string): string {
  const hex = argb.slice(2); // quita FF
  const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 10).toString(16).padStart(2, '0');
  const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 10).toString(16).padStart(2, '0');
  const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 10).toString(16).padStart(2, '0');
  return `FF${r}${g}${b}`;
}

// GET — descarga Excel con estilos
export async function GET() {
  if (!isAuthenticated()) return new Response('No autorizado', { status: 401 });

  const items = await getAllItems();
  const wb = new ExcelJS.Workbook();
  wb.creator = 'CUBIC Café & Bar';

  const ws = wb.addWorksheet('Carta', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { key: 'id',          header: 'ID',                  width: 6  },
    { key: 'categoria',   header: 'Categoría',           width: 24 },
    { key: 'subcat',      header: 'Subcategoría',        width: 20 },
    { key: 'nombre',      header: 'Nombre',              width: 28 },
    { key: 'descripcion', header: 'Descripción',         width: 46 },
    { key: 'precio',      header: 'Precio',              width: 12 },
    { key: 'precio_alt',  header: 'Precio alternativo',  width: 24 },
    { key: 'activo',      header: 'Activo',              width: 9  },
    { key: 'orden',       header: 'Orden',               width: 8  },
  ];

  // ── Header ──
  const hRow = ws.getRow(1);
  hRow.height = 24;
  for (let c = 1; c <= 9; c++) {
    const cell = hRow.getCell(c);
    cell.font      = { bold: true, name: 'Calibri', size: 11, color: { argb: HDR_FG } };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: HDR_BG } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border    = { bottom: { style: 'medium', color: { argb: 'FF22C55E' } } };
  }

  // ── Filas ──
  items.forEach((it, idx) => {
    const row = ws.addRow({
      id:          it.id,
      categoria:   it.categoria,
      subcat:      it.subcategoria,
      nombre:      it.nombre,
      descripcion: it.descripcion,
      precio:      it.precio,
      precio_alt:  it.precio_alternativo,
      activo:      it.activo ? 'SI' : 'NO',
      orden:       it.orden,
    });
    row.height = 18;

    const base = CAT_COLORS[it.categoria?.toUpperCase()] ?? CAT_DEFAULT;
    const bg   = idx % 2 === 0 ? base : darken(base);

    row.eachCell((cell, col) => {
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.font      = { name: 'Calibri', size: 10, color: { argb: BODY_FG } };
      cell.alignment = { vertical: 'middle', wrapText: col === 5 };
      cell.border    = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } };

      if (col === 1) cell.alignment = { ...cell.alignment, horizontal: 'center' };

      if (col === 6) {
        cell.font      = { ...cell.font, bold: true };
        cell.numFmt    = '#,##0';
        cell.alignment = { ...cell.alignment, horizontal: 'right' };
      }

      if (col === 8) {
        cell.alignment = { ...cell.alignment, horizontal: 'center' };
        cell.font      = it.activo
          ? { ...cell.font, bold: true, color: { argb: GOOD_FG } }
          : { ...cell.font, color: { argb: BAD_FG } };
      }

      if (col === 9) cell.alignment = { ...cell.alignment, horizontal: 'center' };
    });
  });

  ws.autoFilter = { from: 'A1', to: 'I1' };

  const buf = await wb.xlsx.writeBuffer();

  return new Response(buf as ArrayBuffer, {
    headers: {
      'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="carta-cubic.xlsx"',
    },
  });
}

// POST — importa Excel modificado, actualiza sin tocar imágenes
export async function POST(req: Request) {
  if (!isAuthenticated()) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return Response.json({ error: 'No se recibió archivo' }, { status: 400 });

  const buf  = await file.arrayBuffer();
  const wb2  = XLSX.read(buf, { type: 'array' });
  const ws2  = wb2.Sheets[wb2.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws2);

  const existing = await getAllItems();
  const byId     = new Map(existing.map((it) => [it.id, it]));

  let updated = 0;
  let created = 0;

  for (const row of rows) {
    const id           = row['ID'] != null ? Number(row['ID']) : null;
    const nombre       = String(row['Nombre']             ?? '').trim();
    const categoria    = String(row['Categoría']          ?? '').trim();
    const subcategoria = String(row['Subcategoría']       ?? '').trim();
    const descripcion  = String(row['Descripción']        ?? '').trim();
    const precio       = Number(row['Precio']             ?? 0);
    const precioAlt    = String(row['Precio alternativo'] ?? '').trim();
    const activo       = String(row['Activo'] ?? 'SI').toUpperCase() !== 'NO';
    const orden        = Number(row['Orden']              ?? 0);

    if (!nombre) continue;

    if (id && byId.has(id)) {
      const current = byId.get(id)!;
      await updateItem(id, {
        categoria, subcategoria, nombre, descripcion,
        precio, precio_alternativo: precioAlt,
        imagen_url: current.imagen_url,
        activo, orden,
      });
      updated++;
    } else {
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
