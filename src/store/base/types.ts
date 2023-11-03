import { type AmountSet } from '~/store/details/types';
import { type Google } from '~/store/google/types';
import { type Locale } from '~/store/locale/types';
import { type Profile } from '~/store/profile/types';
import { type RemovingSet } from '~/store/removing/types';
import { type Name, type Year } from '~/store/types';

export interface BaseState {
    details: AmountSet;
    statistics: AmountSet;
    removing: RemovingSet;
    filter: string;
    google: Google;
    locale: Locale;
    missing: Name[];
    profile: Profile;
    years: Year[];
}
