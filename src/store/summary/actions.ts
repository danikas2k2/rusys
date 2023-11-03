import { type AmountSet } from '~/store/details/types';

export const enum SummaryActionType {
    SET = 'summary.set',
}

export type SummaryAction = {
    type: SummaryActionType.SET;
    summary: AmountSet;
};

export const setSummaryAction = (summary: AmountSet): SummaryAction => ({
    type: SummaryActionType.SET,
    summary,
});
