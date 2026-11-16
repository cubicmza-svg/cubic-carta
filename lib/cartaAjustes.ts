import type { Carta } from '@/lib/cartaTipos';

// Ajustes fijos que pidió Cubic sobre lo que la IA lee del PDF. Se aplican al servir la carta,
// así siguen valiendo cada vez que suben un PDF nuevo.

// foto de la sección (por título), en vez de la que venía
const FOTOS: [RegExp, string][] = [[/cerveza/, 'img/cervezas-stella.jpg']];

export function ajustarCarta(c: Carta): Carta {
  const secciones = c.secciones.map(s => {
    const foto = FOTOS.find(([re]) => re.test(s.t.toLowerCase()))?.[1];
    return { ...s, ...(foto ? { foto } : {}), bloques: [...s.bloques] };
  });
  // los combos (bloque "promos") y los whiskys de cervezas, vinos & más van en coctelería
  const cervezas = secciones.find(s => /cerveza/.test(s.t.toLowerCase()));
  const cocteleria = secciones.find(s => /cocteler|trago/.test(s.t.toLowerCase()));
  if (cervezas && cocteleria) for (const re of [/promo|combo/, /whisk/]) {
    const i = cervezas.bloques.findIndex(b => re.test((b.t ?? '').toLowerCase()));
    if (i >= 0) cocteleria.bloques.push(cervezas.bloques.splice(i, 1)[0]);
  }
  return { ...c, secciones };
}
