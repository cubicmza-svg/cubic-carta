import { cookies } from 'next/headers';

export async function POST() {
  cookies().delete('cubic_admin');
  return Response.json({ ok: true });
}
