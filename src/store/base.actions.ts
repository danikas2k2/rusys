import { api } from '@config';
import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { BaseState } from '~/store/base.types';
import { setDetailsAction } from '~/store/details.actions';
import { Details, Year } from '~/store/details.types';
import { setMissingAction } from '~/store/missing.actions';
import { setYearsAction } from '~/store/years.actions';

export type BaseThunkAction = ThunkAction<void, BaseState, void, Action>;

interface LoadResponse {
    years?: Year[];
    details?: Details;
    missing?: string[];
}

export function initialLoadAction(onLoad: () => void): BaseThunkAction {
    return async (dispatch) => {
        const response = await fetch(`${api?.href}/load`);
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
        onLoad?.();
    };
}
