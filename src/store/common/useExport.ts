import { useCallback } from 'react';

import { API } from '~/common/api/v1';

export function useExport(): () => Promise<Blob> {
    return useCallback(async () => {
        const response = await fetch(API.exportLatest());
        if (!response.ok) {
            throw new Error(`Export failed (${response.status})`);
        }
        return response.blob();
    }, []);
}
