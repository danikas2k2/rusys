# E2E test plan and status

## Goal

Playwright protects the most important user flows across the browser, Next API, and MongoDB so UI and data-flow
refactoring is safer. It does not aim to cover every line of code: details of calculations, validation, and uncommon
data operations remain in Vitest tests.

**Status:** functional Playwright tests run with `pnpm test:e2e`, visual tests with `pnpm test:visual`, and six critical
scenarios carry the `@critical` tag. CI runs the functional desktop Chromium and selected mobile Chromium and WebKit
suites, plus visual Chromium and WebKit suites. The items below distinguish tested scenarios from branches that still
need coverage.

## Test infrastructure — complete

- [x] `src/tests/fixtures/data.ts` defines typed `empty`, `basic`, `annual`, `review`, `history`, and `images`
      scenarios. Years use the app's two-digit format; the history example aligns with the September summary boundary.
- [x] `src/tests/fixtures/test.ts` resets the temporary `mongodb-memory-server` database and image directory before
      **every E2E test**. The URI, database name, and directory path are checked before cleanup; no live database is
      used.
- [x] Menu navigation and direct entry for all four pages verify content, not just the URL; an empty-database scenario
      is included. Failures retain a `trace` and screenshot.
- [x] The `images` scenario copies image files into the temporary image directory; a functional browser test verifies
      that seeded product and category images load.
- [ ] If parallel E2E execution becomes necessary, isolate the database and Next process per Playwright worker. The E2E
      `workers: 1` limit is intentional.

## Critical user flows

| Area              | Covered                                                                                                                                                                                                                                                                 | Remaining                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Categories        | Create with `Annual`/`Review`, discard a draft, rename and move related products and variants, confirm deletion, drag to reorder, and verify after reload.                                                                                                              | Change `Annual` and `Review` on an **existing** category and check the effect on lists.                        |
| Variants          | Create with an amount and label, rename and update stock, copy to another category, confirm deletion, reorder, and verify persistence after reload.                                                                                                                     | Change units and amount separately while editing a variant; check copy conflicts.                              |
| Products          | Create through “+” and open the amounts dialog, rename, move between categories, set, expand, and collapse a parent product, cancel and confirm deletion, and discard an unsaved product with `Escape`.                                                                 | Change a product parent relationship and prevent moving a product that has children.                           |
| Stock and history | Add and reduce stock, update multiple variants in one action, consume with a comment, discard, transfer a whole variant to another product or category, reclassify consumed stock as discarded, inspect history, use `Undo`/`Redo`, and check card and summary results. | Further edge cases as needed.                                                                                  |
| Years and summary | Switch annual years, mark a year for deletion and verify persistence, show consumption and discarded amounts in the summary, use summary history and filters, and verify the September boundary in consumption totals and history.                                      | Check nonannual products across years, historical years in the menu, and switching years with unsaved changes. |
| Review            | Change a product's `missing` value in a card and dialog, use the “missing only” filter, select all, and return a category to its untouched state without changing another category.                                                                                     | Apply changes to multiple categories at once and cancel the review dialog with unsaved changes.                |

The six-test critical suite covers creating a category, variant, and product; consumption with history and
`Undo`/`Redo`; the summary; and review. Run the full suite before major refactors.

## Filters and interaction

- [x] Quick search in products, categories, variants, and summary; clearing search, filtering by category, and
      preserving URL parameters when changing pages.
- [x] Dragging to reorder categories and variants, with persistence after reload.
- [x] Canceling unsaved category changes, discarding a product with `Escape`, and confirming product and deletion
      dialogs.
- [x] Theme selection persists after reload. Language switching is checked without a route refresh and after a server
      reload. Mobile interaction projects check the menu, navigation, and amounts dialog.
- [x] Automated accessibility scans cover the primary product, category, and variant pages, navigation menu, offline
      page, and selected product dialogs. These scans do not replace keyboard and assistive technology testing.
- [ ] Verify that dragging is disabled while a search filter is active.
- [ ] Check clicking outside an unsaved dialog when the amounts, product edit, and deletion dialogs are stacked.
- [ ] Add scenarios for real mobile gestures: swiping and pull to refresh, if those actions remain in the app.

## Files, imports, and errors

- [x] Upload and delete a category image; upload product and variant images; delete a variant image; reject an
      unsupported format.
- [x] Export a ZIP with `data.json`; import into a cleared **temporary** database; reject invalid ZIP files and schemas;
      cancel an import without changing data.
- [x] Upload a product image, verify its `images/` entry in the ZIP archive, and restore it from the archive after
      deleting it from the temporary file directory.
- [x] Exercise staged image uploads, cancellation, late responses, expired tokens, and replacement images.
- [x] Handle a `LoadableContent` API error and retry successfully.
- [x] Preserve the draft and leave the database unchanged after a category-edit API error; retry successfully and verify
      persistence after reload.
- [ ] Check deletion of a product image, a large image thumbnail and full preview, and removal of the physical file.
- [ ] Check oversized-file errors, upload API failure and retry, and slow-response UI behavior.
- [ ] Add a separate controlled sign-in and permissions mode with a deterministic test identity or stubbed OAuth
      responses. Authentication is bypassed in `next dev`, so current E2E tests **do not verify production sign-in**.

## Browser coverage and remaining work

- [x] Visual tests cover pages, cards, tables, menus, dialogs, photos, annual stock, and input states. The category
      transition screenshot uses explicit timing checkpoints.
- [x] `.github/workflows/ci.yml` runs functional desktop and mobile browser projects in a separate Node 26 Linux job
      (`pnpm test:e2e`) and visual tests in an `xcode-27` macOS 27 arm64 job to match the screenshot reference
      environment. References are kept for every device and both themes.
- [x] Added iPhone 17 and iPad mini WebKit visual scenarios for the main pages and dialogs.
- [ ] Extend accessibility coverage to remaining dialogs and summary flows; check keyboard and assistive technology
      interactions beyond automated scans.
- [ ] Add targeted Firefox critical scenarios if browser compatibility requires them. There is no need to duplicate the
      entire suite in every browser.

For test requirements and commands, see [SPECS.md](SPECS.md). See the [E2E reduction plan](E2E-REDUCTION.md) before
adding Playwright coverage for an open item.
