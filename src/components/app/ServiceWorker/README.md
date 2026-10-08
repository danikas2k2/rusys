# Service worker

`Registration.tsx` registers the service worker in production. The Next.js `/sw.js` route serves JavaScript generated
from the function in `Worker.ts`.

On installation, the worker caches `/offline`, the manifest, the logo, and the PWA icons. It caches public `/assets/`
and `/_next/static/` files when they are first requested and serves these assets from the cache first. On activation, it
removes older `rusys-public-*` caches.

For application pages, RSC requests, GET API responses, and uploaded images, the worker tries the network first and
falls back to the current user's cache. The user is checked against `/api/v1/offline/identity` before a response is
stored. Cached data is separated by user and deleted on sign-out or when the active account changes. If a page has not
been cached, navigation falls back to `/offline`.

Private responses are stored in the browser's Cache Storage without application-level encryption. They remain available
in that browser profile until sign-out, an account change, or browser storage cleanup.

Offline viewing is supported for previously cached responses. Changes still use Next.js Server Actions, so offline
editing and later synchronization are not implemented yet.
