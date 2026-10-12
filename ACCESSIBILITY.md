# Accessibility checks

Accessibility checks run with the regular `pnpm lint` and `pnpm test` commands. The JSX accessibility rules are errors
for application JSX. Vitest uses `expectNoA11yViolations` from `src/tests/accessibility.ts` for rendered component
states. Playwright runs axe against the four application routes and the offline page, plus the open navigation menu and
product creation dialog. `pnpm test:a11y` runs those browser scans by themselves.

`pnpm exec playwright install chromium`, then `pnpm build && pnpm exec lhci autorun` runs Lighthouse CI against the
built production app. CI enforces an accessibility score of at least 0.90 on every configured route and keeps the
HTML/JSON reports as an artifact. Playwright scans fail on any WCAG 2.0/2.1 A or AA axe violation.

The only current exception is **A11Y-EXC-001** at `ProductPhotoPreview.tsx`:
`jsx-a11y/no-noninteractive-element-interactions` treats the image's `onError` load-failure callback as an interaction.
It only triggers the image fallback and does not handle user input. Follow-up: recheck and remove this suppression when
`eslint-plugin-jsx-a11y` is upgraded; this entry tracks that work.

When adding a route, add it to `routes` in `src/features/common/Accessibility.spec.ts` and to the URL list in
`.lighthouserc.cjs`. Add scans for important open menus, dialogs, validation errors, or other distinct UI states to the
same Playwright suite. For reusable components, add a unit test that renders the representative state and calls
`expectNoA11yViolations()`.

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
