import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { BaseState } from '~/store/base/types';
import { setLocaleAction } from '~/store/locale/actions';
import type { Locale } from '~/store/locale/types';

export default function useLocale(locale?: Locale): Locale {
    const dispatch = useDispatch();
    useEffect(() => {
        if (locale) {
            dispatch(setLocaleAction(locale));
        }
    }, [dispatch, locale]);
    return useSelector((state: BaseState) => state.locale);
}
