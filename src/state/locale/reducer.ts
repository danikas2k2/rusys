import { DEFAULT_LOCALE, type LocaleAction, LocaleActionType } from '~/state/locale/actions';
import { type Locale } from '~/state/locale/types';

export default function locale(locale: Locale = navigator.language || DEFAULT_LOCALE, action: LocaleAction): Locale {
    switch (action.type) {
        case LocaleActionType.SET:
            return action.locale;

        default:
            return locale;
    }
}
