import { combineReducers } from 'redux';

import { error } from '~/store/error/reducer';
import { google } from '~/store/google/reducer';
import { groups } from '~/store/groups/reducer';
import { undates, updates } from '~/store/history/reducer';
import { products } from '~/store/products/reducer';
import { profile } from '~/store/profile/reducer';
import { summary } from '~/store/summary/reducer';
import { variants } from '~/store/variants/reducer';
import { years } from '~/store/years/reducer';

export const reducer = combineReducers({
    error,
    google,
    profile,
    years,
    groups,
    variants,
    products,
    summary,
    updates,
    undates,
});
