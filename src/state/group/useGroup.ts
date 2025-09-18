import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import { type WithGroupState } from '~/state/group/types';

export function useGroup(): string {
    return useSelector((state: WithGroupState) => state.group ?? '', isEqual);
}
