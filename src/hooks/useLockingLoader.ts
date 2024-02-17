import { useEffect, useState } from 'react';

export const enum LoadingState {
    INITIAL = 'initial',
    LOADING = 'loading',
    COMPLETE = 'complete',
    FAILED = 'failed',
}

export function useLockingLoader(loader: () => Promise<unknown>): LoadingState {
    const [loading, setLoading] = useState<LoadingState>(LoadingState.INITIAL);
    useEffect(() => {
        (async () => {
            if (loading === LoadingState.INITIAL) {
                setLoading(LoadingState.LOADING);
                try {
                    await loader();
                    setLoading(LoadingState.COMPLETE);
                } catch (e) {
                    setLoading(LoadingState.FAILED);
                }
            }
        })();
    }, [loading, loader]);
    return loading;
}
