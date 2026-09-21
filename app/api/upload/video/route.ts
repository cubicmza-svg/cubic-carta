import { put } from '@vercel/blob';

// Edge runtime: no 4.5 MB body limit
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return Response.json({ error: 'Sin archivo' }, { status: 400 });

    const blob = await put(`videos/${Date.now()}-${file.name}`, file, { access: 'public' });
    return Response.json({ url: blob.url });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
