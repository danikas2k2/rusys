import { MantineProvider, type MantineThemeOverride } from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';
import React from 'react';

import { messagesForLocale } from '~/lib/messages';
import { getTheme } from '~/styles/theme';

export function MockTheme({
    theme,
    children,
}: React.PropsWithChildren<{
    theme?: MantineThemeOverride;
}>): React.ReactElement {
    return (
        <MantineProvider theme={theme ?? getTheme()} withGlobalClasses={false} withCssVariables={false} env="test">
            <NextIntlClientProvider locale="en-US" messages={messagesForLocale('en-US')}>
                {children}
            </NextIntlClientProvider>
        </MantineProvider>
    );
}
