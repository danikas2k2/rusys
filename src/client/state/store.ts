import { configureStore } from '@reduxjs/toolkit';
import { type Action, type Store } from 'redux';

import { reducer } from '~/client/state/base/reducer';
import { isDevMode } from '~/common/utils/env';

export const getStore = (): Store =>
    configureStore<unknown, Action>({
        reducer,
        devTools: isDevMode(),
    });
