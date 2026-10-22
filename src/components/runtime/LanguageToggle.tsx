import { Center, Switch } from '@mantine/core';
import { LT, US } from 'country-flag-icons/react/3x2';
import { useTranslations } from 'next-intl';
import React, { use } from 'react';

import { refreshOfflinePage } from '~/components/app/ServiceWorker/Registration';
import { IconButtonTooltip } from '~/components/common/IconButtonTooltip';
import { SetLocaleContext } from '~/components/runtime/LocaleContext';
import { useLocale } from '~/lib/hooks/useLocale';
import { LOCALE_COOKIE } from '~/lib/locale';
import { translate } from '~/lib/translate';

import './LanguageToggle.css';

export function LanguageToggle(): React.JSX.Element {
    const locale = useLocale();
    const setLocale = use(SetLocaleContext);
    const t = useTranslations('shell');

    const targetLabel = locale === 'lt-LT' ? t('switchToEnglish') : t('switchToLithuanian');

    const changeLanguage = (checked: boolean) => {
        const nextLocale = checked ? 'lt-LT' : 'en-US';
        document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${
            window.location.protocol === 'https:' ? '; Secure' : ''
        }`;
        setLocale(nextLocale);
        document.documentElement.lang = nextLocale.slice(0, 2);
        document.title = translate('Cellar', nextLocale);
        document
            .querySelector('meta[name="description"]')
            ?.setAttribute('content', translate('Product and inventory tracking', nextLocale));
        void refreshOfflinePage();
    };

    return (
        <IconButtonTooltip label={targetLabel}>
            <Center w="fit-content">
                <Switch
                    aria-label={targetLabel}
                    checked={locale === 'lt-LT'}
                    color="primary"
                    onChange={(event) => changeLanguage(event.currentTarget.checked)}
                    onLabel={<LT title={t('switchToLithuanian')} data-flag />}
                    offLabel={<US title={t('switchToEnglish')} data-flag />}
                    size="lg"
                    withThumbIndicator={false}
                />
            </Center>
        </IconButtonTooltip>
    );
}
