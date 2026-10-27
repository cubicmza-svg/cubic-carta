// Formato de la carta que muestra cubicmza.netlify.app/cafeteria y /resto.
// p: precio único, o un precio por columna (cols) — null = sin precio ("consultá" / "—").
export interface CartaItem { n: string; d?: string; p: number | (number | null)[] | null }
export interface CartaBloque { t?: string; cols?: string[]; items: CartaItem[] }
export interface CartaSeccion { id: string; t: string; foto?: string; nota?: string; bloques: CartaBloque[] }
export interface Carta {
  titulo: string;
  bajada: string;
  portada: string;
  aviso?: { grande: string; texto: string; ir: string };
  secciones: CartaSeccion[];
}
export type CartaId = 'cafeteria' | 'resto';
export const CARTAS_IDS: CartaId[] = ['cafeteria', 'resto'];
export const NOMBRE_CARTA: Record<CartaId, string> = { cafeteria: 'Cafetería & brunch', resto: 'Resto & bar' };

export const contarItems = (c: Carta) => c.secciones.reduce((s, x) => s + x.bloques.reduce((t, b) => t + b.items.length, 0), 0);
