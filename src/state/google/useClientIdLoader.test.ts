import { act, renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { google as reducer } from '~/state/google/reducer';
import { useClientIdLoader } from '~/state/google/useClientIdLoader';
import { useGoogle } from '~/state/google/useGoogle';
import { withReduxState } from '~/tests/withReduxState';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

jest.mock('~/state/google/useGoogle');
jest.mock('~/state/base/useUpdatingApiRequest');

describe('useClientIdLoader', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        (useDispatch as unknown as jest.Mock).mockReturnValue(dispatch);
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('dispatches loading action and makes request when clientId is null and not loading', async () => {
        (useGoogle as jest.Mock).mockReturnValue({ clientId: null, loading: false });
        request.mockResolvedValue({ ok: true });

        const { result } = renderHook(() => useClientIdLoader(), withReduxState({}, { google: reducer }));
        await act(async () => await result.current());

        expect(dispatch).toHaveBeenCalledWith({ type: 'google.loading', loading: true });
        expect(request).toHaveBeenCalledWith('/clientId');
        expect(dispatch).toHaveBeenCalledWith({ type: 'google.loading', loading: false });
    });

    it('does not dispatch loading action or make request when clientId is not null', async () => {
        (useGoogle as jest.Mock).mockReturnValue({ clientId: '123', loading: false });
        request.mockResolvedValue({});

        const { result } = renderHook(() => useClientIdLoader(), withReduxState({}, { google: reducer }));
        await act(async () => await result.current());

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('does not dispatch loading action or make request when loading is true', async () => {
        (useGoogle as jest.Mock).mockReturnValue({ clientId: null, loading: true });
        request.mockResolvedValue({});

        const { result } = renderHook(() => useClientIdLoader(), withReduxState({}, { google: reducer }));
        await act(async () => await result.current());

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });
});
