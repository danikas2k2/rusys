import { useCallback } from 'react';
import type { Name } from '~/store/details/types';
import useUpdateDetails from '~/store/details/useUpdateDetails';

export default function useAddDetails(): (name: Name) => Promise<void> {
    const updateDetails = useUpdateDetails();
    return useCallback(async (name: Name): Promise<void> => updateDetails(name), [updateDetails]);
}
