import { combineReducers } from 'redux';

import { error } from '~/client/state/error/reducer';
import { google } from '~/client/state/google/reducer';
import { groups } from '~/client/state/groups/reducer';
import { products } from '~/client/state/products/reducer';
import { profile } from '~/client/state/profile/reducer';
import { summary } from '~/client/state/summary/reducer';
import { variants } from '~/client/state/variants/reducer';
import { years } from '~/client/state/years/reducer';

export const reducer = combineReducers({
    error,
    google,
    profile,
    years,
    groups,
    variants,
    products,
    summary,
});
