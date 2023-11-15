import { type Locale } from '~/state/locale/types';

export const DEFAULT_LOCALE = 'en-US';

export const enum LocaleActionType {
    SET = 'locale.set',
}

export type LocaleAction = {
    type: LocaleActionType.SET;
    locale: Locale;
};

export const setLocaleAction = (locale: Locale): LocaleAction => ({ type: LocaleActionType.SET, locale });
