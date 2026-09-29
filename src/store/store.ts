import { configureStore } from '@reduxjs/toolkit';
import type { Action, Store } from 'redux';

import { isDevMode } from '~/common/utils/dev';
import type { InitialAppData } from '~/components/app/initialData';
import { reducer } from '~/store/base/reducer';
import type { Profile } from '~/store/profile/types';

export const getStore = (clientId?: string, initialData?: InitialAppData, profile?: Profile): Store =>
    configureStore<unknown, Action>({
        reducer,
        devTools: isDevMode(),
        ...(clientId || initialData || profile
            ? {
                  preloadedState: {
                      ...(clientId && { google: { clientId } }),
                      ...initialData,
                      ...(profile && { profile }),
                  },
              }
            : {}),
    });
