import { createContext } from 'react';

import { DEFAULT_LOCALE, type AppLocale } from '~/lib/locale';

export { DEFAULT_LOCALE } from '~/lib/locale';

export const LocaleContext = createContext<string | undefined>(DEFAULT_LOCALE);
export const SetLocaleContext = createContext<(locale: AppLocale) => void>(() => undefined);
