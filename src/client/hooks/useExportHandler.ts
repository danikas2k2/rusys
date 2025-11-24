import { useCallback } from 'react';

import { useExport } from '~/client/state/common/useExport';
import { download } from '~/client/utils/download';

export function useExportHandler() {
    const handle = useExport();
    return useCallback(async () => {
        const result = await handle();
        if (!result || !result.ok) {
            return;
        }
        const { ok: _nook, ...data } = result;
        download(data);
    }, [handle]);
}
