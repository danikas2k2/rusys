import { expect } from 'vitest';

import axe from 'axe-core';

/** Run the shared WCAG axe rules against a rendered component or interaction state. */
export async function expectNoA11yViolations(container: Element = document.body): Promise<void> {
    const { violations } = await axe.run(container, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
    const report = violations
        .map(
            ({ id, impact, help, nodes }) =>
                `${impact ?? 'unknown'} ${id}: ${help}\n${nodes.map(({ target }) => `  ${target.join(', ')}`).join('\n')}`
        )
        .join('\n');
    expect(violations, report).toEqual([]);
}
