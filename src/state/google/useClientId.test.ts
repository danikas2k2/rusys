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
        (useClientIdLoader as jest.Mock).mockReturnValue(loadClientId);
    });

    afterEach(() => jest.clearAllMocks());

    it('returns clientId when it exists and does not call loadClientId', () => {
        (useGoogle as jest.Mock).mockReturnValue({ clientId: '123' });
        const { result } = renderHook(() => useClientId());
        expect(result.current).toEqual('123');
        expect(loadClientId).not.toHaveBeenCalled();
    });

    it('calls loadClientId when clientId does not exist', () => {
        (useGoogle as jest.Mock).mockReturnValue({ clientId: null });
        const { result } = renderHook(() => useClientId());
        expect(result.current).toEqual(null);
        expect(loadClientId).toHaveBeenCalled();
    });
});
