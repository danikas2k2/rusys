import { matcherHint, printDiffOrStringify, printReceived } from 'jest-matcher-utils';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace jest {
        // noinspection JSUnusedGlobalSymbols
        interface Matchers<R> {
            toHaveListWithTextContent(expected: string[]): R;
        }
    }
}

expect.extend({
    toHaveListWithTextContent(this: jest.MatcherUtils, elements: HTMLElement[], expected: string[]) {
        const received = elements.map((e) => e.textContent);

        if (expected.length !== received.length || expected.some((e, i) => e !== received[i])) {
            return {
                pass: false,
                message: () =>
                    `${matcherHint('.toHaveListWithTextContent', 'elements', 'expected')}\n\n` +
                    `${printDiffOrStringify(expected, received, 'Expected', 'Received', true)}`,
            };
        }

        return {
            pass: true,
            message: () =>
                `${matcherHint(`.not.toHaveListWithTextContent`, 'elements', 'expected')}\n\n` +
                `Expected elements not to have content:\n${printReceived(received)}`,
        };
    },
});
