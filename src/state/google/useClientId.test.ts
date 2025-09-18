import { renderHook } from '@testing-library/react';

import { useClientId } from '~/state/google/useClientId';
import { useClientIdLoader } from '~/state/google/useClientIdLoader';
import { useGoogle } from '~/state/google/useGoogle';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));
jest.mock('~/state/google/useGoogle');
jest.mock('~/state/google/useClientIdLoader');

describe('useClientId', () => {
    const loadClientId = jest.fn();

    beforeAll(() => {
        jest.mocked(useClientIdLoader).mockReturnValue(loadClientId);
    });

    afterEach(() => jest.clearAllMocks());

    it('returns clientId when it exists and does not call loadClientId', () => {
        jest.mocked(useGoogle).mockReturnValue({ clientId: '123' });
        const { result } = renderHook(() => useClientId());

        expect(result.current).toBe('123');
        expect(loadClientId).not.toHaveBeenCalled();
    });

    it('calls loadClientId when clientId does not exist', () => {
        jest.mocked(useGoogle).mockReturnValue({ clientId: undefined });
        const { result } = renderHook(() => useClientId());

        expect(result.current).toBeUndefined();
        expect(loadClientId).toHaveBeenCalledWith();
    });
});
