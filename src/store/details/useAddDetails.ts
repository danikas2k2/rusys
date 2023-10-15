import { useCallback } from 'react';
import useUpdateDetails from '~/store/details/useUpdateDetails';
import { type Name } from '~/store/types';

export default function useAddDetails(): (name: Name) => Promise<void> {
    const updateDetails = useUpdateDetails();
    return useCallback(async (name: Name): Promise<void> => updateDetails(name), [updateDetails]);
}
