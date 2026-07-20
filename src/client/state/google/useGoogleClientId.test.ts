import { renderHook } from '@testing-library/react';

import { useGoogle } from '~/client/state/google/useGoogle';
import { useGoogleClientId } from '~/client/state/google/useGoogleClientId';
import { useGoogleClientIdLoader } from '~/client/state/google/useGoogleClientIdLoader';

vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));
vi.mock(import('~/client/state/google/useGoogle'));
vi.mock(import('~/client/state/google/useGoogleClientIdLoader'));

describe('useGoogleClientId', () => {
    const loadClientId = vi.fn();

    beforeAll(() => {
        vi.mocked(useGoogleClientIdLoader).mockReturnValue(loadClientId);
    });

    afterEach(() => vi.clearAllMocks());

    it('returns clientId when it exists and does not call loadClientId', () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: '123' });

        const { result } = renderHook(() => useGoogleClientId());

        expect(result.current).toBe('123');
        expect(loadClientId).not.toHaveBeenCalled();
    });

    it('calls loadClientId when clientId does not exist', () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: undefined });

        const { result } = renderHook(() => useGoogleClientId());

        expect(result.current).toBe('');
        expect(loadClientId).toHaveBeenCalledWith();
    });
});
