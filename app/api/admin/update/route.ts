import { isAuthenticated } from '@/lib/adminAuth';

export async function POST(req: Request) {
  if (!isAuthenticated()) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    return Response.json(
      { error: 'APPS_SCRIPT_URL no configurada. Seguí los pasos del ADMIN_SETUP.md' },
      { status: 503 }
    );
  }

  const body = await req.json();

  const res = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, action: 'update' }),
  });

  if (!res.ok) {
    return Response.json({ error: 'Error al actualizar en el Sheet' }, { status: 502 });
  }

  const data = await res.json().catch(() => ({ ok: true }));
  return Response.json(data);
}
