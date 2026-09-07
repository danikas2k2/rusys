import { useEffect, useRef, useState } from 'react';

export const enum LoadingState {
    INITIAL = 'initial',
    LOADING = 'loading',
    COMPLETE = 'complete',
    FAILED = 'failed',
}

export function useLockingLoader(loader: () => Promise<unknown>): LoadingState {
    const [state, setState] = useState<LoadingState>(LoadingState.INITIAL);
    const loaderRef = useRef(loader);
    const promiseRef = useRef<Promise<unknown> | undefined>(undefined);

    useEffect(() => {
        let loading = true;
        if (loaderRef.current !== loader) {
            loaderRef.current = loader;
            promiseRef.current = undefined;
        }
        if (!promiseRef.current) {
            promiseRef.current = Promise.resolve().then(loader);
        }
        const promise = promiseRef.current;

        (async () => {
            setState(LoadingState.LOADING);
            try {
                await promise;
                if (loading) {
                    setState(LoadingState.COMPLETE);
                }
            } catch {
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
