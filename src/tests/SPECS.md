# Test specifications

Read this guide when adding or changing tests. For covered and missing E2E scenarios, see [PLAN.md](PLAN.md).

## Choose the test level

- Use Vitest `*.test.ts` or `*.test.tsx` for calculations, validation, server logic, components, and other focused
  behavior. Tests run through `pnpm test`; client tests use jsdom and common and server tests use Node. Check
  `vitest.config.mts` for the directories included in each project.
- Use Playwright `*.spec.ts` for important user flows across the browser, Next server, and database. Run them with
  `pnpm test:e2e`; `pnpm test:e2e:critical` runs the `@critical` subset. Tests live beside their feature.
- Use Vitest Browser Mode `*.snap.tsx` for visual comparisons. Run `pnpm test:visual` to compare screenshots and
  `pnpm test:visual:update` to update references. Keep visual tests beside the component they cover.

Choose meaningful assertions that exercise observable behavior and relevant error or cancel paths. Avoid tests that only
mirror implementation details. For persisted changes, verify the stored result and, when relevant, after reload. When
refactoring a module without coverage, add a successful user scenario, an important cancel or error branch, and a reload
check if stored data changes, where applicable.

For transactions, aggregation, and persisted data invariants, use the
[MongoDB integration suite](../server/actions/data-integrity.integration.test.ts). It runs as part of `pnpm test` and
`pnpm test:coverage`. To run it alone, use `pnpm test src/server/actions/data-integrity.integration.test.ts`. The suite
uses a temporary MongoDB replica set and requires a local port and access to the pinned MongoDB binary.

## Queries, interactions, and fixtures

- Prefer accessible roles, labels, and visible text when selecting UI elements. Use stable `data-*` selectors when
  semantic queries cannot identify the intended element reliably; avoid selectors tied to incidental markup or styles.
- In Testing Library tests, use `screen.getBy*` for immediately available elements, `findBy*` for asynchronous
  appearance, and `queryBy*` for absence. Prefer `@testing-library/user-event` for user interactions and await them; use
  lower-level events only when necessary.
- Use Vitest APIs such as `vi.fn()` and `vi.mock()` for mocks. Keep setup explicit, isolate tests, and restore mocks,
  timers, or other shared state when needed. Follow existing fixture and cleanup patterns.
- Write clear scenario names and test possible states supported by the types. Compare only the values relevant to the
  behavior under test; avoid unnecessary exact comparisons of unrelated data.

## Functional E2E tests

Tests must be order-independent. Use the shared fixtures in `src/tests/fixtures/` and helpers in `src/tests/helpers/`.
The Playwright fixture resets a temporary MongoDB database and image directory before each test and validates their
locations before cleanup. Tests sharing this database run with one worker; do not enable parallel workers without
isolating the database and application process per worker. Server startup and cleanup live in `src/tests/playwright/`.

Use the real API for ordinary CRUD scenarios. Use Playwright routing to exercise specific errors or slow responses.
Verify page content rather than only navigation URLs. Failed tests retain a trace and screenshot. Update
[PLAN.md](PLAN.md) when adding or changing scenario coverage; mark a scenario covered only when a working browser test
exercises it. Authentication is bypassed in the E2E development server, so these tests do not verify production sign-in.

Tag a Playwright test with `@mobile` when it specifically exercises touch or mobile layout. Tagged tests run in mobile
Chromium and WebKit. Untagged tests run in desktop Chromium, including the axe scans.

## Visual tests

Visual tests compare the rendered result only through screenshots. Do not add separate assertions for text, focus,
attributes, CSS values, dimensions, or other implementation details. An `expect` is allowed when it is needed to wait
for the intended state before capture; test functional behavior in unit or E2E tests. Keep tests independent of order.

Visual tests mount the client with fixture data, without MongoDB or a Next server. They run in five browser/device
projects in light and dark themes. References live under the corresponding `__screenshots__/<test>/` directory. Fixtures
emulate reduced motion and disable CSS animations and transitions before capture; a test that captures a transition must
explicitly enable and time it. Review changed images visually before accepting them.

Generate and compare references in the macOS 27 arm64 environment used by CI's `xcode-27` job, because browser images
can differ between operating systems. The CI visual jobs run Chromium and WebKit projects.
