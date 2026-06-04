import { createHash } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'cubic_admin';

export function makeToken(password: string): string {
  return createHash('sha256').update(password + 'cubic_salt').digest('hex');
}

export function isAuthenticated(): boolean {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) return false;
    const expected = makeToken(process.env.ADMIN_PASSWORD ?? '');
    return token === expected;
  } catch {
    return false;
  }
}
