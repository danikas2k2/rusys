import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { useDev } from '~/hooks/useDev';
import details from '~/store/details/reducer';
import editing from '~/store/editing/reducer';
import filter from '~/store/filter/reducer';
import google from '~/store/google/reducer';
import locale from '~/store/locale/reducer';
import missing from '~/store/missing/reducer';
import profile from '~/store/profile/reducer';
import removing from '~/store/removing/reducer';
import years from '~/store/years/reducer';

const reducer = combineReducers({
    details,
    editing,
    filter,
    google,
    locale,
    missing,
    profile,
    removing,
    years,
});

const store = configureStore({
    reducer,
    devTools: useDev(),
});

export default store;
