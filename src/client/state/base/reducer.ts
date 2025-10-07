import { combineReducers } from 'redux';

import { details } from '~/client/state/details/reducer';
import { google } from '~/client/state/google/reducer';
import { groups } from '~/client/state/groups/reducer';
import { profile } from '~/client/state/profile/reducer';
import { summary } from '~/client/state/summary/reducer';
import { variants } from '~/client/state/variants/reducer';
import { years } from '~/client/state/years/reducer';

export const reducer = combineReducers({
    google,
    profile,
    years,
    groups,
    variants,
    details,
    summary,
});
