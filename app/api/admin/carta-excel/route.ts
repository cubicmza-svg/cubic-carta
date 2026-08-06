import { isAuthenticated } from '@/lib/adminAuth';
import { getAllItems, updateItem, addItem } from '@/lib/db';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

// Colores CUBIC
const COLOR_BG      = '1A1721'; // fondo oscuro
const COLOR_HEADER  = '4ADE80'; // verde acento
const COLOR_CAT: Record<string, string> = {
  'BRUNCH':               'FFF3E0',
  'PROMOS':               'E8F5E9',
  'CAFETERIA E INFUSIONES': 'E3F2FD',
  'BEBIDAS':              'FCE4EC',
  'COCTELERIA':           'F3E5F5',
  'MINUTAS':              'E0F7FA',
  'POSTRES':              'FFF9C4',
};
const COLOR_DEFAULT = 'F5F5F5';

function catColor(cat: string) {
  return COLOR_CAT[cat?.toUpperCase()] ?? COLOR_DEFAULT;
}

// GET — descarga el Excel con estilo
export async function GET() {
  if (!isAuthenticated()) return new Response('No autorizado', { status: 401 });

  const items = await getAllItems();
  const wb = new ExcelJS.Workbook();
  wb.creator = 'CUBIC Café & Bar';
  const ws = wb.addWorksheet('Carta', { views: [{ state: 'frozen', ySplit: 1 }] });

  // Columnas
  ws.columns = [
    { key: 'id',          header: 'ID',                 width: 6 },
    { key: 'categoria',   header: 'Categoría',          width: 22 },
    { key: 'subcat',      header: 'Subcategoría',       width: 20 },
    { key: 'nombre',      header: 'Nombre',             width: 28 },
    { key: 'descripcion', header: 'Descripción',        width: 45 },
    { key: 'precio',      header: 'Precio',             width: 12 },
    { key: 'precio_alt',  header: 'Precio alternativo', width: 22 },
    { key: 'activo',      header: 'Activo',             width: 9 },
    { key: 'orden',       header: 'Orden',              width: 8 },
  ];

  // Header row estilo
  const headerRow = ws.getRow(1);
  headerRow.height = 22;
  ws.columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font        = { bold: true, color: { argb: COLOR_BG }, size: 11, name: 'Calibri' };
    cell.fill        = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_HEADER } };
    cell.alignment   = { vertical: 'middle', horizontal: 'center', wrapText: false };
    cell.border = {
      bottom: { style: 'medium', color: { argb: '22C55E' } },
    };
  });

  // Filas de datos
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

    const bg = catColor(it.categoria);
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? bg : lighten(bg);

    row.eachCell((cell, colNum) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowBg } };
      cell.font = { name: 'Calibri', size: 10, color: { argb: '1A1721' } };
      cell.alignment = { vertical: 'middle', wrapText: colNum === 5 };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'DDDDDD' } },
      };
      // Precio en negrita
      if (colNum === 6) {
        cell.font = { ...cell.font, bold: true };
        cell.numFmt = '#,##0';
        cell.alignment = { ...cell.alignment, horizontal: 'right' };
      }
      // Activo centrado
      if (colNum === 8) {
        cell.alignment = { ...cell.alignment, horizontal: 'center' };
        if (it.activo) cell.font = { ...cell.font, color: { argb: '166534' }, bold: true };
        else           cell.font = { ...cell.font, color: { argb: '991B1B' } };
      }
      // ID centrado
      if (colNum === 1) cell.alignment = { ...cell.alignment, horizontal: 'center' };
    });
  });

  // Autofilter en header
  ws.autoFilter = { from: 'A1', to: 'I1' };

  const buf = await wb.xlsx.writeBuffer();

  return new Response(buf as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="carta-cubic.xlsx"',
    },
  });
}

// Aclara levemente un color hex para filas alternas
function lighten(hex: string): string {
  const r = Math.min(255, parseInt(hex.slice(0, 2), 16) + 12).toString(16).padStart(2, '0');
  const g = Math.min(255, parseInt(hex.slice(2, 4), 16) + 12).toString(16).padStart(2, '0');
  const b = Math.min(255, parseInt(hex.slice(4, 6), 16) + 12).toString(16).padStart(2, '0');
  return `${r}${g}${b}`;
}

// POST — recibe el Excel modificado, actualiza sin tocar imágenes
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
    const nombre       = String(row['Nombre']            ?? '').trim();
    const categoria    = String(row['Categoría']         ?? '').trim();
    const subcategoria = String(row['Subcategoría']      ?? '').trim();
    const descripcion  = String(row['Descripción']       ?? '').trim();
    const precio       = Number(row['Precio']            ?? 0);
    const precioAlt    = String(row['Precio alternativo'] ?? '').trim();
    const activo       = String(row['Activo'] ?? 'SI').toUpperCase() !== 'NO';
    const orden        = Number(row['Orden']             ?? 0);

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
