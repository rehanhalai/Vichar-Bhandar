import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // If no password is set, bypass the wall
  if (!process.env.APP_PASSWORD) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    if (authValue) {
      try {
        const [user, pwd] = atob(authValue).split(':');
        
        // We only check the password against APP_PASSWORD. The username can be anything (e.g. 'admin').
        if (pwd === process.env.APP_PASSWORD) {
          return NextResponse.next();
        }
      } catch (error) {
        // In case atob fails (invalid base64)
      }
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, for cron jobs and other services)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * Also excludes public assets matching extensions:
     * .png, .svg, .ico, .webmanifest, .json
     * And specific service worker files.
     */
    '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$|.*\\.webmanifest$|.*\\.json$|sw\\.js$|swe-worker-.*\\.js$|workbox-.*\\.js$).*)',
  ],
};
