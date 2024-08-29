import { combineReducers } from 'redux';
import { details } from '~/state/details/reducer';
import { filter } from '~/state/filter/reducer';
import { group } from '~/state/group/reducer';
import { google } from '~/state/google/reducer';
import { groups } from '~/state/groups/reducer';
import { locale } from '~/state/locale/reducer';
import { profile } from '~/state/profile/reducer';
import { summary } from '~/state/summary/reducer';
import { variants } from '~/state/variants/reducer';
import { years } from '~/state/years/reducer';

export const reducer = combineReducers({
    locale,
    google,
    profile,
    filter,
    group,
    years,
    groups,
    variants,
    details,
    summary,
});
