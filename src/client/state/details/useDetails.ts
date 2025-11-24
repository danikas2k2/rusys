import { useSelector } from 'react-redux';

import { isEqual } from 'lodash';

import type { WithDetailsState } from '~/client/state/details/types';
import type { Details } from '~/types/data';

export const useDetails = (): readonly Details[] =>
    useSelector((state: WithDetailsState) => state.details ?? [], isEqual);
