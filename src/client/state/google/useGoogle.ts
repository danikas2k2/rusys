import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import type { Google, WithGoogleState } from '~/client/state/google/types';

export function useGoogle(): Google {
    return useSelector((state: WithGoogleState) => state.google ?? {}, isEqual);
}
