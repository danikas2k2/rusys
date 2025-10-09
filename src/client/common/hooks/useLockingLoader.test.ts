import { renderHook, waitFor } from '@testing-library/react';

import React from 'react';

import { LoadingState, useLockingLoader } from '~/client/common/hooks/useLockingLoader';
import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

jest.mock('~/client/state/base/useUpdatingApiRequest');
jest.spyOn(React, 'useEffect');

describe('useLockingLoader', () => {
    const loader = jest.fn();
    const request = jest.fn();

    beforeEach(() => {
        jest.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('return INITIAL state while no loading started', () => {
        jest.mocked(React.useEffect).mockReturnValueOnce(undefined);
        const { result } = renderHook(() => useLockingLoader(loader));

        expect(result.current).toStrictEqual(LoadingState.INITIAL);
    });

    it('return LOADING state when loading started', async () => {
        const { result } = renderHook(() => useLockingLoader(loader));
        await waitFor(() => expect(result.current).toStrictEqual(LoadingState.LOADING));
    });

    it('return COMPLETE state when loading finished', async () => {
        loader.mockResolvedValueOnce(undefined);
        const { result } = renderHook(() => useLockingLoader(loader));
        await waitFor(() => expect(result.current).toStrictEqual(LoadingState.COMPLETE));
    });

    it('return FAILED state when loading failed', async () => {
        loader.mockRejectedValueOnce(undefined);
        const { result } = renderHook(() => useLockingLoader(loader));
        await waitFor(() => expect(result.current).toStrictEqual(LoadingState.FAILED));
    });

    it('return FAILED state when loader throws an error', async () => {
        loader.mockImplementationOnce(() => {
            throw new Error();
        });
        const { result } = renderHook(() => useLockingLoader(loader));
        await waitFor(() => expect(result.current).toStrictEqual(LoadingState.FAILED));
    });
});
