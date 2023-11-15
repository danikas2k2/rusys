import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { LoadingState, useLockingLoader } from '~/hooks/useLockingLoader';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';

jest.mock('~/state/base/useUpdatingApiRequest');
jest.spyOn(React, 'useEffect');

describe('useLockingLoader', () => {
    const loader = jest.fn();
    const request = jest.fn();

    beforeEach(() => {
        (useUpdatingApiRequest as jest.Mock).mockReturnValue(request);
    });

    afterEach(() => jest.clearAllMocks());

    it('return INITIAL state while no loading started', () => {
        // eslint-disable-next-line import/no-named-as-default-member
        (React.useEffect as jest.Mock).mockReturnValueOnce(undefined);
        const { result } = renderHook(() => useLockingLoader(loader));
        expect(result.current).toEqual(LoadingState.INITIAL);
    });

    it('return LOADING state when loading started', async () => {
        const { result } = renderHook(() => useLockingLoader(loader));
        await waitFor(() => expect(result.current).toEqual(LoadingState.LOADING));
    });

    it('return COMPLETE state when loading finished', async () => {
        loader.mockReturnValueOnce(Promise.resolve());
        const { result } = renderHook(() => useLockingLoader(loader));
        await waitFor(() => expect(result.current).toEqual(LoadingState.COMPLETE));
    });

    it('return FAILED state when loading failed', async () => {
        loader.mockReturnValueOnce(Promise.reject());
        const { result } = renderHook(() => useLockingLoader(loader));
        await waitFor(() => expect(result.current).toEqual(LoadingState.FAILED));
    });

    it('return FAILED state when loader throws an error', async () => {
        loader.mockImplementationOnce(() => {
            throw new Error();
        });
        const { result } = renderHook(() => useLockingLoader(loader));
        await waitFor(() => expect(result.current).toEqual(LoadingState.FAILED));
    });
});
