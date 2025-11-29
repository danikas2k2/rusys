import { expect } from 'vitest';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Vi {
        // noinspection JSUnusedGlobalSymbols
        interface Assertion {
            toBeFalse(): void;
            toBeTrue(): void;
            toHaveListWithTextContent(expected: string[]): void;

            toBeExpanded(): void;

            toBeCollapsed(): void;

            toBeSelected(): void;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toIncludeSameMembers(expected: any[]): void;
        }

        interface AsymmetricMatchersContaining {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event(type: Event['type'], props?: object): any;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type
            element<P = object>(type: Function, props?: Partial<P>): any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            element<P = object>(type: string, props?: Partial<P>): any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            element<P = object>(props: Partial<P>): any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            element(): any;
        }
    }
}

expect.extend({
    toBeFalse(received: boolean) {
        const pass = received === false;
        return {
            pass,
            message: () => `expected ${received} to be false`,
        };
    },
    toBeTrue(received: boolean) {
        const pass = received === true;
        return {
            pass,
            message: () => `expected ${received} to be true`,
        };
    },
    // TODO add html element check
    toHaveListWithTextContent(elements: HTMLElement[], expected: string[]) {
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

    // TODO add html element check
    // TODO add role check for aria-expanded
    toBeExpanded(element: HTMLElement) {
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

    // TODO add html element check
    // TODO add role check for aria-expanded
    toBeCollapsed(element: HTMLElement) {
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

    // TODO add html element check
    // TODO add role check for aria-selected
    toBeSelected(element: HTMLElement) {
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

    // Matcher from jest-extended: checks if arrays contain the same members (order doesn't matter)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toIncludeSameMembers(received: any[], expected: any[]) {
        if (!Array.isArray(received)) {
            return {
                pass: false,
                message: () => `expected ${this.utils.printReceived(received)} to be an array`,
            };
        }

        if (!Array.isArray(expected)) {
            return {
                pass: false,
                message: () => `expected ${this.utils.printExpected(expected)} to be an array`,
            };
        }

        // Convert to sets to compare members regardless of order
        const receivedSet = new Set(received);
        const expectedSet = new Set(expected);

        const pass = receivedSet.size === expectedSet.size && [...expectedSet].every((item) => receivedSet.has(item));

        return {
            pass,
            message: () =>
                [
                    this.utils.matcherHint(`${this.isNot ? '.not' : ''}.toIncludeSameMembers`, 'received', 'expected'),
                    '',
                    ...(this.isNot
                        ? [`Expected arrays not to include the same members:`, `${this.utils.printReceived(received)}`]
                        : [
                              `Expected: ${this.utils.printExpected(expected)}`,
                              `Received: ${this.utils.printReceived(received)}`,
                          ]),
                ].join('\n'),
        };
    },
});

Object.defineProperties(expect, {
    event: {
        writable: true,
        value: (type: Event['type'], props?: object) => expect.objectContaining({ type, ...props }),
    },
    element: {
        writable: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        value: (type?: string | Function | object, props?: object) => {
            const element = {
                $$typeof: expect.any(Symbol),
            };

            switch (typeof type) {
                case 'undefined':
                    return expect.objectContaining(element);

                case 'function':
                case 'string':
                    const typedElement = {
                        ...element,
                        type,
                    };
                    return props
                        ? expect.objectContaining({
                              ...typedElement,
                              props: expect.objectContaining({ ...props }),
                          })
                        : expect.objectContaining(typedElement);

                default:
                    return expect.objectContaining({ ...element, props: expect.objectContaining({ ...type }) });
            }
        },
    },
});
