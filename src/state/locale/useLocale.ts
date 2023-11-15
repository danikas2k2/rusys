import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DEFAULT_LOCALE, setLocaleAction } from '~/state/locale/actions';
import { type Locale, type WithLocaleState } from '~/state/locale/types';

export function useLocale(locale?: Locale): Locale {
    const dispatch = useDispatch();
    useEffect(() => {
        if (locale) {
            dispatch(setLocaleAction(locale));
        }
    }, [dispatch, locale]);
    return useSelector((state: WithLocaleState) => state.locale ?? DEFAULT_LOCALE);
}
