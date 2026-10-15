import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

import { expect } from '../fixtures/test';

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

export async function expectNoA11yViolations(page: Page, include?: string): Promise<void> {
    let axe = new AxeBuilder({ page }).withTags(wcagTags);
    if (include) {
        axe = axe.include(include);
    }
    const results = await axe.analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}
