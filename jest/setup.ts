import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'node:util';

Object.assign(globalThis, {
    TextEncoder: NodeTextEncoder as unknown as typeof globalThis.TextEncoder,
    TextDecoder: NodeTextDecoder as unknown as typeof globalThis.TextDecoder,
});

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((...args) => {
        throw new Error(`console.error was called ${args.join(' ')}`);
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});
