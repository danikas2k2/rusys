import { useCallback } from 'react';

import { importArchive } from '~/server/actions/archive';

export function useImport(): (data: FormData) => Promise<void> {
    return useCallback(async (data: FormData): Promise<void> => {
        const error = await importArchive(data);
        if (error) {
            throw new Error(error);
        }
    }, []);
}
