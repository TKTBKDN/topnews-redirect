import { NextRequest, NextResponse } from 'next/server';
import { domain } from './domain';

// This middleware runs on Vercel Edge Network (FREE - no function duration charges)
export function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';

    // Only handle redirects for non-Facebook crawlers
    if (!userAgent.includes('facebook') && !userAgent.includes('facebookexternalhit')) {
        const url = request.nextUrl;
        const targetHostname = new URL(domain).hostname;

        // Prevent redirect loop: only redirect if we're not already on target domain
        if (url.hostname !== targetHostname) {
            const redirectUrl = `${domain}${url.pathname}${url.search}`;

            // Use 301 permanent redirect for better caching and SEO
            const response = NextResponse.redirect(redirectUrl, 301);

            // Add cache headers to reduce repeated requests
            response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');

            return response;
        }
    }

    // Let Facebook crawlers continue to the page (to get metadata)
    return NextResponse.next();
}

// Configure which routes should run through middleware
export const config = {
    matcher: [
        // Only match routes that need redirect logic
        '/',
        '/p-:path*',
        // Exclude all static files, Next.js internals, and API routes
        '/((?!_next/static|_next/image|_next/data|api|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)',
    ],
};
