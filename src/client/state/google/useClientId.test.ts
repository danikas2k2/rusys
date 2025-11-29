import { renderHook } from '@testing-library/react';

import { useClientId } from '~/client/state/google/useClientId';
import { useClientIdLoader } from '~/client/state/google/useClientIdLoader';
import { useGoogle } from '~/client/state/google/useGoogle';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));
jest.mock('~/client/state/google/useGoogle');
jest.mock('~/client/state/google/useClientIdLoader');

describe('useClientId', () => {
    const loadClientId = jest.fn();

    beforeAll(() => jest.mocked(useClientIdLoader).mockReturnValue(loadClientId));

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

        expect(result.current).toBeEmpty();
        expect(loadClientId).toHaveBeenCalledWith();
    });
});
