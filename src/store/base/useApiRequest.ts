import { useCallback } from 'react';
import useSetStateFromResponse from '~/store/base/useSetStateFromResponse';

export default function useApiRequest(): (url: string, data?: object) => Promise<void> {
    const updateState = useSetStateFromResponse();
    return useCallback(
        async (url: string, data?: object): Promise<void> =>
            updateState(
                fetch(`/${url}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data ?? {}),
                })
            ),
        [updateState]
    );
}
