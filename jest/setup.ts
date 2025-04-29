import { TextEncoder } from 'util';

global.TextEncoder = TextEncoder;

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((...args) => {
        throw new Error(`console.error was called ${args.join(' ')}`);
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});
