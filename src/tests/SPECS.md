# Test specifications

Use this guide to choose a test level and locate coverage before adding or changing tests.

## Choose the test level

- Use Vitest `*.test.ts` or `*.test.tsx` for calculations, validation, server logic, components, and other focused
  behavior. Tests run through `pnpm test`; client tests use jsdom and common and server tests use Node. Check
  `vitest.config.mts` for the directories included in each project.
- Use Playwright `*.spec.ts` for critical user flows across the browser, Next server, and database. Tag them `@critical`
  and run them with `pnpm test:e2e` or its alias `pnpm test:e2e:critical`. Run axe scans separately with
  `pnpm test:a11y`. Tests live beside their feature.
- Use Vitest Browser Mode `*.snap.tsx` for visual comparisons. Run `pnpm test:visual` to compare screenshots and
  `pnpm test:visual:update` to update references. Keep visual tests beside the component they cover.
- Use Vitest Browser Mode `*.spec.ts` in a `layout` folder next to the feature for interactive layout and geometry with
  fixture data. Tag these tests with `component` and run them with `pnpm test:layout`. Specs directly in `layout` run in
  desktop Chromium. Use `layout/mobile` for mobile Chromium and WebKit. Both use normal app CSS and stubbed server
  actions.

Both browser suites share `vitest.visual.config.mts`. Run them together with `pnpm test:browser`.

Choose meaningful assertions that exercise observable behavior and relevant error or cancel paths. Avoid tests that only
mirror implementation details. For persisted changes, verify the stored result and, when relevant, after reload. When
refactoring a module without coverage, add a successful user scenario, an important cancel or error branch, and a reload
check if stored data changes, where applicable.

For transactions, aggregation, and persisted data invariants, use the
[MongoDB integration suite](../server/actions/data-integrity.integration.test.ts). It runs as part of `pnpm test` and
`pnpm test:coverage`. To run it alone, use `pnpm test src/server/actions/data-integrity.integration.test.ts`. The suite
uses a temporary MongoDB replica set and requires a local port and access to the pinned MongoDB binary.

## Coverage by test level

| Area                               | Critical Playwright coverage                                                                                                                                                                                                                                                                                                                              | Focused Vitest coverage                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navigation and preferences         | [Navigation](../components/app/AppRouter.spec.ts) checks server-rendered data, URL filters, Back, menu dismissal, and mobile touch. [Locale](../components/runtime/LanguageToggle.spec.ts) checks switching in place, the cookie, and reload.                                                                                                             | Browser fixtures cover empty states, quick search in the three primary views, and theme restoration after remount. Component and server tests cover menu URLs and locale selection. [App states](../components/app/layout/AppContent.spec.ts), [menu](../components/toolbar/ToolbarMenu.test.tsx), [locale toggle](../components/runtime/LanguageToggle.test.tsx), [request locale](../server/requestLocale.test.ts)                                                                                                                                                                                                                                                                                                          |
| Categories, variants, and products | [Categories](../features/groups/GroupsPage.spec.ts) covers drag reorder, archive confirmation, and retry after a failed save. [Products](../features/products/ProductsPage.spec.ts) covers child creation from the grid, parent expansion, rename, move, and archive.                                                                                     | The MongoDB integration suite covers category options and rename cascades, plus variant metadata, stock reference rewrites, copying, ordering, and archival. Component tests cover form inputs, discard and confirmation, and grouped products. [Category form](../features/groups/GroupBox.test.tsx), [variant form](../features/variants/VariantBox.test.tsx), [product form](../features/products/ProductBox.test.tsx), [grid](../features/products/ProductsGrid.test.tsx), [modal dismissal](../components/common/ConfirmableModal.test.tsx)                                                                                                                                                                              |
| Stock, years, and review           | [Consumption](../features/products/AmountBox.spec.ts) verifies both histories after save, undo, redo, and reload. [Consumption periods](../features/products/ProductYearBar.spec.ts) checks history for a period without stock and cache behavior. [Review](../features/review/ReviewBox.spec.ts) checks updates to the touched category and persistence. | The MongoDB integration suite covers stock adjustments, multiple variants, transfers, reclassification, the annual removal marker, and the September boundary. Component tests cover drafts across years, variant selection and cancellation, history table semantics, missing-only filtering, and review reset and discard. [Amount controls](../features/products/AmountVariantsTab.test.tsx), [year bar](../features/products/ProductYearBar.test.tsx), [history](../features/products/AmountHistoryTab.test.tsx), [consumption history](../features/products/ConsumedHistoryTab.test.tsx), [missing-only state](../features/products/MissingOnlyEffects.test.tsx), [review dialog](../features/review/ReviewBox.test.tsx) |
| Images and archives                | [Images](../components/images/ImageDropzone.spec.ts) checks seeded image decoding, staged upload, token-only save, and cleanup when leaving the page. [Archive round trip](../features/dialogs/ImportBox.spec.ts) restores catalog data and image bytes.                                                                                                  | Component and file lifecycle tests cover upload cancellation, late responses, stale tokens, replacement, and image removal. Import component tests cover discard and errors. The MongoDB integration suite verifies that invalid archives leave the catalog intact. [Upload hook](../components/images/useStagedImage.test.tsx), [staged files](../server/data/stagedImages.test.ts), [variant image picker](../features/products/VariantImagePicker.test.tsx), [import dialog](../features/dialogs/ImportBox.test.tsx)                                                                                                                                                                                                       |
| Layout and accessibility           | `pnpm test:a11y` runs the rendered-page axe scans separately from the functional suite. The full-app mobile journey verifies touch navigation on both engines.                                                                                                                                                                                            | Browser fixtures cover independent scrolling, transition clipping, responsive cards and review columns, totals alignment, dialog width during saves, tooltip placement, and reduced motion. The mobile fixtures cover safe areas and simulated keyboard geometry. [App shell](../components/app/layout/AppShell.spec.ts), [mobile shell](../components/app/layout/mobile/AppShell.spec.ts), [products](../features/products/layout/ProductsPage.spec.ts), [amounts](../features/products/layout/AmountBox.spec.ts), [variants](../features/variants/layout/VariantsPage.spec.ts), [review](../features/review/layout/ReviewBox.spec.ts)                                                                                       |

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
Verify page content as well as navigation URLs. Failed tests retain a trace and screenshot. Authentication is bypassed
in the E2E development server. Production sign-in requires a separate controlled environment.

Playwright automatically marks its specs with `@e2e` and excludes `layout` folders before loading files. Use `@mobile`
for Playwright tests that exercise touch or mobile behavior. They run in mobile Chromium and WebKit. The other
Playwright specs run in desktop Chromium, including the axe scans.

## Visual tests

Visual tests compare the rendered result only through screenshots. Do not add separate assertions for text, focus,
attributes, CSS values, dimensions, or other implementation details. An `expect` is allowed when it is needed to wait
for the intended state before capture. Use component, browser fixture, integration, or E2E tests for behavior. Keep
tests independent of order.

Visual tests mount the client with fixture data, without MongoDB or a Next server. They run in five browser/device
projects in light and dark themes. References live under the corresponding `__screenshots__/<test>/` directory. Fixtures
emulate reduced motion and disable CSS animations and transitions before capture; a test that captures a transition must
explicitly enable and time it. Review changed images visually before accepting them.

Generate and compare references in the macOS 27 arm64 environment used by CI's `xcode-27` job, because browser images
can differ between operating systems. The CI visual jobs run Chromium and WebKit projects.
