import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { type WithGroupState } from '~/state/group/types';

export function useGroup(): string {
    return useSelector((state: WithGroupState) => state.group ?? '', isEqual);
}
