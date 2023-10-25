import { isEqual } from 'lodash';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type BaseState } from '~/store/base/types';
import { removeMissingAction } from '~/store/missing/actions';
import useUpdateMissing from '~/store/missing/useUpdateMissing';
import { type Name } from '~/store/types';

export default function useRemoveMissing(): (name: Name) => Promise<void> {
    const dispatch = useDispatch();
    const missing = useSelector((state: BaseState) => state.missing, isEqual);
    const updateMissing = useUpdateMissing();
    return useCallback(
        async (name: Name): Promise<void> => {
            dispatch(removeMissingAction(name));
            if (missing.includes(name)) {
                await updateMissing(missing.filter((n) => n !== name));
            }
        },
        [dispatch, missing, updateMissing]
    );
}
