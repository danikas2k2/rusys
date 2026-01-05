import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { WithHistoryState } from '~/client/state/history/types';
import type { History } from '~/types/data';

export const useHistory = (): readonly History[] =>
    useSelector((state: WithHistoryState) => state.history ?? [], equal);
