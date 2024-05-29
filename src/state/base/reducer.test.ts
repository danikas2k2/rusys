import { getDetailsFixture, getProfileFixture } from '~/tests/fixtures';
import { reducer } from '~/state/base/reducer';
import { setDetailsAction } from '~/state/details/actions';
import { setFilterAction } from '~/state/filter/actions';
import { setClientIdAction } from '~/state/google/actions';
import { setLocaleAction } from '~/state/locale/actions';
import { setProfileAction } from '~/state/profile/actions';
import { setSummaryAction } from '~/state/summary/actions';
import { setYearsAction } from '~/state/years/actions';

describe('base', () => {
    it('update years state', () => {
        expect(reducer({}, setYearsAction([21, 22, 23]))).toEqual(expect.objectContaining({ years: [21, 22, 23] }));
    });

    const details = getDetailsFixture();

    it('update details state', () => {
        expect(reducer({}, setDetailsAction(details))).toEqual(expect.objectContaining({ details }));
    });

    it('update summary state', () => {
        expect(reducer({}, setSummaryAction(details))).toEqual(expect.objectContaining({ summary: details }));
    });

    it('update filter state', () => {
        expect(reducer({}, setFilterAction('filtered'))).toEqual(expect.objectContaining({ filter: 'filtered' }));
    });

    it('update locale state', () => {
        expect(reducer({}, setLocaleAction('lt-LT'))).toEqual(expect.objectContaining({ locale: 'lt-LT' }));
    });

    it('update google state', () => {
        expect(reducer({}, setClientIdAction('CLIENT_ID'))).toEqual(expect.objectContaining({ google: { clientId: 'CLIENT_ID' } }));
    });

    const profile = getProfileFixture();

    it('update profile state', () => {
        expect(reducer({}, setProfileAction(profile))).toEqual(expect.objectContaining({ profile }));
    });
});
