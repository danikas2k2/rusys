import { api } from '@config';
import { useDispatch } from 'react-redux';
import { setDetailsAction } from '~/store/details/actions';
import { type Details, type Name, type Year } from '~/store/details/types';
import { setMissingAction } from '~/store/missing/actions';
import { setYearsAction } from '~/store/years/actions';

interface LoadResponse {
    years?: Year[];
    details?: Details;
    missing?: Name[];
}

export default function useInitialLoader(): (onLoad?: () => void) => Promise<void> {
    const dispatch = useDispatch();
    return async (): Promise<void> => {
        const response = await fetch(`${api}/load`);
        const result: LoadResponse = await response.json();
        const { missing, years, details } = result || {};
        if (missing) {
            dispatch(setMissingAction(missing));
        }
        if (years) {
            dispatch(setYearsAction(years));
        }
        if (details) {
            dispatch(setDetailsAction(details));
        }
    };
}
