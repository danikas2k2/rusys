# RUSYS architecture and structure

This guide covers the system boundary, main technologies, source layout, and application routes.
[Project README](../README.md).

## Purpose

RUSYS manages groups, products, their variants, quantities, and change history. It also provides reviews, summaries,
user profiles, import and export, Google sign-in, and PWA support for viewing previously cached data offline.

## Technology stack

| Area                      | Technology                                    |
| ------------------------- | --------------------------------------------- |
| Web framework             | Next.js 16 App Router, React 19, TypeScript   |
| Server data in the client | TanStack Query                                |
| Local UI state            | React state and context                       |
| UI                        | Mantine, CSS                                  |
| Database                  | MongoDB and the MongoDB Node.js driver        |
| Authentication            | Google OAuth and a server-side session cookie |
| Unit and component tests  | Vitest, Testing Library, jsdom                |
| Browser tests             | Playwright, Chromium, WebKit                  |
| Static checks             | Prettier, TypeScript, ESLint, Stylelint       |
| Runtime and deployment    | pnpm, Docker, Docker Compose, Nginx           |

Dependencies and scripts are defined in [package.json](../package.json). Framework behavior is configured in
[next.config.ts](../next.config.ts), Playwright E2E tests in [playwright.config.ts](../playwright.config.ts), and Vitest
Browser Mode screenshots in [vitest.visual.config.mts](../vitest.visual.config.mts).

## System context

```mermaid
flowchart LR
    User[User] --> Browser[Browser]
    Browser -->|Pages, API, Server Actions| Next[Next.js application]
    Browser -->|Sign-in| Google[Google OAuth]
    Next -->|Token verification| Google
    Next --> Mongo[(MongoDB)]
    Next --> Images[(Image directory)]
    Browser --> Cache[(Cache Storage)]
```

MongoDB stores application data, while uploaded images are kept in a configurable directory. A production Service Worker
caches selected responses in the browser for offline viewing.

## Repository layout

```text
.
├── .github/workflows/       GitHub Actions CI
├── docker/                  Docker image, Compose, and Nginx configuration
├── docs/                    Project documentation
├── public/                  Public files, PWA icons, and manifest
├── scripts/                 Asset generation and deployment scripts
└── src/
    ├── app/                 Next.js pages, API routes, and PWA routes
    ├── common/              Shared types, API paths, and pure functions
    ├── components/          Reusable UI components
    ├── features/            Feature-specific pages, components, and hooks
    ├── lib/                 Localization and client utilities
    ├── server/              Database, authentication, data, API, and actions
    ├── store/               Query-backed selectors and local UI state
    └── tests/               Test setup and Playwright helpers
```

The `features` directory contains groups, products, variants, summaries, reviews, filters, and dialogs. `components`
holds shared UI such as tables, quantity displays, toolbars, and the application shell. Query-backed hooks in `store`
read groups, products, variants, years, and summaries. React context holds the error dialog state within the app; the
authenticated profile and Google client ID come from server-provided props. `common` is safe to import from both client
and server code; `server` contains Node.js-only code.

The public facade for product data operations is `src/server/data/products.ts`. Its implementation is split into read,
stock, image, and mutation modules.

## Module dependencies

```mermaid
flowchart TB
    App["src/app pages"] --> Shell["src/components/app"]
    Shell --> Features["src/features"]
    Features --> Components["src/components"]
    Features --> Query["TanStack Query cache and hooks"]
    Features --> Actions["src/server/actions"]
    Query --> Actions
    Routes --> Handlers["src/server/api/v1"]
    Actions --> Auth["src/server/auth"]
    Handlers --> Auth
    Actions --> Data["src/server/data"]
    Handlers --> Data
    Data --> DB["src/server/db"]
    DB --> Mongo[(MongoDB)]
    Store --> Common["src/common"]
    Handlers --> Common
    Data --> Common
```

This diagram shows typical dependency paths. Server-rendered pages load initial application data before sending the page
to the browser, then seed the Query cache. Client refresh hooks call authenticated Server Actions.

## Pages and API routes

```mermaid
flowchart TB
    Root["src/app"] --> Pages[Pages]
    Root --> API["/api/v1"]
    Root --> Other[Other routes]
    Pages --> Home["/"]
    Pages --> CatchAll["/[...path]"]
    Pages --> Offline["/offline"]
    CatchAll --> Router[AppRouter]
    Router --> Groups[Groups]
    Router --> Products[Products]
    Router --> Variants[Variants]
    Router --> Summary[Summaries]
    API --> GroupUploads[Group updates and renames with image uploads]
    API --> ProductUploads[Product and variant image uploads]
    API --> Archives[Archive import]
    API --> Identity["offline/identity"]
    Other --> ImageRoute["/images/[...path]"]
    Other --> Worker["/sw.js"]
```

`src/components/app/AppRouter.tsx` selects a client page using paths from `src/lib/links.ts`. REST route files live
under `src/app/api/v1`; shared URL builders are defined in `src/common/api/v1.ts`. The remaining REST methods support
uploads with progress and offline identity checks. Other catalog reads and changes, authentication, and archive export
use Server Actions or server-rendered data loading. Server Actions live in `src/server/actions`.
