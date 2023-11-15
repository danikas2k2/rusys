import reducer from '~/state/base/reducer';
import { setDetailsAction } from '~/state/details/actions';
import { type AmountSet } from '~/state/details/types';
import { setFilterAction } from '~/state/filter/actions';
import { setClientIdAction } from '~/state/google/actions';
import { setLocaleAction } from '~/state/locale/actions';
import { setMissingAction } from '~/state/missing/actions';
import { setProfileAction } from '~/state/profile/actions';
import { type Profile } from '~/state/profile/types';
import { setRemovingAction } from '~/state/removing/actions';
import { type RemovingSet } from '~/state/removing/types';
import { setSummaryAction } from '~/state/summary/actions';
import { setYearsAction } from '~/state/years/actions';

describe('base', () => {
    it('update years state', () => {
        expect(reducer({}, setYearsAction([21, 22, 23]))).toEqual(expect.objectContaining({ years: [21, 22, 23] }));
    });

    const details: AmountSet = {
        '': { A: { 21: { '': 2 } }, B: { 22: { '': 1 } } },
        G: { A: { 22: { d: 1 } }, C: { 21: { '': 2 } } },
    };

    it('update details state', () => {
        expect(reducer({}, setDetailsAction(details))).toEqual(expect.objectContaining({ details }));
    });

    it('update summary state', () => {
        expect(reducer({}, setSummaryAction(details))).toEqual(expect.objectContaining({ summary: details }));
    });

    const removing: RemovingSet = {
        '': { A: { 21: true }, B: { 22: true } },
        G: { A: { 22: true }, C: { 21: true } },
    };

    it('update removing state', () => {
        expect(reducer({}, setRemovingAction(removing))).toEqual(expect.objectContaining({ removing }));
    });

    it('update missing state', () => {
        expect(reducer({}, setMissingAction(['missing']))).toEqual(
            expect.objectContaining({ missing: [{ group: '', name: 'missing' }] })
        );
    });

    it('update filter state', () => {
        expect(reducer({}, setFilterAction('filtered'))).toEqual(expect.objectContaining({ filter: 'filtered' }));
    });

    it('update locale state', () => {
        expect(reducer({}, setLocaleAction('lt-LT'))).toEqual(expect.objectContaining({ locale: 'lt-LT' }));
    });

    it('update google state', () => {
        expect(reducer({}, setClientIdAction('CLIENT_ID'))).toEqual(
            expect.objectContaining({ google: { clientId: 'CLIENT_ID' } })
        );
    });

    const profile: Profile = {
        name: 'Big Buddy',
        email: 'big.buddy@email.com',
    };

    it('update profile state', () => {
        expect(reducer({}, setProfileAction(profile))).toEqual(expect.objectContaining({ profile }));
    });
});
