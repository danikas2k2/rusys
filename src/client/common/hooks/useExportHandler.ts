import { useCallback } from 'react';
import { download } from '~/client/utils/download';
import { useExport } from '~/state/common/useExport';

export function useExportHandler() {
    const handle = useExport();
    return useCallback(() => {
        console.log('Exporting...');
        const data = handle();
        download(data);
    }, [handle]);
}
