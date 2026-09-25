import type { Variant } from '@rusys/common/data';
import equal from 'fast-deep-equal/es6/react';
import { useSelector } from 'react-redux';

import type { WithVariantsState } from '~/store/variants/types';

export const useVariants = (): readonly Variant[] =>
    useSelector((state: WithVariantsState) => state.variants ?? [], equal);
