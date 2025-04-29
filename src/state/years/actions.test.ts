import { setYearsAction, YearsActionType } from '~/state/years/actions';

describe('setYearsAction', () => {
    it('returns valid action', () => {
        expect(setYearsAction([21, 22, 23])).toStrictEqual({ type: YearsActionType.SET, years: [21, 22, 23] });
    });

    it('returns valid action for empty set', () => {
        expect(setYearsAction([])).toStrictEqual({ type: YearsActionType.SET, years: [] });
    });
});
