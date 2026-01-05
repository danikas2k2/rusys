import { useEffect, useState } from 'react';

export const enum LoadingState {
    INITIAL = 'initial',
    LOADING = 'loading',
    COMPLETE = 'complete',
    FAILED = 'failed',
}

export function useLockingLoader(loader: () => Promise<unknown>): LoadingState {
    const [state, setState] = useState<LoadingState>(LoadingState.INITIAL);

    useEffect(() => {
        let loading = true;

        (async () => {
            setState(LoadingState.LOADING);
            try {
                await loader();
                if (loading) {
                    setState(LoadingState.COMPLETE);
                }
            } catch (_e) {
                if (loading) {
                    setState(LoadingState.FAILED);
                }
            }
        })();

        return () => {
            loading = false;
        };
    }, [loader]);

    return state;
}
