import type { History } from '@rusys/common/data';
import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { WithHistoryState } from '~/client/state/history/types';

export const useUndates = (): readonly History[] =>
    useSelector((state: WithHistoryState) => state.undates ?? [], equal);
