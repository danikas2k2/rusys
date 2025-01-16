import { useCallback } from 'react';

export function useImportHandler() {
    return useCallback(() => {
        console.log('Importing...');
    }, []);
}
