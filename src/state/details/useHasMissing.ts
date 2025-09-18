import { useSelector } from 'react-redux';

import { type WithDetailsState } from '~/state/details/types';

export function useHasMissing(): boolean {
    return useSelector((state: WithDetailsState) => state.details?.some((v) => v.missing) ?? false);
}
