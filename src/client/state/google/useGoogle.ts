import { useSelector } from 'react-redux';

import equal from 'fast-deep-equal/es6/react';

import type { Google, WithGoogleState } from '~/client/state/google/types';

export const useGoogle = (): Google => useSelector((state: WithGoogleState) => state.google ?? {}, equal);
