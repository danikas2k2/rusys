import { configureStore } from '@reduxjs/toolkit';
import { type Store } from 'redux';
import { useDev } from '~/hooks/useDev';
import reducer from '~/state/base/reducer';

export const getStore = (): Store => configureStore({ reducer, devTools: useDev() });
