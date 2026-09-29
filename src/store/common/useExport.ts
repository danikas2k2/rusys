import { useCallback } from 'react';

import { exportArchive } from '~/server/actions/archive';

export function useExport(): () => Promise<Blob> {
    return useCallback(async () => {
        const base64 = await exportArchive();
        const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
        return new Blob([bytes], { type: 'application/zip' });
    }, []);
}
