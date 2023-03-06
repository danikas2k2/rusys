import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { CommonResponse } from '~/store/types';
import { setDetailsAction } from '~/store/details/actions';
import type { Details, Year } from '~/store/details/types';
import { setYearsAction } from '~/store/years/actions';

export interface RefreshResponse extends CommonResponse {
    years?: Year[];
    details?: Details;
}

export default function useRefreshResponse(): (response: Response | Promise<Response>) => Promise<void> {
    const dispatch = useDispatch();
    return useCallback(
        async (response: Response | Promise<Response>): Promise<void> => {
            const refresh: RefreshResponse = await (await response).json();
            if (refresh?.ok) {
                const { years, details } = refresh;
                if (years) {
                    dispatch(setYearsAction(years));
                }
                if (details) {
                    dispatch(setDetailsAction(details));
                }
                return;
            }
            throw refresh?.error;
        },
        [dispatch]
    );
}
