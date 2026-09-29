import { useDispatch } from 'react-redux';

import { checkEmailAccess } from '~/server/actions/checkEmailAccess';
import { setAllowedAction } from '~/store/profile/actions';

export function useEmailCheck(): (email: string) => Promise<void> {
    const dispatch = useDispatch();
    return async (email: string): Promise<void> => {
        if (email) {
            dispatch(setAllowedAction(await checkEmailAccess(email)));
        }
    };
}
