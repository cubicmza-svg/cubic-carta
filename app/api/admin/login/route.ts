import { cookies } from 'next/headers';
import { makeToken } from '@/lib/adminAuth';

export async function POST(req: Request) {
  const { password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  cookies().set('cubic_admin', makeToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60, // 8 horas
    sameSite: 'strict',
    path: '/',
  });

  return Response.json({ ok: true });
}
