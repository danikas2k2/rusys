import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { Variant } from '~/common/data';
import type { WithVariantsState } from './types';

export const useVariants = (): readonly Variant[] =>
    useSelector((state: WithVariantsState) => state.variants ?? [], equal);
