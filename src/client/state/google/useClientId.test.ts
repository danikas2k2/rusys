import { renderHook } from '@testing-library/react';

import { useClientId } from '~/client/state/google/useClientId';
import { useClientIdLoader } from '~/client/state/google/useClientIdLoader';
import { useGoogle } from '~/client/state/google/useGoogle';

vi.mock('react-redux', async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));
vi.mock('~/client/state/google/useGoogle');
vi.mock('~/client/state/google/useClientIdLoader');

describe('useClientId', () => {
    const loadClientId = vi.fn();

    beforeAll(() => vi.mocked(useClientIdLoader).mockReturnValue(loadClientId));

    afterEach(() => vi.clearAllMocks());

    it('returns clientId when it exists and does not call loadClientId', () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: '123' });

        const { result } = renderHook(() => useClientId());

        expect(result.current).toBe('123');
        expect(loadClientId).not.toHaveBeenCalled();
    });

    it('calls loadClientId when clientId does not exist', () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: undefined });

        const { result } = renderHook(() => useClientId());

        expect(result.current).toBe('');
        expect(loadClientId).toHaveBeenCalledWith();
    });
});
