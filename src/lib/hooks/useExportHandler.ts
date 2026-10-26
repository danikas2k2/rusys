import { useCallback } from 'react';

import { useExport } from '~/lib/hooks/useExport';
import { trackFaroEvent } from '~/lib/observability/faro';
import { download } from '~/lib/utils/download';

export function useExportHandler() {
    const handle = useExport();
    return useCallback(async () => {
        trackFaroEvent('export_started');
        trackFaroEvent('data_action', { entity: 'archive', action: 'export', result: 'started' });
        try {
            const blob = await handle();
            download(blob, `${new Date().toISOString().split('T').shift()}.zip`);
            trackFaroEvent('data_action', { entity: 'archive', action: 'export', result: 'success' });
        } catch (error) {
            trackFaroEvent('data_action', { entity: 'archive', action: 'export', result: 'error' });
            throw error;
        }
    }, [handle]);
}
