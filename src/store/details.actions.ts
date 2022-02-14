import { api } from '@config';
import { isEmpty, isEqual } from 'lodash';
import { BaseThunkAction } from '~/store/base.actions';
import { Details, Value, Values, Year } from '~/store/details.types';
import { setYearsAction } from '~/store/years.actions';

export enum DetailsActionType {
    SET = 'details.set',
}

export type DetailsAction = {
    type: DetailsActionType.SET;
    details: Details;
};

export const setDetailsAction = (details: Details): DetailsAction => ({ type: DetailsActionType.SET, details });

export function updateDetailsAction(name: string, details: Details): BaseThunkAction {
    return async (dispatch, getState) => {
        const response = await fetch(`${api?.href}/setDetails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, details: details[name] }),
        });
        const { years: newYears, details: newDetails } = (await response.json()) || {};
        if (newYears) {
            const { years } = getState();
            if (!isEqual(years, newYears)) {
                dispatch(setYearsAction(newYears));
            }
        }
        if (!isEqual(details, newDetails)) {
            dispatch(setDetailsAction(newDetails));
        }
    };
}

export function setValueAction(name: string, year: Year, value?: Value): BaseThunkAction {
    return (dispatch, getState) => {
        const { details } = getState();
        const newValues: Values = { ...(details[name] || {}) };
        if (!value || isEmpty(value)) {
            delete newValues[year];
        } else {
            newValues[year] = value;
        }
        const newDetails = { ...details };
        newDetails[name] = newValues;
        dispatch(setDetailsAction(newDetails));
        dispatch(updateDetailsAction(name, newDetails));
    };
}
