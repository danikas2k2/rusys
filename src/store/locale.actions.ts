import { Locale } from '~/store/locale.types';

export enum LocaleActionType {
    SET = 'locale.set',
}

export type LocaleAction = {
    type: LocaleActionType.SET;
    locale: Locale;
};

export const setLocaleAction = (locale: Locale): LocaleAction => ({ type: LocaleActionType.SET, locale });
