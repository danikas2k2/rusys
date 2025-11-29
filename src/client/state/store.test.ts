import { configureStore } from '@reduxjs/toolkit';

import { reducer } from '~/client/state/base/reducer';
import { getStore } from '~/client/state/store';
import { isDevMode } from '~/common/utils/env';

vi.mock('~/common/utils/env', async () => ({
    isDevMode: vi.fn().mockReturnValue(false),
}));
vi.mock('@reduxjs/toolkit', async () => {
    const actual = await vi.importActual<typeof import('@reduxjs/toolkit')>('@reduxjs/toolkit');
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
