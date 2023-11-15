import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addMissingAction } from '~/state/missing/actions';
import { useMissing } from '~/state/missing/useMissing';
import { useUpdateMissing } from '~/state/missing/useUpdateMissing';
import { type Group, type Name } from '~/state/types';

// TODO use /addMissing endpoint instead of updateMissing callback
export function useAddMissing(): (group: Group, name: Name) => Promise<void> {
    const dispatch = useDispatch();
    const missing = useMissing();
    const updateMissing = useUpdateMissing();
    return useCallback(
        async (group: Group, name: Name): Promise<void> => {
            if (missing.some((item) => item.group === group && item.name === name)) {
                return;
            }
            dispatch(addMissingAction(group, name));
            await updateMissing([...missing, { group, name }]);
        },
        [dispatch, missing, updateMissing]
    );
}
