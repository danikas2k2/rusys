import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BaseState } from '~/store/base.types';
import { setLocaleAction } from '~/store/locale.actions';
import { Locale } from '~/store/locale.types';

export function useLocale(locale?: Locale): Locale {
    const dispatch = useDispatch();
    useEffect(() => {
        if (locale) {
            dispatch(setLocaleAction(locale));
        }
    }, [dispatch, locale]);
    return useSelector((state: BaseState) => state.locale);
}
