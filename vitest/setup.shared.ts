import '@testing-library/jest-dom';
import { expect } from 'vitest';

import type { MatcherState } from '@vitest/expect';

// ---------------------------------------------------------------------------
// Custom project matchers (migrated from jest/expect.ts)
// ---------------------------------------------------------------------------

// Augment Vitest's expect interface with custom matchers
declare module 'vitest' {
    interface Matchers {
        toHaveListWithTextContent: (expected: string[]) => void;
        toBeExpanded: () => void;
        toBeCollapsed: () => void;
        toBeSelected: () => void;
    }
}

expect.extend({
    toHaveListWithTextContent(this: MatcherState, elements: HTMLElement[], expected: string[]) {
        const received = elements.map((e) => e.textContent);
        const pass = expected.length === received.length && expected.every((e, i) => e === received[i]);
        return {
            pass,
            message: () =>
                [
                    `${this.utils.matcherHint(`${this.isNot ? '.not' : ''}.toHaveListWithTextContent`, 'elements', 'expected')}`,
                    '',
                    ...(this.isNot
                        ? [`Expected elements not to have content:`, `${this.utils.printReceived(received)}`]
                        : [`${this.utils.printDiffOrStringify(expected, received, 'Expected', 'Received', true)}`]),
                ].join('\n'),
        };
    },

    toBeExpanded(this: MatcherState, element: HTMLElement) {
        const isExpanded = element.getAttribute('aria-expanded') === 'true';
        return {
            pass: isExpanded,
            message: () =>
                [
                    this.utils.matcherHint(`${this.isNot ? '.not' : ''}.toBeExpanded`, 'element', ''),
                    '',
                    `Received element ${isExpanded ? 'is' : 'is not'} expanded:`,
                    `  ${this.utils.printReceived(element.cloneNode(false))}`,
                ].join('\n'),
        };
    },

    toBeCollapsed(this: MatcherState, element: HTMLElement) {
        const isCollapsed = element.getAttribute('aria-expanded') !== 'true';
        return {
            pass: isCollapsed,
            message: () =>
                [
                    this.utils.matcherHint(`${this.isNot ? '.not' : ''}.toBeCollapsed`, 'element', ''),
                    '',
                    `Received element ${isCollapsed ? 'is' : 'is not'} collapsed:`,
                    `  ${this.utils.printReceived(element.cloneNode(false))}`,
                ].join('\n'),
        };
    },

    toBeSelected(this: MatcherState, element: HTMLElement) {
        const isSelected = element.getAttribute('aria-selected') === 'true';
        return {
            pass: isSelected,
            message: () =>
                [
                    this.utils.matcherHint(`${this.isNot ? '.not' : ''}.toBeSelected`, 'element', ''),
                    '',
                    `Received element ${isSelected ? 'is' : 'is not'} selected:`,
                    `  ${this.utils.printReceived(element.cloneNode(false))}`,
                ].join('\n'),
        };
    },
});
