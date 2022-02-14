import { Details, Name, Year } from '~/store/details.types';
import { Locale } from '~/store/locale.types';
import { Profile } from '~/store/profile.types';

export interface BaseState {
    locale: Locale;
    profile: Profile;
    missing: Name[];
    years: Year[];
    details: Details;
}
