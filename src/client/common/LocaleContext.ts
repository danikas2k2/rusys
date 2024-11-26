import { createContext } from 'react';

export const DEFAULT_LOCALE = 'en-US';

export const LocaleContext = createContext<string | undefined>(DEFAULT_LOCALE);
