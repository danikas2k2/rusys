import { useCallback } from 'react';

import { uploadWithProgress, type UploadProgress } from '~/lib/utils/uploadWithProgress';

export function useImport(): (data: FormData, onProgress?: UploadProgress) => Promise<void> {
    return useCallback(
        (data: FormData, onProgress?: UploadProgress) =>
            uploadWithProgress('POST', '/api/v1/imports', data, onProgress),
        []
    );
}
