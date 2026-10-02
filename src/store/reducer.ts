import { combineReducers } from 'redux';

import { error } from '~/store/error';
import { google } from '~/store/google';
import { groups } from '~/store/groups';
import { products } from '~/store/products';
import { profile } from '~/store/profile';
import { summary } from '~/store/summary';
import { variants } from '~/store/variants';
import { years } from '~/store/years';

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
