import { isAuthenticated } from '@/lib/adminAuth';
import { seedDatabase } from '@/lib/db';
import { SEED_ITEMS } from '@/lib/seedData';

// POST — crea la tabla (si no existe) y carga los 140 ítems iniciales
// ⚠ Operación destructiva: trunca y re-inserta
export async function POST() {
  if (!isAuthenticated()) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const count = await seedDatabase(SEED_ITEMS);
    return Response.json({ ok: true, count });
  } catch (err) {
    console.error('[seed]', err);
    const msg = err instanceof Error ? err.message : 'Error al cargar datos';
    return Response.json({ error: msg }, { status: 500 });
  }
}
