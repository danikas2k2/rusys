import { configureStore } from '@reduxjs/toolkit';
import { type Action, type Store } from 'redux';
import { useDev } from '~/common/hooks/useDev';
import { reducer } from '~/state/base/reducer';

export const getStore = (): Store =>
    configureStore<unknown, Action>({
        reducer,
        // eslint-disable-next-line react-hooks/rules-of-hooks
        devTools: useDev(),
    });
