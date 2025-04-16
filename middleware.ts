import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/page/dashboard') || 
      request.nextUrl.pathname.startsWith('/admin')) {
    
    const sessionToken = request.cookies.get('sessionToken')?.value;
    const userId = request.cookies.get('userId')?.value;
    
    if (!sessionToken || !userId) {
      const returnUrl = encodeURIComponent(request.nextUrl.pathname);
      return NextResponse.redirect(new URL(`/page/home/?loginModal=true&returnUrl=${returnUrl}`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/page/dashboard/:path*', '/admin/:path*'],
};
