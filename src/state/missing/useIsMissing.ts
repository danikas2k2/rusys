import { useCallback } from 'react';
import { useMissing } from '~/state/missing/useMissing';
import { type Group, type Name } from '~/state/types';

export function useIsMissing(): (group: Group, name: Name) => boolean {
    const missing = useMissing();
    return useCallback(
        (group: Group, name: Name) => missing.some((item) => item.group === group && item.name === name),
        [missing]
    );
}
