import type { Summary } from '~/common/data';

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
