import { use } from 'react';
import { DEFAULT_LOCALE, LocaleContext } from '~/client/common/LocaleContext';

export function useLocale(): string {
    return use(LocaleContext) ?? DEFAULT_LOCALE;
}
