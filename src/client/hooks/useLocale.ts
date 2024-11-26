import { useContext } from 'react';

import { DEFAULT_LOCALE, LocaleContext } from '~/client/common/LocaleContext';

export function useLocale(): string {
    return useContext(LocaleContext) ?? DEFAULT_LOCALE;
}
