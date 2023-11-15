import { type WithDetailsState } from '~/state/details/types';
import { type WithFilterState } from '~/state/filter/types';
import { type WithGoogleState } from '~/state/google/types';
import { type WithLocaleState } from '~/state/locale/types';
import { type WithMissingState } from '~/state/missing/types';
import { type WithProfileState } from '~/state/profile/types';
import { type WithRemovingState } from '~/state/removing/types';
import { type WithSummaryState } from '~/state/summary/types';
import { type WithYearsState } from '~/state/years/types';

export interface BaseState
    extends WithDetailsState,
        WithFilterState,
        WithGoogleState,
        WithLocaleState,
        WithMissingState,
        WithProfileState,
        WithRemovingState,
        WithSummaryState,
        WithYearsState {}
