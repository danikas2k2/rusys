import { NextResponse, type NextRequest } from 'next/server';

import { acceptLanguageForLocale, LOCALE_COOKIE, savedLocale } from '~/lib/locale';

export function proxy(request: NextRequest): NextResponse {
    const locale = savedLocale(request.cookies.get(LOCALE_COOKIE)?.value);
    if (!locale) {
        return NextResponse.next();
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('accept-language', acceptLanguageForLocale(locale));
    return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
    matcher: '/((?!_next/static|_next/image|assets/|manifest.json|sw.js|favicon.ico).*)',
};
