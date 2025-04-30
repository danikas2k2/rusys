import { isDevMode } from '~/common/utils/env';
import { reducer } from '~/state/base/reducer';
import { getStore } from '~/state/store';
import { configureStore } from '@reduxjs/toolkit';

jest.mock('~/common/utils/env', () => ({
    isDevMode: jest.fn().mockReturnValue(false),
}));
jest.mock('@reduxjs/toolkit', () => ({
    ...jest.requireActual('@reduxjs/toolkit'),
    configureStore: jest.fn().mockImplementation(jest.requireActual('@reduxjs/toolkit').configureStore),
}));

describe('store configuration', () => {
    afterEach(() => jest.clearAllMocks());

    it('creates store with initial state', () => {
        expect(getStore().getState()).toStrictEqual(reducer(undefined, {} as any));
    });

    it('disables devTools in production mode', () => {
        getStore();

        expect(configureStore).toHaveBeenCalledWith({ reducer, devTools: false });
    });

    it('enables devTools in development mode', () => {
        jest.mocked(isDevMode).mockReturnValue(true);
        getStore();

        expect(configureStore).toHaveBeenCalledWith({ reducer, devTools: true });
    });
});
