import { configureStore } from '@reduxjs/toolkit';
import { type Action } from 'redux';
import { useDev } from '~/hooks/useDev';
import reducer from '~/state/base/reducer';
import { getStore } from '~/state/store';

jest.mock('~/hooks/useDev', () => ({
    useDev: jest.fn().mockReturnValue(false),
}));
jest.mock('@reduxjs/toolkit', () => ({
    ...jest.requireActual('@reduxjs/toolkit'),
    configureStore: jest.fn().mockImplementation(jest.requireActual('@reduxjs/toolkit').configureStore),
}));

describe('store configuration', () => {
    afterEach(() => jest.clearAllMocks());

    it('should create store with initial state', () => {
        expect(getStore().getState()).toEqual(reducer(undefined, {} as Action));
    });

    it('should disable devTools in production mode', () => {
        getStore();
        expect(configureStore).toHaveBeenCalledWith({ reducer, devTools: false });
    });

    it('should enable devTools in development mode', () => {
        (useDev as jest.Mock).mockReturnValue(true);
        getStore();
        expect(configureStore).toHaveBeenCalledWith({ reducer, devTools: true });
    });
});
