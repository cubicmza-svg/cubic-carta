import { handleUpload, type HandleUploadBody } from '@vercel/blob/next';
import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!await isAuthenticatedAsync()) throw new Error('No autorizado');
        return {
          allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/*'],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB
        };
      },
      onUploadCompleted: async () => { /* noop */ },
    });
    return NextResponse.json(jsonResponse);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
