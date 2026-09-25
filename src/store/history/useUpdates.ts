import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { History } from '~/common/data';
import type { WithHistoryState } from '~/store/history/types';

export const useUpdates = (): readonly History[] =>
    useSelector((state: WithHistoryState) => state.updates ?? [], equal);
