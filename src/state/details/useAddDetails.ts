import { useCallback } from 'react';
import { useUpdateDetails } from '~/state/details/useUpdateDetails';
import { type Group, type Name } from '~/state/types';

export function useAddDetails(): (group: Group, name: Name) => Promise<void> {
    const updateDetails = useUpdateDetails();
    return useCallback(async (group: Group, name: Name): Promise<void> => updateDetails(group, name), [updateDetails]);
}
