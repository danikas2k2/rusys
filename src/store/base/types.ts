import type { Details, Name, Year } from '~/store/details/types';
import type { Editing } from '~/store/editing/types';
import type { Google } from '~/store/google/types';
import type { Locale } from '~/store/locale/types';
import type { Profile } from '~/store/profile/types';

export interface BaseState {
    details: Details;
    editing: Editing;
    filter: string;
    google: Google;
    locale: Locale;
    missing: Name[];
    profile: Profile;
    years: Year[];
}
