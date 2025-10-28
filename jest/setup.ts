import '@testing-library/jest-dom';

import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'node:util';

// update JSDOM setup
if (globalThis.HTMLElement) {
    const { getComputedStyle } = globalThis;
    globalThis.getComputedStyle = (elt: any) => getComputedStyle(elt);

    globalThis.HTMLElement.prototype.scrollIntoView = () => {};

    Object.defineProperty(globalThis, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });

    Object.assign(globalThis, {
        TextEncoder: NodeTextEncoder as unknown as typeof globalThis.TextEncoder,
        TextDecoder: NodeTextDecoder as unknown as typeof globalThis.TextDecoder,
        ResizeObserver: class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    });
}

beforeEach(() =>
    jest.spyOn(console, 'error').mockImplementation((...args) => {
        throw new Error(`console.error was called ${args.join(' ')}`);
    })
);

afterEach(() => jest.restoreAllMocks());
