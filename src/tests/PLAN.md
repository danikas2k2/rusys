# E2E test plan and status

## Goal

Playwright protects the most important user flows across the browser, Next API, and MongoDB so UI and data-flow
refactoring is safer. It does not aim to cover every line of code: details of calculations, validation, and uncommon
data operations remain in Vitest tests.

**Status:** functional Playwright tests run with `pnpm test:e2e`, visual tests with `pnpm test:visual`, and six critical
scenarios carry the `@critical` tag. CI runs the functional Chromium suite and visual Chromium and WebKit suites. The
items below distinguish tested scenarios from branches that still need coverage.

## Test infrastructure — complete

- [x] `src/tests/fixtures/data.ts` defines typed `empty`, `basic`, `annual`, `review`, `history`, and `images`
      scenarios. Years use the app's two-digit format; the history example aligns with the September summary boundary.
- [x] `src/tests/fixtures/test.ts` resets the temporary `mongodb-memory-server` database and image directory before
      **every** test. The URI, database name, and directory path are checked before cleanup; no live database is used.
      Tests sharing the database run in one worker.
- [x] Tests use visible names, accessibility roles, and stable `data-*` selectors. Important mutations are checked
      against MongoDB records and, where applicable, after a page reload.
- [x] Menu navigation and direct entry for all four pages verify content, not just the URL; an empty-database scenario
      is included. Failures retain a `trace` and screenshot.
- [ ] Add real image files to the `images` scenario. Separate upload tests currently create images, while the scenario
      itself contains only basic data.
- [ ] If parallel execution becomes necessary, isolate the database and Next process per Playwright worker. The current
      `workers: 1` limit is intentional.

## Critical user flows

| Area              | Covered                                                                                                                                                                                                          | Remaining                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Categories        | Create with `Annual`/`Review`, discard a draft, rename and move related products and variants, confirm deletion, drag to reorder, and verify after reload.                                                       | Change `Annual` and `Review` on an **existing** category and check the effect on lists.                                                                      |
| Variants          | Create with an amount and label, rename and update stock, copy to another category, confirm deletion, reorder, and verify persistence after reload.                                                              | Change units and amount separately while editing a variant; check copy conflicts.                                                                            |
| Products          | Create through “+” and open the amounts dialog, rename, move between categories, set and expand a parent product, cancel and confirm deletion, and discard an unsaved product with `Escape`.                     | Collapse a parent product, change its parent relationship, and prevent moving a product that has children.                                                   |
| Stock and history | Add stock, consume with a comment, discard, transfer a whole variant to another product, reclassify part of consumed stock as discarded, inspect history, use `Undo`/`Redo`, and check card and summary results. | Cover simple stock reduction separately, transfer to **another category** with a copied variant, and handle multiple variant types in one action.            |
| Years and summary | Switch annual years, mark a year for deletion and verify persistence, show consumption and discarded amounts in the summary, and use summary history and filters.                                                | Check nonannual products across years, historical years in the menu, period boundaries before and after September, and switching years with unsaved changes. |
| Review            | Change a product's `missing` value in a card and dialog, use the “missing only” filter, select all, and return a category to its untouched state without changing another category.                              | Apply changes to multiple categories at once and cancel the review dialog with unsaved changes.                                                              |

The six-test critical suite covers creating a category, variant, and product; consumption with history and
`Undo`/`Redo`; the summary; and review. Run the full suite before major refactors.

## Filters and interaction

- [x] Quick search in products, categories, variants, and summary; clearing search, filtering by category, and
      preserving URL parameters when changing pages.
- [x] Dragging to reorder categories and variants, with persistence after reload.
- [x] Canceling unsaved category changes, discarding a product with `Escape`, and confirming product and deletion
      dialogs.
- [x] Theme selection persists after reload. Mobile Chromium checks the menu, navigation, and amounts dialog via
      `touch`.
- [ ] Verify that dragging is disabled while a search filter is active; collapse a parent product.
- [ ] Check clicking outside an unsaved dialog when the amounts, product edit, and deletion dialogs are stacked.
- [ ] Add scenarios for real mobile gestures: swiping and pull to refresh, if those actions remain in the app.

## Files, imports, and errors

- [x] Upload and delete a category image; upload product and variant images; delete a variant image; reject an
      unsupported format.
- [x] Export a ZIP with `data.json`; import into a cleared **temporary** database; reject invalid ZIP files and schemas;
      cancel an import without changing data.
- [x] Upload a product image, verify its `images/` entry in the ZIP archive, and restore it from the archive after
      deleting it from the temporary file directory.
- [x] Handle a `LoadableContent` API error and retry successfully.
- [x] Preserve the draft and leave the database unchanged after a category-edit API error; retry successfully and verify
      persistence after reload.
- [ ] Check deletion of a product image, a large image thumbnail and full preview, and removal of the physical file.
- [ ] Check oversized-file errors, upload API failure and retry, and slow-response UI behavior. Ordinary CRUD tests
      should keep using the real API; error scenarios should use Playwright network routing.
- [ ] Add a separate controlled sign-in and permissions mode with a deterministic test identity or stubbed OAuth
      responses. Authentication is bypassed in `next dev`, so current E2E tests **do not verify production sign-in**.

## Running tests and refactoring gates

- [x] `pnpm test:e2e:critical` provides a quick check; all `test:e2e` commands run only `*.spec.ts` files, including the
      mobile Chromium project. `test:visual` commands run only `*.snap.ts`. Tests are order-independent and do not use
      fixed `sleep` calls.
- [x] `src/**/*.snap.ts` compares screenshots of pages, cards, tables, menus, dialogs, photos, annual stock, and input
      states across all five device projects in light and dark themes. Tests live beside their components, and snapshots
      live in the corresponding `__snapshots__/<component>/` directory. `pnpm test:visual` compares images with
      snapshots; `pnpm test:visual:update` updates them. Review changed images visually before accepting them.
- [x] `.github/workflows/ci.yml` runs functional tests in a separate Node 26 Linux job (`pnpm test:e2e`) and visual
      tests in an `xcode-27` macOS 27 arm64 job to match the snapshot environment. Snapshots are kept for every device
      and both themes. CI preserves Playwright artifacts on failure.
- [x] Added iPhone 17 and iPad mini WebKit visual scenarios for the main pages and dialogs.
- [ ] Add targeted Firefox critical scenarios if browser compatibility requires them. There is no need to duplicate the
      entire suite in every browser.
- [ ] When refactoring a module without coverage, add at least one successful user scenario, an important cancel or
      error branch, and a check after reload if stored data changes.

`pnpm test:visual:update` updates the single set of snapshots. Generate and compare them in the `macOS 27` arm64
environment used by CI's `xcode-27` job; browser images can differ across operating systems.

Unit tests are `src/**/*.test.ts` or `src/**/*.test.tsx`, functional E2E tests are `src/**/*.spec.ts`, and visual tests
are `src/**/*.snap.ts`, each beside the relevant component or function. Shared initial states live in
`src/tests/fixtures/`, UI actions in `src/tests/helpers/`, and temporary server startup and cleanup in
`src/tests/playwright/`. Update this document when adding scenarios so “covered” always means a working Playwright test.
