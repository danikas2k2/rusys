import { useCallback } from 'react';

import { useImport } from '~/lib/hooks/useImport';
import { trackFaroEvent } from '~/lib/observability/faro';
import type { UploadProgress } from '~/lib/utils/uploadWithProgress';

export function useImportHandler() {
    const handle = useImport();
    return useCallback(
        async (data: FormData, onProgress?: UploadProgress) => {
            if (!data) {
                return;
            }
            trackFaroEvent('data_action', { entity: 'archive', action: 'import', result: 'started' });
            try {
                const result = await (onProgress ? handle(data, onProgress) : handle(data));
                trackFaroEvent('data_action', { entity: 'archive', action: 'import', result: 'success' });
                return result;
            } catch (error) {
                trackFaroEvent('data_action', { entity: 'archive', action: 'import', result: 'error' });
                throw error;
            }
        },
        [handle]
    );
}
