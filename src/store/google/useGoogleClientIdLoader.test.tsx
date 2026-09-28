import { act, renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';
import { useDispatch } from 'react-redux';
import type { Reducer } from 'redux';

import { useUpdatingApiRequest } from '~/store/base/useUpdatingApiRequest';
import { google as reducer } from '~/store/google/reducer';
import { useGoogle } from '~/store/google/useGoogle';
import { useGoogleClientIdLoader } from '~/store/google/useGoogleClientIdLoader';

vi.mock(import('react-redux'), async () => ({
    ...(await vi.importActual('react-redux')),
    useDispatch: vi.fn(),
}));

vi.mock(import('~/store/google/useGoogle'));
vi.mock(import('~/store/base/useUpdatingApiRequest'));

describe('useGoogleClientIdLoader', () => {
    const dispatch = vi.fn();
    const request = vi.fn();

    beforeAll(() => {
        vi.mocked(useDispatch).mockReturnValue(dispatch);
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('dispatches loading action and makes request when clientId is null and not loading', async () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: undefined, loading: false });
        request.mockResolvedValue({ ok: true });

        const { result } = renderHook(() => useGoogleClientIdLoader(), {
            wrapper: ({ children }) => <MockRedux reducers={{ google: reducer as Reducer }}>{children}</MockRedux>,
        });
        await act(async () => await result.current());

        expect(dispatch).toHaveBeenCalledWith({ type: 'google.loading', loading: true });
        expect(request).toHaveBeenCalledWith('/api/v1/auth/client-id', 'GET');
        expect(dispatch).toHaveBeenCalledWith({ type: 'google.loading', loading: false });
    });

    it('does not dispatch loading action or make request when clientId is not null', async () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: '123', loading: false });
        request.mockResolvedValue({});

        const { result } = renderHook(() => useGoogleClientIdLoader(), {
            wrapper: ({ children }) => <MockRedux reducers={{ google: reducer as Reducer }}>{children}</MockRedux>,
        });
        await act(async () => await result.current());

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('does not dispatch loading action or make request when loading is true', async () => {
        vi.mocked(useGoogle).mockReturnValue({ clientId: undefined, loading: true });
        request.mockResolvedValue({});

        const { result } = renderHook(() => useGoogleClientIdLoader(), {
            wrapper: ({ children }) => <MockRedux reducers={{ google: reducer as Reducer }}>{children}</MockRedux>,
        });
        await act(async () => await result.current());

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });
});
