import { useSelector } from 'react-redux';
import { type Google, type WithGoogleState } from '~/state/google/types';
import { isEqual } from 'lodash';

export function useGoogle(): Google {
    return useSelector((state: WithGoogleState) => state.google ?? {}, isEqual);
}
