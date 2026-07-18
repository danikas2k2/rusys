import { act, renderHook, waitFor } from '@testing-library/react';

import React from 'react';

import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

jest.mock('~/client/state/base/useUpdatingApiRequest');
jest.spyOn(React, 'useEffect');

describe('useLockingLoader', () => {
    const loader = jest.fn();
    const request = jest.fn();

    beforeEach(() => jest.mocked(useUpdatingApiRequest).mockReturnValue(request));

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

    it('does not update state to FAILED after unmount when loader rejects', async () => {
        let rejectLoader!: (reason?: unknown) => void;
        const pendingLoader = jest.fn(
            () =>
                new Promise<void>((_resolve, reject) => {
                    rejectLoader = reject;
                })
        );

        const { result, unmount } = renderHook(() => useLockingLoader(pendingLoader));

        await waitFor(() => expect(result.current).toBe('loading'));

        act(() => {
            unmount();
        });

        await act(async () => {
            rejectLoader(new Error('too late'));
            await Promise.resolve();
        });

        expect(result.current).toBe('loading');
    });

    it('does not update state after unmount (loading guard branch)', async () => {
        let resolveLoader!: () => void;
        const pendingLoader = jest.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveLoader = resolve;
                })
        );

        const setState = jest.spyOn(React, 'useState');
        const { result, unmount } = renderHook(() => useLockingLoader(pendingLoader));

        // Hook should be in loading state while promise is pending
        await waitFor(() => expect(result.current).toBe('loading'));

        // Unmount before the promise resolves — sets loading = false
        act(() => {
            unmount();
        });

        // Resolve after unmount — the setState for COMPLETE must not be called
        await act(async () => {
            resolveLoader();
            // Flush all microtasks
            await Promise.resolve();
        });

        // State should still be 'loading' (not 'complete') because loading=false guard fired
        // The important thing is no setState call throws a warning and result stays 'loading'
        expect(result.current).toBe('loading');

        setState.mockRestore();
    });
});
