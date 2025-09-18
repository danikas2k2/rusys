import { configureStore } from '@reduxjs/toolkit';
import { type Action, type Store } from 'redux';

import { isDevMode } from '~/common/utils/env';
import { reducer } from '~/state/base/reducer';

export const getStore = (): Store =>
    configureStore<unknown, Action>({
        reducer,
        devTools: isDevMode(),
    });
