import { configureStore } from '@reduxjs/toolkit';
import type { Action, Store } from 'redux';

import { isDevMode } from '~/common/utils/dev';
import { reducer } from '~/store/base/reducer';

export const getStore = (): Store =>
    configureStore<unknown, Action>({
        reducer,
        devTools: isDevMode(),
    });
