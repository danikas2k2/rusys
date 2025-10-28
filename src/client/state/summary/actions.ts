import type { Summary } from '~/types/data';

export const enum SummaryActionType {
    SET = 'summary.set',
}

export type SummaryAction = {
    type: SummaryActionType.SET;
    summary: Summary[];
};

export const setSummaryAction = (summary: Summary[]): SummaryAction => ({
    type: SummaryActionType.SET,
    summary,
});
