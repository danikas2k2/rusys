import { useCallback } from 'react';
import { useSetDetailsYears } from '~/state/details/useSetDetailsYears';

export function useAddDetails(): (group: string, name: string) => Promise<void> {
    const setYears = useSetDetailsYears();
    return useCallback(async (group: string, name: string): Promise<void> => setYears(group, name), [setYears]);
}
