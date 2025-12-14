import { useSelector } from 'react-redux';

import equal from 'fast-deep-equal/es6/react';

import type { WithVariantsState } from '~/client/state/variants/types';
import type { Variant } from '~/types/data';

export const useGroupVariants = (group: string): readonly Variant[] =>
    useSelector((state: WithVariantsState) => state.variants?.filter((v) => v.group === group) ?? [], equal);
