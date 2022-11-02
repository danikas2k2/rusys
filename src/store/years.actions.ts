import type { Year } from '~/store/details.types';

export const enum YearsActionType {
    SET = 'years.set',
}

export type YearsAction = {
    type: YearsActionType.SET;
    years: Year[];
};

export const setYearsAction = (years: Year[]): YearsAction => ({ type: YearsActionType.SET, years });
