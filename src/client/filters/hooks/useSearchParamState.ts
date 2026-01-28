import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type SearchParamState = [string, (value: string) => void];

export function useSearchParamState(key: string, defaultValue = ''): SearchParamState {
    const [searchParams, setSearchParams] = useSearchParams();
    const rawValue = searchParams.get(key);
    const value = rawValue ?? defaultValue;

    const setValue = useCallback(
        (nextValue: string) => {
            const nextParams = new URLSearchParams(searchParams);
            if (nextValue) {
                nextParams.set(key, nextValue);
            } else {
                nextParams.delete(key);
            }
            setSearchParams(nextParams, { replace: true });
        },
        [key, searchParams, setSearchParams]
    );

    return useMemo(() => [value, setValue], [value, setValue]);
}
