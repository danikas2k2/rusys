import { useDispatch } from 'react-redux';
import { useUpdatingApiRequest } from '~/state/base/useUpdatingApiRequest';
import { setMissingAction } from '~/state/missing/actions';
import { type Missing } from '~/state/missing/types';

export function useUpdateMissing(): (missing: Missing) => Promise<void> {
    const dispatch = useDispatch();
    const request = useUpdatingApiRequest();
    return async (missing: Missing) => {
        dispatch(setMissingAction(missing));
        return request('/setMissing', { missing });
    };
}
