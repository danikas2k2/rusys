import { useCallback } from 'react';

import { useImport } from '~/store/common/useImport';

export function useImportHandler() {
    const handle = useImport();
    return useCallback((data: FormData) => data && handle(data), [handle]);
}
