import { combineReducers } from 'redux';

import { details } from '~/state/details/reducer';
import { google } from '~/state/google/reducer';
import { groups } from '~/state/groups/reducer';
import { profile } from '~/state/profile/reducer';
import { summary } from '~/state/summary/reducer';
import { variants } from '~/state/variants/reducer';
import { years } from '~/state/years/reducer';

export const reducer = combineReducers({
    google,
    profile,
    years,
    groups,
    variants,
    details,
    summary,
});
