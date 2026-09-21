import { handleUpload } from '@vercel/blob/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/*'],
        maximumSizeInBytes: 500 * 1024 * 1024,
      }),
      onUploadCompleted: async () => { /* noop */ },
    });
    return Response.json(jsonResponse);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
