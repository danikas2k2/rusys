import { DEFAULT_LOCALE, type LocaleAction, LocaleActionType } from '~/state/locale/actions';

export function locale(locale: string = navigator.language || DEFAULT_LOCALE, action: LocaleAction): string {
    switch (action.type) {
        case LocaleActionType.SET:
            return action.locale;

        default:
            return locale;
    }
}
