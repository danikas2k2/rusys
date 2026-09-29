import { configureStore } from '@reduxjs/toolkit';
import type * as ReduxToolkit from '@reduxjs/toolkit';

import { isDevMode } from '~/common/utils/dev';
import { reducer } from '~/store/base/reducer';
import { getStore } from '~/store/store';

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
