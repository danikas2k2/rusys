import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { removeMissingGroupAction } from '~/state/missing/actions';
import { useMissing } from '~/state/missing/useMissing';
import { useUpdateMissing } from '~/state/missing/useUpdateMissing';
import { type Group } from '~/state/types';

// TODO use /removeMissingGroup endpoint instead of updateMissing callback
export function useRemoveMissingGroup(): (group: Group) => Promise<void> {
    const dispatch = useDispatch();
    const missing = useMissing();
    const updateMissing = useUpdateMissing();
    return useCallback(
        async (group: Group): Promise<void> => {
            const filtered = missing.filter((item) => item.group !== group);
            if (missing.length === filtered.length) {
                return;
            }
            dispatch(removeMissingGroupAction(group));
            await updateMissing(filtered);
        },
        [dispatch, missing, updateMissing]
    );
}
