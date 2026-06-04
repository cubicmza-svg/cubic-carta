export interface MenuItem {
  categoria: string;
  subcategoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  precio_alternativo: string;
  imagen_url: string;
}

export interface MenuGroup {
  categoria: string;
  subcategorias: {
    [key: string]: MenuItem[];
  };
}

const SHEET_ID = '1TC8UYlQR0wpF4cUQYyYYqs6bUQpZvjRCVAsfXR6PfZg';
const SHEET_NAME = 'carta';

export async function getMenu(): Promise<MenuItem[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 }, // Revalidar cada 5 minutos
    });

    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const text = await res.text();

    // La respuesta de Google es JSONP — remover el wrapper
    const jsonString = text
      .replace(/^.*?google\.visualization\.Query\.setResponse\(/, '')
      .replace(/\);?\s*$/, '');

    const data = JSON.parse(jsonString);
    const rows = data?.table?.rows ?? [];
    const cols = data?.table?.cols ?? [];

    // Mapear índices de columnas por etiqueta
    const colIndex: Record<string, number> = {};
    cols.forEach((col: { label: string }, i: number) => {
      colIndex[col.label.toLowerCase().trim()] = i;
    });

    const getCell = (row: { c: Array<{ v: unknown } | null> }, key: string): string => {
      const idx = colIndex[key];
      if (idx === undefined) return '';
      const cell = row.c[idx];
      if (!cell || cell.v === null || cell.v === undefined) return '';
      return String(cell.v).trim();
    };

    const items: MenuItem[] = [];

    for (const row of rows) {
      const categoria = getCell(row, 'categoria');
      const nombre = getCell(row, 'nombre');

      // Saltar filas sin categoría o sin nombre (notas/encabezados vacíos)
      if (!categoria || !nombre) continue;

      // Saltar filas de "nota" (la fila informativa de los brunch)
      if (nombre.toLowerCase().startsWith('(nota)')) continue;

      const precioRaw = getCell(row, 'precio');
      const precio = precioRaw ? parseFloat(precioRaw) : 0;

      // Respetar columna 'activo' si existe (panel admin); si no existe, mostrar todo
      const activoRaw = getCell(row, 'activo');
      const activo = activoRaw === '' || activoRaw.toUpperCase() !== 'FALSE';
      if (!activo) continue;

      items.push({
        categoria,
        subcategoria: getCell(row, 'subcategoria'),
        nombre,
        descripcion: getCell(row, 'descripcion'),
        precio,
        precio_alternativo: getCell(row, 'precio_alternativo'),
        imagen_url: getCell(row, 'imagen_url'),
      });
    }

    return items;
  } catch (err) {
    console.error('Error fetching menu from Google Sheets:', err);
    return getFallbackMenu();
  }
}

export function groupByCategoria(items: MenuItem[]): MenuGroup[] {
  const map = new Map<string, MenuGroup>();

  for (const item of items) {
    if (!map.has(item.categoria)) {
      map.set(item.categoria, { categoria: item.categoria, subcategorias: {} });
    }
    const group = map.get(item.categoria)!;
    const sub = item.subcategoria || '_';
    if (!group.subcategorias[sub]) group.subcategorias[sub] = [];
    group.subcategorias[sub].push(item);
  }

  return Array.from(map.values());
}

// Datos de fallback para cuando el Sheet no esté configurado
function getFallbackMenu(): MenuItem[] {
  return [
    { categoria: 'BRUNCH', subcategoria: 'DE CAMPO', nombre: 'Tostón de Campo', descripcion: 'Tostón con palta y huevo + fetas de jamón y queso', precio: 11400, precio_alternativo: 'Para compartir: $20.000', imagen_url: '' },
    { categoria: 'BRUNCH', subcategoria: 'ITALIAN CUBIC', nombre: 'Focaccia Rellena', descripcion: 'Focaccia rellena de jamón y queso', precio: 10500, precio_alternativo: 'Para compartir: $17.000', imagen_url: '' },
    { categoria: 'BRUNCH', subcategoria: 'PARISINO', nombre: 'Croissant Relleno', descripcion: 'Dulce o salado (consultar variedades)', precio: 8000, precio_alternativo: 'Para compartir: $16.000', imagen_url: '' },
    { categoria: 'BRUNCH', subcategoria: 'FITNESS', nombre: 'Yogurt con Frutas', descripcion: 'Yogurt con frutas frescas + mix frutos secos + 2 tostadas integrales + jugo chico + dip queso y dulce', precio: 13000, precio_alternativo: 'Para compartir: $23.000', imagen_url: '' },
    { categoria: 'PROMOS', subcategoria: 'PROMO 1', nombre: 'Infusión + Torta o Medialuna', descripcion: 'Infusión grande + torta o medialuna', precio: 3000, precio_alternativo: 'Para compartir: $5.500', imagen_url: '' },
    { categoria: 'PROMOS', subcategoria: 'PROMO 2', nombre: 'Infusión + Tostadas', descripcion: 'Infusión grande + 2 tostadas + queso crema y dulce + jugo chico', precio: 5000, precio_alternativo: 'Para compartir: $9.500', imagen_url: '' },
    { categoria: 'PROMOS', subcategoria: 'PROMO 3', nombre: 'Infusión + Tostado/Panini', descripcion: 'Infusión grande + jugo chico + tostado o panini o sandwich frío con tomate y lechuga', precio: 7800, precio_alternativo: 'Para compartir: $12.600', imagen_url: '' },
    { categoria: 'PROMOS', subcategoria: 'PROMO 4', nombre: 'Infusión + Torta + Jugo', descripcion: 'Infusión grande + porción de torta + jugo chico', precio: 10000, precio_alternativo: 'Para compartir: $18.000', imagen_url: '' },
    { categoria: 'CAFETERIA E INFUSIONES', subcategoria: 'TRADICIONAL', nombre: 'Café Solo', descripcion: '', precio: 2500, precio_alternativo: 'Mediano: $2.800 / Grande: $3.300', imagen_url: '' },
    { categoria: 'CAFETERIA E INFUSIONES', subcategoria: 'TRADICIONAL', nombre: 'Cortado', descripcion: '', precio: 2500, precio_alternativo: 'Mediano: $2.800 / Grande: $3.300', imagen_url: '' },
    { categoria: 'CAFETERIA E INFUSIONES', subcategoria: 'TRADICIONAL', nombre: 'Latte', descripcion: '', precio: 2500, precio_alternativo: 'Mediano: $2.800 / Grande: $3.300', imagen_url: '' },
    { categoria: 'CAFETERIA E INFUSIONES', subcategoria: 'TRADICIONAL', nombre: 'Espresso Simple', descripcion: '', precio: 2500, precio_alternativo: '', imagen_url: '' },
    { categoria: 'CAFETERIA E INFUSIONES', subcategoria: 'TRADICIONAL', nombre: 'Espresso Doble', descripcion: '', precio: 3300, precio_alternativo: '', imagen_url: '' },
    { categoria: 'CAFETERIA E INFUSIONES', subcategoria: 'ESPECIALES', nombre: 'Flat White', descripcion: '', precio: 4600, precio_alternativo: '', imagen_url: '' },
    { categoria: 'CAFETERIA E INFUSIONES', subcategoria: 'ESPECIALES', nombre: 'Capuccino', descripcion: '', precio: 6000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'CAFETERIA E INFUSIONES', subcategoria: 'ESPECIALES', nombre: 'Submarino', descripcion: '', precio: 6000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'CAFETERIA E INFUSIONES', subcategoria: 'ESPECIALES', nombre: 'Ice Caramel', descripcion: '', precio: 5000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'CAFETERIA E INFUSIONES', subcategoria: 'ESPECIALES', nombre: 'Coffee Tonic', descripcion: '', precio: 5000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA ACOMPAÑAR', subcategoria: 'DULCE', nombre: 'Medialuna', descripcion: '', precio: 1000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA ACOMPAÑAR', subcategoria: 'DULCE', nombre: 'Porción de Torta', descripcion: 'Consultar variedades', precio: 7500, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA ACOMPAÑAR', subcategoria: 'DULCE', nombre: 'Tostadas + Dip', descripcion: 'Con queso o manteca y mermelada', precio: 3900, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA ACOMPAÑAR', subcategoria: 'SALADO', nombre: 'Panini Jamón & Queso', descripcion: '', precio: 4500, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA ACOMPAÑAR', subcategoria: 'SALADO', nombre: 'Tostado Grande', descripcion: '', precio: 8000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA ACOMPAÑAR', subcategoria: 'SALADO', nombre: 'Sandwich Clásico', descripcion: 'Con jamón, queso, lechuga y tomate', precio: 5300, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA ACOMPAÑAR', subcategoria: 'ADICIONALES', nombre: 'Dip de Palta', descripcion: '', precio: 2200, precio_alternativo: '', imagen_url: '' },
    { categoria: 'GLUTEN FREE', subcategoria: '', nombre: 'Alfajores', descripcion: 'Consultar variedad', precio: 3800, precio_alternativo: '', imagen_url: '' },
    { categoria: 'GLUTEN FREE', subcategoria: '', nombre: 'Sandwich Pollo Teriyaki', descripcion: '', precio: 9800, precio_alternativo: '', imagen_url: '' },
    { categoria: 'GLUTEN FREE', subcategoria: '', nombre: 'Lomo Completo', descripcion: 'Pan casero o focaccia — con lomo veteado, huevo, tomate, lechuga y lactonesa', precio: 18000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'GLUTEN FREE', subcategoria: 'PIZZAS GF', nombre: 'Muzzarella (4 porciones)', descripcion: '', precio: 4500, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA COMER', subcategoria: 'PICADAS', nombre: 'Picada Avenida', descripcion: '', precio: 17700, precio_alternativo: '4 personas: $33.750', imagen_url: '' },
    { categoria: 'PARA COMER', subcategoria: 'PICADAS', nombre: 'Picada Cubic', descripcion: '', precio: 23250, precio_alternativo: '4 personas: $45.000', imagen_url: '' },
    { categoria: 'PARA COMER', subcategoria: 'PAPAS FRITAS', nombre: 'Papas Tradicionales', descripcion: '', precio: 4000, precio_alternativo: 'Grandes: $8.000', imagen_url: '' },
    { categoria: 'PARA COMER', subcategoria: 'PIZZAS', nombre: 'Muzarella', descripcion: '6 porciones', precio: 6300, precio_alternativo: '12 porciones: $11.700', imagen_url: '' },
    { categoria: 'PARA COMER', subcategoria: 'EMPANADAS', nombre: 'Carne o Pollo x 2', descripcion: '', precio: 2500, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA COMER', subcategoria: 'ENSALADAS', nombre: 'Ensalada César', descripcion: 'Colchón de verdes, cubos de pollo, crutones, escamas de queso y salsa César', precio: 9800, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA COMER', subcategoria: 'SANDWICH', nombre: 'Lomo Completo', descripcion: 'Ternera, cerdo o pollo', precio: 13000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA COMER', subcategoria: 'AL PLATO', nombre: 'Milanesa Napolitana', descripcion: 'Con guarnición', precio: 10000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA COMER', subcategoria: 'HAMBURGUESAS', nombre: 'Americana', descripcion: '', precio: 0, precio_alternativo: '', imagen_url: '' },
    { categoria: 'PARA COMER', subcategoria: 'HAMBURGUESAS', nombre: 'Bluecheese', descripcion: '', precio: 0, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS SIN ALCOHOL', subcategoria: 'GASEOSAS', nombre: 'Línea Pepsi — Lata/350cc/500cc', descripcion: '', precio: 2200, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS SIN ALCOHOL', subcategoria: 'GASEOSAS', nombre: 'Línea Coca Cola — Lata/350cc/500cc', descripcion: '', precio: 2730, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS SIN ALCOHOL', subcategoria: 'ENERGIZANTES', nombre: 'Red Bull', descripcion: '', precio: 6000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS SIN ALCOHOL', subcategoria: 'ENERGIZANTES', nombre: 'Monster', descripcion: '', precio: 7500, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS SIN ALCOHOL', subcategoria: 'JUGOS', nombre: 'Limonada/Pomelada Individual', descripcion: '', precio: 3770, precio_alternativo: 'Jarra: $7.800', imagen_url: '' },
    { categoria: 'BEBIDAS CON ALCOHOL', subcategoria: 'CERVEZA', nombre: 'Quilmes Litro', descripcion: '', precio: 5500, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS CON ALCOHOL', subcategoria: 'CERVEZA', nombre: 'Stella Artois Litro', descripcion: '', precio: 7800, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS CON ALCOHOL', subcategoria: 'CERVEZA', nombre: 'Patagonia 730cc', descripcion: '', precio: 8000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS CON ALCOHOL', subcategoria: 'VINOS', nombre: 'Nave Robino', descripcion: '', precio: 16000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS CON ALCOHOL', subcategoria: 'VINOS', nombre: 'Emilia', descripcion: '', precio: 6000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS CON ALCOHOL', subcategoria: 'CHAMPAGNE', nombre: 'Nave Robino', descripcion: '', precio: 16000, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS CON ALCOHOL', subcategoria: 'PROMOS', nombre: 'Jarra de Fernet', descripcion: '', precio: 17100, precio_alternativo: '', imagen_url: '' },
    { categoria: 'BEBIDAS CON ALCOHOL', subcategoria: 'PROMOS', nombre: 'Combo Fernet + Coca Cola 1,25 lts', descripcion: '', precio: 40000, precio_alternativo: '', imagen_url: '' },
  ];
}
