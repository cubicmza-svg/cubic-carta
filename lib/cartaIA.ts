import Anthropic from '@anthropic-ai/sdk';
import type { Carta, CartaId, CartaSeccion } from './cartaTipos';
import { NOMBRE_CARTA } from './cartaTipos';

// Lee el PDF de la carta que sube Cubic y lo pasa al formato de la carta online.
// Claude devuelve JSON con un esquema fijo (structured outputs); acá se le agregan fotos y se compara con la versión anterior.

// Esquema que devuelve Claude: sin nulls ni uniones para que sea simple. Precio 0 = sin precio.
const ESQUEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['secciones'],
  properties: {
    secciones: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 't', 'nota', 'bloques'],
        properties: {
          id: { type: 'string' },
          t: { type: 'string' },
          nota: { type: 'string' },
          bloques: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['t', 'cols', 'items'],
              properties: {
                t: { type: 'string' },
                cols: { type: 'array', items: { type: 'string' } },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['n', 'd', 'p'],
                    properties: {
                      n: { type: 'string' },
                      d: { type: 'string' },
                      p: { type: 'array', items: { type: 'integer' } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

interface SalidaIA {
  secciones: { id: string; t: string; nota: string; bloques: { t: string; cols: string[]; items: { n: string; d: string; p: number[] }[] }[] }[];
}

const SISTEMA = `Pasás cartas de bar/restaurante (PDF) a datos para la carta online de Cubic Café & Bar (Mendoza, Argentina).

Reglas:
- Copiá TODOS los productos y precios del PDF, sin inventar ni omitir nada. Los precios van en pesos como número entero sin puntos ni signo ($ 15.700 → 15700).
- Cuando varios productos comparten un precio (agrupados con una llave, un recuadro o una sola celda de precio), repetí ese precio en cada producto.
- Tablas con varias columnas de precio (chico/mediano/grande/XXL, 6/8/12 porciones, individual/para compartir, 2/4 personas, chicas/grandes, 2 unidades/½ docena/docena): poné los nombres de las columnas en "cols" (minúscula, cortos) y en "p" un precio por columna en el mismo orden; 0 donde esa columna no tiene precio. Si el bloque no tiene columnas, "cols" va vacío y "p" lleva un solo precio.
- Producto sin precio en el PDF: "p": [0].
- Respetá la forma de la versión actual que te paso: mismos "id" de sección cuando la sección es la misma, títulos de sección en minúscula ("brunch", "para acompañar · dulce"), nombres de producto con mayúscula inicial ("Tostón de campo"), marcas como se escriben ("Coca-Cola", "Aperol", "Jäger"), descripciones en minúscula y breves. Corregí errores de tipeo obvios (Capresse → Caprese, Daikiri → Daiquiri) pero no cambies nombres de marcas que no conocés.
- Secciones nuevas: "id" corto en minúscula sin tildes ni espacios (ej. "postres").
- "t" del bloque: subtítulo dentro de la sección o "" si no hay. "d": descripción o "" si no hay. "nota": aclaración general de la sección (ej. "todos nuestros brunch vienen con infusión grande y jugo chico", "2x1 en tragos tradicionales de 19 a 23 hs") o "".
- Ignorá el logo, el nombre del local y adornos.`;

function convertir(salida: SalidaIA): CartaSeccion[] {
  return salida.secciones.map(s => ({
    id: s.id.trim().toLowerCase(),
    t: s.t.trim(),
    ...(s.nota.trim() ? { nota: s.nota.trim() } : {}),
    bloques: s.bloques.map(b => ({
      ...(b.t.trim() ? { t: b.t.trim() } : {}),
      ...(b.cols.length ? { cols: b.cols } : {}),
      items: b.items.map(it => ({
        n: it.n.trim(),
        ...(it.d.trim() ? { d: it.d.trim() } : {}),
        p: b.cols.length
          ? b.cols.map((_, i) => (it.p[i] ? it.p[i] : null))
          : (it.p[0] ? it.p[0] : null),
      })),
    })),
  }));
}

// fotos de cubicmza.netlify.app/img para secciones nuevas, por palabra clave
const FOTOS: [RegExp, string][] = [
  [/brunch|desayuno/, 'img/toston-campo.jpg'], [/caf[eé]|infusi/, 'img/guia-capuccino.jpg'],
  [/dulce|torta|postre/, 'img/tarta-frutilla.jpg'], [/salad|panini|tostad/, 'img/focaccia-tomates.jpg'],
  [/tacc|gluten/, 'img/cafe-budin.jpg'], [/bebida|jugo|licuad|sin alcohol/, 'img/limonada.jpg'],
  [/entrada|papa/, 'img/papas-cheddar.jpg'], [/picada/, 'img/picada.jpg'], [/s[aá]ndwich|lomo|plato/, 'img/lomo-focaccia.jpg'],
  [/hamburg|burger/, 'img/burger-palta-tabla.jpg'], [/pizza/, 'img/pizza-especial.jpg'], [/promo/, 'img/amigas-mesa.jpg'],
  [/c[oó]ctel|trago/, 'img/barra-aperol.jpg'], [/cerveza|vino|alcohol|whisky/, 'img/fernet-papas.jpg'], [/ensalad/, 'img/ensalada-pollo.jpg'],
];

export async function leerCartaPdf(carta: CartaId, pdfBase64: string, actual: Carta): Promise<Carta> {
  const client = new Anthropic();
  const actualSimple = JSON.stringify({ secciones: actual.secciones.map(({ foto, ...s }) => s) });
  const stream = client.beta.messages.stream({
    model: 'claude-opus-5-5',
    max_tokens: 64000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'medium', format: { type: 'json_schema', schema: ESQUEMA } },
    system: SISTEMA,
    messages: [{
      role: 'user',
      content: [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
        { type: 'text', text: `Esta es la carta nueva de "${NOMBRE_CARTA[carta]}". Pasala al formato.\n\nVersión actual (de referencia para ids, nombres y estilo; los productos y precios salen SOLO del PDF):\n${actualSimple}` },
      ],
    }],
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'refusal') throw new Error('La IA no pudo leer este archivo.');
  if (msg.stop_reason === 'max_tokens') throw new Error('La carta es demasiado larga para leerla de una vez.');
  const texto = msg.content.map(b => (b.type === 'text' ? b.text : '')).join('');
  let salida: SalidaIA;
  try { salida = JSON.parse(texto); } catch { throw new Error('La IA devolvió algo que no se pudo leer, probá de nuevo.'); }
  if (!salida.secciones?.length) throw new Error('No encontré productos en ese PDF. ¿Es la carta?');

  const fotoAnterior = new Map(actual.secciones.map(s => [s.id, s.foto]));
  const secciones = convertir(salida).map(s => ({
    ...s,
    foto: fotoAnterior.get(s.id) ?? FOTOS.find(([re]) => re.test(s.t.toLowerCase()))?.[1] ?? actual.portada,
  }));
  return { ...actual, secciones };
}

// Qué cambió entre dos versiones: precios distintos, productos nuevos y productos que ya no están
export function compararCartas(antes: Carta, despues: Carta) {
  const precios = (c: Carta) => {
    const m = new Map<string, { n: string; sec: string; p: string }>();
    for (const s of c.secciones) for (const b of s.bloques) for (const it of b.items) {
      const ps = Array.isArray(it.p) ? it.p : [it.p];
      const etiqueta = (i: number) => (b.cols?.[i] ? ` (${b.cols[i]})` : '');
      ps.forEach((p, i) => m.set(`${s.id}|${it.n.toLowerCase()}|${i}`, { n: it.n + etiqueta(i), sec: s.t, p: p == null ? '' : String(p) }));
    }
    return m;
  };
  const a = precios(antes), d = precios(despues);
  const cambios: { n: string; sec: string; antes: number | null; ahora: number | null }[] = [];
  const nuevos: string[] = [], quitados: string[] = [];
  for (const [k, v] of d) {
    const viejo = a.get(k);
    if (!viejo) { if (k.endsWith('|0')) nuevos.push(v.n.replace(/ \(.*\)$/, '')); }
    else if (viejo.p !== v.p) cambios.push({ n: v.n, sec: v.sec, antes: viejo.p ? +viejo.p : null, ahora: v.p ? +v.p : null });
  }
  for (const [k, v] of a) if (!d.has(k) && k.endsWith('|0')) quitados.push(v.n.replace(/ \(.*\)$/, ''));
  return { cambios, nuevos, quitados };
}
