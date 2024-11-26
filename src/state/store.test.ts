import { configureStore } from '@reduxjs/toolkit';
import { useDev } from '~/common/hooks/useDev';
import { reducer } from '~/state/base/reducer';
import { getStore } from '~/state/store';

jest.mock('~/common/hooks/useDev', () => ({
    useDev: jest.fn().mockReturnValue(false),
}));
jest.mock('@reduxjs/toolkit', () => ({
    ...jest.requireActual('@reduxjs/toolkit'),
    configureStore: jest.fn().mockImplementation(jest.requireActual('@reduxjs/toolkit').configureStore),
}));

describe('store configuration', () => {
    afterEach(() => jest.clearAllMocks());

    it('creates store with initial state', () => {
        expect(getStore().getState()).toEqual(reducer(undefined, {} as any));
    });

    it('disables devTools in production mode', () => {
        getStore();
        expect(configureStore).toHaveBeenCalledWith({ reducer, devTools: false });
    });

    it('enables devTools in development mode', () => {
        (useDev as jest.Mock).mockReturnValue(true);
        getStore();
        expect(configureStore).toHaveBeenCalledWith({ reducer, devTools: true });
    });
});
