import { ColorSchemeScript } from '@mantine/core';
import type { Metadata, Viewport } from 'next';
import React, { type PropsWithChildren } from 'react';

import { ServiceWorkerRegistration } from '~/components/app/ServiceWorker/Registration';
import { translate } from '~/lib/translate';
import { getRequestLocale } from '~/server/requestLocale';
import { PwaHead } from './PwaHead';

import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRequestLocale();
    return {
        title: translate('Cellar', locale),
        description: translate('Product and inventory tracking', locale),
        manifest: '/manifest.json',
    };
}

export const viewport: Viewport = {
    viewportFit: 'cover',
};

export default async function RootLayout({ children }: PropsWithChildren): Promise<React.JSX.Element> {
    const locale = await getRequestLocale();
    return (
        <html lang={locale.slice(0, 2)} suppressHydrationWarning>
            <head>
                <ColorSchemeScript defaultColorScheme="auto" />
                <PwaHead />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&family=Noto+Sans+Display:ital,wdth,wght@0,62.5..100,100..900;1,62.5..100,100..900&family=Noto+Sans+Mono:wdth,wght@62.5..100,100..900&family=Noto+Sans:ital,wdth,wght@0,62.5..100,100..900;1,62.5..100,100..900&display=swap"
                />
            </head>
            <body>
                <ServiceWorkerRegistration />
                {children}
            </body>
        </html>
    );
}
