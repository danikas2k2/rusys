import type { Details, Name, Year } from '~/store/details.types';
import type { Editing } from '~/store/editing.types';
import type { Google } from '~/store/google.types';
import type { Locale } from '~/store/locale.types';
import type { Profile } from '~/store/profile.types';

export interface BaseState {
    locale: Locale;
    google: Google;
    profile: Profile;
    missing: Name[];
    years: Year[];
    details: Details;
    editing: Editing;
}
