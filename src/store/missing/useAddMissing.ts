import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type BaseState } from '~/store/base/types';
import { type Name } from '~/store/details/types';
import { addMissingAction } from '~/store/missing/actions';
import useUpdateMissing from '~/store/missing/useUpdateMissing';

export default function useAddMissing(): (name: Name) => Promise<void> {
    const dispatch = useDispatch();
    const missing = useSelector((state: BaseState) => state.missing);
    const updateMissing = useUpdateMissing();
    return useCallback(
        async (name: Name): Promise<void> => {
            dispatch(addMissingAction(name));
            if (!missing.includes(name)) {
                await updateMissing([...missing, name]);
            }
        },
        [dispatch, missing, updateMissing]
    );
}
