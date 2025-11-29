import { renderHook, waitFor } from '@testing-library/react';

import { LoadingState, useLockingLoader } from '~/client/hooks/useLockingLoader';
import { useUpdatingApiRequest } from '~/client/state/base/useUpdatingApiRequest';

vi.mock('~/client/state/base/useUpdatingApiRequest');

describe('useLockingLoader', () => {
    const loader = vi.fn();
    const request = vi.fn();

    beforeEach(() => vi.mocked(useUpdatingApiRequest).mockReturnValue(request));

    afterEach(() => vi.clearAllMocks());

    it('return INITIAL state initially, then transitions to LOADING', async () => {
        loader.mockImplementation(() => new Promise(() => {})); // Never resolves
        const { result } = renderHook(() => useLockingLoader(loader));

        expect([LoadingState.INITIAL, LoadingState.LOADING]).toContain(result.current);

        await waitFor(() => expect(result.current).toStrictEqual(LoadingState.LOADING));
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
