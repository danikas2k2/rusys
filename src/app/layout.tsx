import { ColorSchemeScript } from '@mantine/core';
import type { Metadata, Viewport } from 'next';
import { Noto_Color_Emoji, Noto_Sans, Noto_Sans_Display, Noto_Sans_Mono } from 'next/font/google';
import React, { type PropsWithChildren } from 'react';

import { ServiceWorkerRegistration } from '~/components/app/ServiceWorker/Registration';
import { translate } from '~/lib/translate';
import { getRequestLocale } from '~/server/requestLocale';
import { PwaHead } from './PwaHead';

import './globals.css';

const notoSans = Noto_Sans({
    style: ['normal'],
    axes: ['wdth'],
    subsets: ['latin', 'latin-ext'],
    variable: '--font-noto-sans',
    preload: true,
});
const notoSansDisplay = Noto_Sans_Display({
    style: ['normal'],
    axes: ['wdth'],
    subsets: ['latin', 'latin-ext'],
    variable: '--font-noto-sans-display',
    preload: true,
});
const notoSansMono = Noto_Sans_Mono({
    style: ['normal'],
    axes: ['wdth'],
    subsets: ['latin', 'latin-ext'],
    variable: '--font-noto-sans-mono',
    preload: true,
});
const notoColorEmoji = Noto_Color_Emoji({
    style: ['normal'],
    weight: '400',
    subsets: ['emoji'],
    variable: '--font-noto-color-emoji',
    preload: true,
});
const fonts = [notoSans.variable, notoSansDisplay.variable, notoSansMono.variable, notoColorEmoji.variable];

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
    // noinspection HtmlRequiredTitleElement
    return (
        <html lang={locale.slice(0, 2)} className={fonts.join(' ')} suppressHydrationWarning>
            <head>
                <ColorSchemeScript defaultColorScheme="auto" />
                <PwaHead />
            </head>
            <body>
                <div className="pwa-top-blur-fix" aria-hidden="true" />
                <ServiceWorkerRegistration />
                {children}
            </body>
        </html>
    );
}
