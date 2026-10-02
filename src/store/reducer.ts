import { combineReducers } from 'redux';

import { error } from '~/store/error/slice';
import { google } from '~/store/google/slice';
import { groups } from '~/store/groups/slice';
import { products } from '~/store/products/slice';
import { profile } from '~/store/profile/slice';
import { summary } from '~/store/summary/slice';
import { variants } from '~/store/variants/slice';
import { years } from '~/store/years/slice';

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
