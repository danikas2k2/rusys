import { useCallback } from 'react';

import { useImport } from '~/lib/hooks/useImport';
import type { UploadProgress } from '~/lib/utils/uploadWithProgress';

export function useImportHandler() {
    const handle = useImport();
    return useCallback(
        (data: FormData, onProgress?: UploadProgress) => data && (onProgress ? handle(data, onProgress) : handle(data)),
        [handle]
    );
}
