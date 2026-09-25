import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { Google, WithGoogleState } from '~/store/google/types';

export const useGoogle = (): Google => useSelector((state: WithGoogleState) => state.google ?? {}, equal);
