import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import details from '~/store/details';
import editing from '~/store/editing';
import locale from '~/store/locale';
import missing from '~/store/missing';
import profile from '~/store/profile';
import years from '~/store/years';

const store = createStore(
    combineReducers({
        locale,
        profile,
        missing,
        years,
        details,
        editing,
    }),
    applyMiddleware(thunk)
);

export default store;
