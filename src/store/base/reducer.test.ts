import { getProductsFixture, getProfileFixture } from '@tests/fixtures';

import { reducer } from '~/store/base/reducer';
import { setErrorAction } from '~/store/error/actions';
import { setClientIdAction } from '~/store/google/actions';
import { setProductsAction } from '~/store/products/actions';
import { setProfileAction } from '~/store/profile/actions';
import { setSummaryAction } from '~/store/summary/actions';
import { setYearsAction } from '~/store/years/actions';

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

    it('update error state', () => {
        expect(reducer({}, setErrorAction('Test error'))).toStrictEqual(
            expect.objectContaining({ error: { error: 'Test error' } })
        );
    });
});
