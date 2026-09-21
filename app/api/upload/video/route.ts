import { put } from '@vercel/blob';
import { isAuthenticatedAsync } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!await isAuthenticatedAsync()) return Response.json({ error: 'No autorizado' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return Response.json({ error: 'Sin archivo' }, { status: 400 });

  const blob = await put(`videos/${Date.now()}-${file.name}`, file, { access: 'public' });
  return Response.json({ url: blob.url });
}
