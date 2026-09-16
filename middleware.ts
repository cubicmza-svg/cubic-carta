import { NextRequest, NextResponse } from 'next/server';

const BIGBANG_HOSTS = ['bigbangpelotero.com', 'www.bigbangpelotero.com'];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') ?? '';
  const { pathname } = request.nextUrl;

  if (BIGBANG_HOSTS.includes(host) && !pathname.startsWith('/bigbang')) {
    const url = request.nextUrl.clone();
    url.pathname = '/bigbang' + pathname;
    return NextResponse.rewrite(url);
  }
}

export const config = {
  matcher: '/:path*',
};
