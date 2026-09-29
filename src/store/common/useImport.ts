import { useCallback } from 'react';

import { API } from '~/common/api/v1';

export function useImport(): (data: FormData) => Promise<void> {
    return useCallback(async (data: FormData): Promise<void> => {
        const response = await fetch(API.import(), { method: 'POST', body: data });
        if (!response.ok) {
            throw new Error(`Import failed (${response.status})`);
        }
    }, []);
}
