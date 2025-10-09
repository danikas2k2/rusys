import { useCallback } from 'react';

import { useImport } from '~/client/state/common/useImport';

export function useImportHandler() {
    const handle = useImport();
    return useCallback((data: FormData) => handle(data), [handle]);
}
