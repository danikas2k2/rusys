import { bootstrap } from '~/client/bootstrap';
// Import index module to execute its top-level code (calls bootstrap())
import '~/client/index';

vi.mock(import('~/client/bootstrap'), () => ({
    bootstrap: vi.fn(),
}));

describe('index', () => {
    it('calls bootstrap function', () => {
        expect(bootstrap).toHaveBeenCalledWith();
    });
});
