import { useSelector } from 'react-redux';
import { type WithGroupState } from '~/state/group/types';
import { isEqual } from 'lodash';

export function useGroup(): string {
    return useSelector((state: WithGroupState) => state.group ?? '', isEqual);
}
