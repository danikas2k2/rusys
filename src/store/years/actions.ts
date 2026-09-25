export const enum YearsActionType {
    SET = 'years.set',
}

export type YearsAction = {
    type: YearsActionType.SET;
    years: number[];
};

export const setYearsAction = (years: number[]): YearsAction => ({ type: YearsActionType.SET, years });
