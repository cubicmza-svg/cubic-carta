import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) return Response.json({ error: 'No se recibió archivo' }, { status: 400 });
    if (!ALLOWED_TYPES.includes(file.type))
      return Response.json({ error: 'Formato no permitido. Usá JPG, PNG o WebP' }, { status: 400 });
    if (file.size > MAX_BYTES)
      return Response.json({ error: 'La imagen no puede superar 5 MB' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: 'cubic-menu', resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
          (error, res) => (error ? reject(error) : resolve(res!))
        )
        .end(buffer);
    });

    return Response.json({ url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    console.error(err);
    return Response.json({ error: 'Error al subir imagen' }, { status: 500 });
  }
}
