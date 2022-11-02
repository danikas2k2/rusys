import { api } from '@config';
import { isEqual } from 'lodash';
import type { BaseThunkAction } from '~/store/base.actions';
import type { Name } from '~/store/details.types';

export const enum MissingActionType {
    SET = 'missing.set',
    ADD = 'missing.add',
    REMOVE = 'missing.remove',
}

export type MissingAction =
    | {
          type: MissingActionType.SET;
          missing: Name[];
      }
    | {
          type: MissingActionType.ADD;
          name: Name;
      }
    | {
          type: MissingActionType.REMOVE;
          name: Name;
      };

export const setMissingAction = (missing: Name[]): MissingAction => ({ type: MissingActionType.SET, missing });

const addAction = (name: Name): MissingAction => ({ type: MissingActionType.ADD, name });

export function updateMissingAction(missing: Name[]): BaseThunkAction {
    return async (dispatch) => {
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

export function addMissingAction(name: Name): BaseThunkAction {
    return (dispatch, getState) => {
        const { missing } = getState();
        dispatch(addAction(name));
        const { missing: newMissing } = getState();
        if (!isEqual(missing, newMissing)) {
            dispatch(updateMissingAction(newMissing));
        }
    };
}

const removeAction = (name: Name): MissingAction => ({ type: MissingActionType.REMOVE, name });

export function removeMissingAction(name: Name): BaseThunkAction {
    return (dispatch, getState) => {
        const { missing } = getState();
        dispatch(removeAction(name));
        const { missing: newMissing } = getState();
        if (!isEqual(missing, newMissing)) {
            dispatch(updateMissingAction(newMissing));
        }
    };
}
