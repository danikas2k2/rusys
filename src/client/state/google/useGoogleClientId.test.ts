import { renderHook } from '@testing-library/react';

import { useGoogle } from '~/client/state/google/useGoogle';
import { useGoogleClientId } from '~/client/state/google/useGoogleClientId';
import { useGoogleClientIdLoader } from '~/client/state/google/useGoogleClientIdLoader';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));
jest.mock('~/client/state/google/useGoogle');
jest.mock('~/client/state/google/useGoogleClientIdLoader');

describe('useGoogleClientId', () => {
    const loadClientId = jest.fn();

    beforeAll(() => jest.mocked(useGoogleClientIdLoader).mockReturnValue(loadClientId));

    afterEach(() => jest.clearAllMocks());

    it('returns clientId when it exists and does not call loadClientId', () => {
        jest.mocked(useGoogle).mockReturnValue({ clientId: '123' });

        const { result } = renderHook(() => useGoogleClientId());

        expect(result.current).toBe('123');
        expect(loadClientId).not.toHaveBeenCalled();
    });

    it('calls loadClientId when clientId does not exist', () => {
        jest.mocked(useGoogle).mockReturnValue({ clientId: undefined });

        const { result } = renderHook(() => useGoogleClientId());

        expect(result.current).toBeEmpty();
        expect(loadClientId).toHaveBeenCalledWith();
    });
});
