import { act, renderHook } from '@testing-library/react';
import { MockRedux } from '@tests/MockRedux';

import React from 'react';
import { useDispatch } from 'react-redux';

import { type Reducer } from 'redux';

import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';
import { google as reducer } from '~/client/state/google/reducer';
import { useClientIdLoader } from '~/client/state/google/useClientIdLoader';
import { useGoogle } from '~/client/state/google/useGoogle';

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: jest.fn(),
}));

jest.mock('~/client/state/google/useGoogle');
jest.mock('~/client/state/base/useUpdatingApiRequest');

describe('useClientIdLoader', () => {
    const dispatch = jest.fn();
    const request = jest.fn();

    beforeAll(() => {
        jest.mocked(useDispatch).mockReturnValue(dispatch);
        jest.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('dispatches loading action and makes request when clientId is null and not loading', async () => {
        jest.mocked(useGoogle).mockReturnValue({ clientId: undefined, loading: false });
        request.mockResolvedValue({ ok: true });

        const { result } = renderHook(() => useClientIdLoader(), {
            wrapper: ({ children }) => <MockRedux reducers={{ google: reducer as Reducer }}>{children}</MockRedux>,
        });
        await act(async () => await result.current());

        expect(dispatch).toHaveBeenCalledWith({ type: 'google.loading', loading: true });
        expect(request).toHaveBeenCalledWith('/clientId');
        expect(dispatch).toHaveBeenCalledWith({ type: 'google.loading', loading: false });
    });

    it('does not dispatch loading action or make request when clientId is not null', async () => {
        jest.mocked(useGoogle).mockReturnValue({ clientId: '123', loading: false });
        request.mockResolvedValue({});

        const { result } = renderHook(() => useClientIdLoader(), {
            wrapper: ({ children }) => <MockRedux reducers={{ google: reducer as Reducer }}>{children}</MockRedux>,
        });
        await act(async () => await result.current());

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });

    it('does not dispatch loading action or make request when loading is true', async () => {
        jest.mocked(useGoogle).mockReturnValue({ clientId: undefined, loading: true });
        request.mockResolvedValue({});

        const { result } = renderHook(() => useClientIdLoader(), {
            wrapper: ({ children }) => <MockRedux reducers={{ google: reducer as Reducer }}>{children}</MockRedux>,
        });
        await act(async () => await result.current());

        expect(dispatch).not.toHaveBeenCalled();
        expect(request).not.toHaveBeenCalled();
    });
});
