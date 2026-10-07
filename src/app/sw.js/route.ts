import { installServiceWorker } from '~/components/app/ServiceWorker/Worker';

export const dynamic = 'force-static';

export function GET(): Response {
    return new Response(`(${installServiceWorker.toString()})();`, {
        headers: {
            'Content-Type': 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    });
}
