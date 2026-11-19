# Accessibility checks

Accessibility checks run with the regular `pnpm lint` and `pnpm test` commands. The JSX accessibility rules are errors
for application JSX. Vitest uses `expectNoA11yViolations` from `src/tests/accessibility.ts` for rendered component
states. Playwright uses the shared axe assertion in `src/tests/playwright/accessibility.ts`; each browser scan lives
beside the feature it covers. `pnpm test:a11y` runs those scans in desktop Chromium. The mobile Chromium and WebKit
projects select tests tagged `@mobile`.

`pnpm exec playwright install chromium`, then `pnpm build && pnpm exec lhci autorun` runs Lighthouse CI against the
built production app. CI enforces an accessibility score of at least 0.90 on every configured route and keeps the
HTML/JSON reports as an artifact. Playwright scans fail on any WCAG 2.0/2.1 A or AA axe violation.

When adding a route, add a Playwright axe scan to the feature's `Accessibility.spec.ts` and add the URL to
`.lighthouserc.cjs`. Use the shared `expectNoA11yViolations()` helper and cover important open menus, dialogs,
validation errors, or other distinct UI states in the feature that owns them. For reusable components, add a unit test
that renders the representative state and calls `expectNoA11yViolations()`.

Automated checks do not replace manual testing. Before release, verify:

- Keyboard only: navigate, operate, and dismiss menus and dialogs; confirm a visible focus indicator and a sensible
  focus order.
- Screen reader: inspect page and dialog names, heading structure, form labels and errors, status announcements, and
  table/navigation semantics with VoiceOver or NVDA.
- Zoom and reflow: check at 200% and 400% zoom, including narrow viewport widths, with no lost content or
  two-dimensional scrolling for ordinary content.
- Responsive navigation: operate the mobile menu and controls with keyboard and touch, and confirm focus remains visible
  and usable.
- Motion and contrast: check reduced-motion behavior and contrast in light/dark themes, including focus, disabled,
  hover, and error states.
