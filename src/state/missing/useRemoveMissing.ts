import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { removeMissingAction } from '~/state/missing/actions';
import { useMissing } from '~/state/missing/useMissing';
import { useUpdateMissing } from '~/state/missing/useUpdateMissing';
import { type Group, type Name } from '~/state/types';

// TODO use /removeMissing endpoint instead of updateMissing callback
export function useRemoveMissing(): (group: Group, name: Name) => Promise<void> {
    const dispatch = useDispatch();
    const missing = useMissing();
    const updateMissing = useUpdateMissing();
    return useCallback(
        async (group: Group, name: Name): Promise<void> => {
            const filtered = missing.filter((item) => item.group !== group || item.name !== name);
            if (missing.length === filtered.length) {
                return;
            }
            dispatch(removeMissingAction(group, name));
            await updateMissing(filtered);
        },
        [dispatch, missing, updateMissing]
    );
}
