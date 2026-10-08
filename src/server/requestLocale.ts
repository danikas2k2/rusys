import { headers } from 'next/headers';

import { localeFromAcceptLanguage, type AppLocale } from '~/lib/locale';

export async function getRequestLocale(): Promise<AppLocale> {
    return localeFromAcceptLanguage((await headers()).get('accept-language'));
}
