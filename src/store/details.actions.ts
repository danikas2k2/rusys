import { api } from '@config';
import { isEmpty, isEqual } from 'lodash';
import type { BaseThunkAction } from '~/store/base.actions';
import type { Details, Name, Value, Values, Year } from '~/store/details.types';
import { setYearsAction } from '~/store/years.actions';

export const enum DetailsActionType {
    ADD = 'details.add',
    SET = 'details.set',
}

export type DetailsAction =
    | {
          type: DetailsActionType.ADD;
      }
    | {
          type: DetailsActionType.SET;
          details: Details;
      };

export const addDetailsAction = (): DetailsAction => ({ type: DetailsActionType.ADD });

export const setDetailsAction = (details: Details): DetailsAction => ({ type: DetailsActionType.SET, details });

interface RefreshResponse {
    years?: Year[];
    details?: Details;
}

function refreshDetailsAction({ years: newYears, details: newDetails }: RefreshResponse): BaseThunkAction {
    return (dispatch, getState) => {
        const { years, details } = getState();
        if (newYears && !isEqual(years, newYears)) {
            dispatch(setYearsAction(newYears));
        }
        if (newDetails && !isEqual(details, newDetails)) {
            dispatch(setDetailsAction(newDetails));
        }
    };
}

export function updateDetailsAction(name: Name, details: Details): BaseThunkAction {
    return async (dispatch) => {
        const response = await fetch(`${api}/setDetails`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, details: details[name] }),
        });
        dispatch(refreshDetailsAction((await response.json()) || {}));
    };
}

export function renameDetailsAction(name: Name, newName: Name): BaseThunkAction {
    return async (dispatch) => {
        const response = await fetch(`${api}/setName`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, newName }),
        });
        dispatch(refreshDetailsAction((await response.json()) || {}));
    };
}

export function removeDetailsAction(name: Name): BaseThunkAction {
    return async (dispatch, getState) => {
        if (name) {
            const response = await fetch(`${api}/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            dispatch(refreshDetailsAction((await response.json()) || {}));
        } else {
            const { '': remove, ...details } = getState().details;
            dispatch(setDetailsAction(details));
        }
    };
}

export function setValueAction(name: Name, year: Year, value?: Value): BaseThunkAction {
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

export function setNameAction(name: Name, newName: Name): BaseThunkAction {
    return (dispatch, getState) => {
        if (name !== newName) {
            const {
                details: { [name]: values, ...otherDetails },
            } = getState();
            const newDetails = { [newName]: values, ...otherDetails };
            dispatch(setDetailsAction(newDetails));
            dispatch(renameDetailsAction(name, newName));
        }
    };
}
