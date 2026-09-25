import { useCallback } from 'react';

import { download } from '~/lib/utils/download';
import { useExport } from '~/store/common/useExport';

export function useExportHandler() {
    const handle = useExport();
    return useCallback(async () => {
        const blob = await handle();
        download(blob, `${new Date().toISOString().split('T').shift()}.zip`);
    }, [handle]);
}
