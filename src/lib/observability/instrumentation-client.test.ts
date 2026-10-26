const mocks = vi.hoisted(() => ({ start: vi.fn() }));

vi.mock(import('./faro'), () => ({ startObservability: mocks.start }));

describe('client instrumentation entrypoint', () => {
    it('starts frontend observability when the Next.js client instrumentation entrypoint loads', async () => {
        await import('../../instrumentation-client');

        expect(mocks.start).toHaveBeenCalledExactlyOnceWith();
    });
});
