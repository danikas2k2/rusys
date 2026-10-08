'use client';

import React from 'react';

import { Label } from '~/components/common/Label';
import { LocaleContext } from '~/components/runtime/LocaleContext';
import type { AppLocale } from '~/lib/locale';

export function OfflineContent({ locale }: { locale: AppLocale }): React.JSX.Element {
    return (
        <LocaleContext value={locale}>
            <main
                style={{
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: '100dvh',
                    padding: '2rem',
                    textAlign: 'center',
                }}
            >
                <img src="/assets/logo.svg" width="80" height="80" alt="" />
                <h1>
                    <Label>No internet connection</Label>
                </h1>
                <p>
                    <Label>Connect to the internet and try again.</Label>
                </p>
                <a href="/">
                    <Label>Try again</Label>
                </a>
            </main>
        </LocaleContext>
    );
}
