export const DEFAULT_LOCALE = 'en-US';

export const enum LocaleActionType {
    SET = 'locale.set',
}

export type LocaleAction = {
    type: LocaleActionType.SET;
    locale: string;
};

export const setLocaleAction = (locale: string): LocaleAction => ({ type: LocaleActionType.SET, locale });
