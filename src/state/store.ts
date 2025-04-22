import { useDev } from '~/common/hooks/useDev';
import { reducer } from '~/state/base/reducer';
import { configureStore } from '@reduxjs/toolkit';
import { type Action, type Store } from 'redux';

export const getStore = (): Store =>
    configureStore<unknown, Action>({
        reducer,
        // eslint-disable-next-line react-hooks/rules-of-hooks
        devTools: useDev(),
    });
