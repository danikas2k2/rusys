import { bootstrap } from './bootstrap';

// Match index.tsx's relative module ID exactly. Vitest 5 no longer joins this
// mock with the equivalent `~/client/bootstrap` alias during module loading.
vi.mock(import('./bootstrap'), () => ({
    bootstrap: vi.fn(),
}));

describe('index', () => {
    it('calls bootstrap function', async () => {
        // Import after registering the mock so index.tsx evaluates against it.
        await import('./index');

        expect(bootstrap).toHaveBeenCalledWith();
    });
});
