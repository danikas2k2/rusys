# Service worker

`Registration.tsx` registers the service worker in production. The Next.js `/sw.js` route serves JavaScript generated
from the function in `Worker.ts`.

On installation, the worker caches `/offline`, the manifest, the logo, and the PWA icons. It caches public `/assets/`
and `/_next/static/` files when they are first requested and serves these assets from the cache first. Each app version
uses a new public cache; builds with the same version must have compatible assets. Older public caches are retained so
previously saved pages can still load their version-specific Next.js chunks offline; other public assets are read only
from the current build's cache. Browser storage eviction can remove cached data, and retained caches consume storage
until the browser clears them.

For application pages, RSC requests, GET API responses, and uploaded images, the worker tries the network first and
falls back to the current user's cache. The user is checked against `/api/v1/offline/identity` before a response is
stored. Cached data is separated by user and deleted on sign-out or when the active account changes. If a page has not
been cached, navigation falls back to `/offline`.

Private responses are stored in the browser's Cache Storage without application-level encryption. They remain available
in that browser profile until sign-out, an account change, or browser storage cleanup.

Offline viewing is supported for previously cached responses. Changes still use Next.js Server Actions, so offline
editing and later synchronization are not implemented yet.
