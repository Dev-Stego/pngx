import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isAuthenticated = request.cookies.has('pngx-auth-token')

    // Protect /app routes
    if (pathname.startsWith('/app')) {
        if (!isAuthenticated) {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            // Add ?from=... for redirection after login if needed
            // url.searchParams.set('from', pathname)
            return NextResponse.redirect(url)
        }
    }

    // Optional: Redirect / to /app if already logged in
    if (pathname === '/' && isAuthenticated) {
        // We might want to allow visiting landing page even if logged in, 
        // but usually we redirect to dashboard. 
        // For now, let's NOT force redirect to /app from home to allow viewing marketing pages.
        // Uncomment below to enable auto-redirect:
        // const url = request.nextUrl.clone()
        // url.pathname = '/app'
        // return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
