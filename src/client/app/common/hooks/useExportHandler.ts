import { useCallback } from 'react';

import { download } from '~/client/app/utils/download';
import { useExport } from '~/client/state/common/useExport';

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
