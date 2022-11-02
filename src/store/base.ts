import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import details from '~/store/details';
import editing from '~/store/editing';
import google from '~/store/google';
import locale from '~/store/locale';
import missing from '~/store/missing';
import profile from '~/store/profile';
import years from '~/store/years';

const store = createStore(
    combineReducers({
        locale,
        google,
        profile,
        missing,
        years,
        details,
        editing,
    }),
    applyMiddleware(thunk)
);

export default store;
