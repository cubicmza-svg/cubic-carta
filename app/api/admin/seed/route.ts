import { isAuthenticated } from '@/lib/adminAuth';
import { seedItems } from '@/lib/kv';

// POST — carga los datos iniciales de la carta en KV (operación destructiva)
export async function POST() {
  if (!isAuthenticated()) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const count = await seedItems();
    return Response.json({ ok: true, count });
  } catch (err) {
    console.error(err);
    const msg = err instanceof Error ? err.message : 'Error al cargar datos';
    return Response.json({ error: msg }, { status: 500 });
  }
}
