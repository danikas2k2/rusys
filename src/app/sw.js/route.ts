import { installServiceWorker } from '~/components/app/ServiceWorker/Worker';

export const dynamic = 'force-static';

export function GET(): Response {
    return new Response(
        `(${installServiceWorker.toString()})(${JSON.stringify(process.env.NEXT_PUBLIC_APP_VERSION)});`,
        {
            headers: {
                'Content-Type': 'application/javascript; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        }
    );
}
