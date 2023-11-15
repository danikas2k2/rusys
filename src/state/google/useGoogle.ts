import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type Google, type WithGoogleState } from '~/state/google/types';

export function useGoogle(): Google {
    return useSelector((state: WithGoogleState) => state.google ?? {}, isEqual);
}
