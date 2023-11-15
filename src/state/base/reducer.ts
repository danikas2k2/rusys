import { combineReducers } from 'redux';
import { type BaseState } from '~/state/base/types';
import details from '~/state/details/reducer';
import filter from '~/state/filter/reducer';
import google from '~/state/google/reducer';
import locale from '~/state/locale/reducer';
import missing from '~/state/missing/reducer';
import profile from '~/state/profile/reducer';
import removing from '~/state/removing/reducer';
import summary from '~/state/summary/reducer';
import years from '~/state/years/reducer';

const reducer = combineReducers<BaseState>({
    details,
    summary,
    filter,
    google,
    locale,
    missing,
    profile,
    removing,
    years,
});

export default reducer;
