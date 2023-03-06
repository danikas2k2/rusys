import { api } from '@config';
import { isEqual } from 'lodash';
import { useDispatch } from 'react-redux';
import type { Name } from '~/store/details/types';
import { setMissingAction } from '~/store/missing/actions';

export default function useUpdateMissing(): (missing: Name[]) => Promise<void> {
    const dispatch = useDispatch();
    return async (missing: Name[]) => {
        const response = await fetch(`${api}/setMissing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ missing }),
        });
        const { missing: newMissing } = (await response.json()) || {};
        if (!isEqual(missing, newMissing)) {
            dispatch(setMissingAction(newMissing));
        }
    };
}
