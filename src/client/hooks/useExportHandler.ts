import { useCallback } from 'react';

import { useExport } from '~/client/state/common/useExport';
import { download } from '~/client/utils/download';

export function useExportHandler() {
    const handle = useExport();
    return useCallback(async () => {
        const blob = await handle();
        download(blob, `${new Date().toISOString().split('T').shift()}.zip`);
    }, [handle]);
}
