import { type WithDetailsState } from '~/state/details/types';
import { type WithFilterState } from '~/state/filter/types';
import { type WithGoogleState } from '~/state/google/types';
import { type WithGroupsState } from '~/state/groups/types';
import { type WithLocaleState } from '~/state/locale/types';
import { type WithProfileState } from '~/state/profile/types';
import { type WithSummaryState } from '~/state/summary/types';
import { type WithVariantsState } from '~/state/variants/types';
import { type WithYearsState } from '~/state/years/types';

export interface BaseState
    extends WithDetailsState,
        WithFilterState,
        WithGoogleState,
        WithGroupsState,
        WithLocaleState,
        WithProfileState,
        WithSummaryState,
        WithVariantsState,
        WithYearsState {}
