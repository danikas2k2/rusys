import { getProductsFixture, getProfileFixture } from '@tests/fixtures';

import { reducer } from '~/client/state/base/reducer';
import { setClientIdAction } from '~/client/state/google/actions';
import { setProductsAction } from '~/client/state/products/actions';
import { setProfileAction } from '~/client/state/profile/actions';
import { setSummaryAction } from '~/client/state/summary/actions';
import { setYearsAction } from '~/client/state/years/actions';

describe('base', () => {
    it('update years state', () => {
        expect(reducer({}, setYearsAction([21, 22, 23]))).toStrictEqual(
            expect.objectContaining({ years: [21, 22, 23] })
        );
    });

    const products = getProductsFixture();

    it('update products state', () => {
        expect(reducer({}, setProductsAction(products))).toStrictEqual(expect.objectContaining({ products }));
    });

    it('update summary state', () => {
        expect(reducer({}, setSummaryAction(products))).toStrictEqual(expect.objectContaining({ summary: products }));
    });

    it('update google state', () => {
        expect(reducer({}, setClientIdAction('CLIENT_ID'))).toStrictEqual(
            expect.objectContaining({ google: { clientId: 'CLIENT_ID' } })
        );
    });

    const profile = getProfileFixture();

    it('update profile state', () => {
        expect(reducer({}, setProfileAction(profile))).toStrictEqual(expect.objectContaining({ profile }));
    });
});
