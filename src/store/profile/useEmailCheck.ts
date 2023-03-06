import { api } from '@config';
import { useDispatch } from 'react-redux';
import { setAllowedAction } from '~/store/profile/actions';

export default function useEmailCheck(): (email: string) => Promise<void> {
    const dispatch = useDispatch();
    return async (email: string): Promise<void> => {
        if (email) {
            const response = await fetch(`${api}/checkUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            dispatch(setAllowedAction(!!(await response.json()).allowed));
        }
    };
}
