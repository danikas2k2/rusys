import { useDebouncedCallback } from '@mantine/hooks';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type SearchParamState = [string, (value: string) => void];

export function useSearchParamState(key: string, defaultValue = ''): SearchParamState {
    const [searchParams, setSearchParams] = useSearchParams();
    const [localValue, setLocalValue] = useState(() => searchParams.get(key) ?? defaultValue);

    const flushToUrl = useDebouncedCallback((nextValue: string) => {
        setSearchParams(
            (prev) => {
                const nextParams = new URLSearchParams(prev);
                if (nextValue) {
                    nextParams.set(key, nextValue);
                } else {
                    nextParams.delete(key);
                }
                return nextParams;
            },
            { replace: true }
        );
    }, 300);

    const setValue = useCallback(
        (nextValue: string) => {
            setLocalValue(nextValue);
            flushToUrl(nextValue);
        },
        [flushToUrl]
    );

    return useMemo(() => [localValue, setValue], [localValue, setValue]);
}
