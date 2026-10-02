import { getProductsFixture, getProfileFixture } from '@tests/fixtures';

import { configureStore } from '@reduxjs/toolkit';
import type * as ReduxToolkit from '@reduxjs/toolkit';

import { isDevMode } from '~/common/utils/dev';
import { setErrorAction } from '~/store/error/slice';
import { setClientIdAction } from '~/store/google/slice';
import { setProductsAction } from '~/store/products/slice';
import { setProfileAction } from '~/store/profile/slice';
import { reducer } from '~/store/reducer';
import { getStore } from '~/store/store';
import { setSummaryAction } from '~/store/summary/slice';
import { setYearsAction } from '~/store/years/slice';

vi.mock(import('~/common/utils/dev'), () => ({
    isDevMode: vi.fn().mockReturnValue(false),
}));
vi.mock(import('@reduxjs/toolkit'), async () => {
    const actual = await vi.importActual<typeof ReduxToolkit>('@reduxjs/toolkit');
    return {
        ...actual,
        configureStore: vi.fn().mockImplementation(actual.configureStore),
    };
});

describe('combined reducer', () => {
    it('updates years state', () => {
        expect(reducer({}, setYearsAction([21, 22, 23]))).toStrictEqual(
            expect.objectContaining({ years: [21, 22, 23] })
        );
    });

    const products = getProductsFixture();

    it('updates products state', () => {
        expect(reducer({}, setProductsAction(products))).toStrictEqual(expect.objectContaining({ products }));
    });

    it('updates summary state', () => {
        expect(reducer({}, setSummaryAction(products))).toStrictEqual(expect.objectContaining({ summary: products }));
    });

    it('updates google state', () => {
        expect(reducer({}, setClientIdAction('CLIENT_ID'))).toStrictEqual(
            expect.objectContaining({ google: { clientId: 'CLIENT_ID' } })
        );
    });

    const profile = getProfileFixture();

    it('updates profile state', () => {
        expect(reducer({}, setProfileAction(profile))).toStrictEqual(expect.objectContaining({ profile }));
    });

    it('updates error state', () => {
        expect(reducer({}, setErrorAction('Test error'))).toStrictEqual(
            expect.objectContaining({ error: { error: 'Test error' } })
        );
    });
});

describe('store configuration', () => {
    afterEach(() => vi.clearAllMocks());

    it('creates store with initial state', () => {
        expect(getStore().getState()).toStrictEqual(reducer(undefined, {} as any));
    });

    it('hydrates server-loaded data and Google client ID', () => {
        expect(getStore('test-client', { groups: [{ group: 'Test', order: 0 }] }).getState()).toMatchObject({
            google: { clientId: 'test-client' },
            groups: [{ group: 'Test', order: 0 }],
        });
    });

    it('disables devTools in production mode', () => {
        getStore();

        expect(configureStore).toHaveBeenCalledWith({ reducer, devTools: false });
    });

    it('enables devTools in development mode', () => {
        vi.mocked(isDevMode).mockReturnValue(true);
        getStore();

        expect(configureStore).toHaveBeenCalledWith({ reducer, devTools: true });
    });
});
