import { LocaleAction, LocaleActionType } from '~/store/locale.actions';
import { Locale } from '~/store/locale.types';

export default function locale(locale: Locale = navigator.language || 'en-US', action: LocaleAction) {
    switch (action.type) {
        case LocaleActionType.SET:
            return action.locale;

        default:
            return locale;
    }
}
