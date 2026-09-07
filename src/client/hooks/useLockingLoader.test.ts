import { act, renderHook, waitFor } from '@testing-library/react';

import React, { StrictMode } from 'react';

import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

vi.mock(import('~/client/state/base/useUpdatingApiRequest'));

describe('useLockingLoader', () => {
    const loader = vi.fn();
    const request = vi.fn();

    beforeEach(() => {
        vi.mocked(useUpdatingApiRequest).mockReturnValue(request);
    });

    afterEach(() => vi.clearAllMocks());

    it('return INITIAL state while no loading started', () => {
        let initialState: LoadingState | undefined;
        renderHook(() => {
            const state = useLockingLoader(loader);
            if (initialState === undefined) {
                initialState = state;
            }
            return state;
        });

        expect(initialState).toStrictEqual(LoadingState.INITIAL);
    });

    it('return LOADING state when loading started', async () => {
        let resolve!: () => void;
        loader.mockReturnValueOnce(
            new Promise<void>((r) => {
                resolve = r;
            })
        );
        const { result, unmount } = renderHook(() => useLockingLoader(loader));
        await waitFor(() => expect(result.current).toStrictEqual(LoadingState.LOADING));
        unmount();
        await act(async () => {
            resolve();
            await Promise.resolve();
        });
    });

    it('return COMPLETE state when loading finished', async () => {
        loader.mockResolvedValueOnce(undefined);
        const { result } = renderHook(() => useLockingLoader(loader));
        await waitFor(() => expect(result.current).toStrictEqual(LoadingState.COMPLETE));
    });

    it('calls a loader once in StrictMode', async () => {
        loader.mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useLockingLoader(loader), {
            wrapper: ({ children }) => React.createElement(StrictMode, undefined, children),
        });

        await waitFor(() => expect(result.current).toStrictEqual(LoadingState.COMPLETE));

        expect(loader).toHaveBeenCalledTimes(1);
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
        const pendingLoader = vi.fn(
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
        const pendingLoader = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveLoader = resolve;
                })
        );

        const setState = vi.spyOn(React, 'useState');
        const { result, unmount } = renderHook(() => useLockingLoader(pendingLoader));

        await waitFor(() => expect(result.current).toBe('loading'));

        act(() => {
            unmount();
        });

        await act(async () => {
            resolveLoader();
            await Promise.resolve();
        });

        setState.mockRestore();

        expect(result.current).toBe('loading');
    });
});
