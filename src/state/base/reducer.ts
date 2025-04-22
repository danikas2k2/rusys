import { details } from '~/state/details/reducer';
import { filter } from '~/state/filter/reducer';
import { google } from '~/state/google/reducer';
import { group } from '~/state/group/reducer';
import { groups } from '~/state/groups/reducer';
import { profile } from '~/state/profile/reducer';
import { summary } from '~/state/summary/reducer';
import { variants } from '~/state/variants/reducer';
import { years } from '~/state/years/reducer';
import { combineReducers } from 'redux';

export const reducer = combineReducers({
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
