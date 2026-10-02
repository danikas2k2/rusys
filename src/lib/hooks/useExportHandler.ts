import { useCallback } from 'react';

import { useExport } from '~/lib/hooks/useExport';
import { download } from '~/lib/utils/download';

export function useExportHandler() {
    const handle = useExport();
    return useCallback(async () => {
        const blob = await handle();
        download(blob, `${new Date().toISOString().split('T').shift()}.zip`);
    }, [handle]);
}
