import { use } from 'react';

import { DEFAULT_LOCALE, LocaleContext } from '~/components/runtime/LocaleContext';

export function useLocale(): string {
    return use(LocaleContext) ?? DEFAULT_LOCALE;
}
