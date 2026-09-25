import { ColorSchemeScript } from '@mantine/core';
import type { Metadata } from 'next';
import React, { type PropsWithChildren } from 'react';

import './globals.css';

import { PwaHead } from './PwaHead';

export const metadata: Metadata = {
    title: 'Rusio programėlė',
    description: 'Produktų ir atsargų apskaita',
    manifest: '/manifest.json',
};

export default function RootLayout({ children }: PropsWithChildren): React.JSX.Element {
    return (
        <html lang="lt" suppressHydrationWarning>
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
            <body>{children}</body>
        </html>
    );
}
