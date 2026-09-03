import { configureStore } from '@reduxjs/toolkit';
import { isDevMode } from '@rusys/common/utils/dev';
import type { Action, Store } from 'redux';

import { reducer } from '~/client/state/base/reducer';

export const getStore = (): Store =>
    configureStore<unknown, Action>({
        reducer,
        devTools: isDevMode(),
    });
