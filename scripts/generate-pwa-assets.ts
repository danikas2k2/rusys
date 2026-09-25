import fs from 'node:fs';
import path from 'node:path';

import { appleDeviceSpecsForLaunchImages } from 'pwa-asset-generator';

interface AppleDeviceSize {
    height: number;
    width: number;
}

interface AppleDeviceSpec {
    landscape: AppleDeviceSize;
    portrait: AppleDeviceSize;
    scaleFactor: number;
}

interface SplashScreen {
    href: string;
    media: string;
}

const root = path.resolve(import.meta.dirname, '..');
const outputPath = path.join(root, 'src/app/pwa-assets.json');
const appleDeviceSpecs = appleDeviceSpecsForLaunchImages as AppleDeviceSpec[];

function createSplashScreens(spec: AppleDeviceSpec, dark: boolean): SplashScreen[] {
    const colorScheme = dark ? '(prefers-color-scheme: dark) and ' : '';
    const filenamePrefix = dark ? 'apple-splash-dark' : 'apple-splash';

    return (
        [
            ['portrait', spec.portrait],
            ['landscape', spec.landscape],
        ] as [string, AppleDeviceSize][]
    ).map(([orientation, { height, width }]) => ({
        href: `/assets/${filenamePrefix}-${width}-${height}.png`,
        media: `${colorScheme}(device-width: ${width / spec.scaleFactor}px) and (device-height: ${height / spec.scaleFactor}px) and (-webkit-device-pixel-ratio: ${spec.scaleFactor}) and (orientation: ${orientation})`,
    }));
}

const splashScreens = Array.from(
    new Map(
        appleDeviceSpecs
            .flatMap((spec) => [...createSplashScreens(spec, false), ...createSplashScreens(spec, true)])
            .map((screen) => [`${screen.href}:${screen.media}`, screen])
    ).values()
);
const missingSplashScreen = splashScreens.find(
    ({ href }) => !fs.existsSync(path.resolve(root, 'public', href.slice(1)))
);

if (missingSplashScreen) {
    throw new Error(`Missing generated PWA splash screen: ${missingSplashScreen.href}`);
}

fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
        {
            links: [
                { href: '/assets/favicon-196.png', rel: 'icon', sizes: '196x196', type: 'image/png' },
                { href: '/assets/apple-icon-180.png', rel: 'apple-touch-icon', sizes: null, type: null },
            ],
            metas: [
                { content: '/assets/mstile-icon-128.png', name: 'msapplication-square70x70logo' },
                { content: '/assets/mstile-icon-270.png', name: 'msapplication-square150x150logo' },
                { content: '/assets/mstile-icon-558.png', name: 'msapplication-square310x310logo' },
                { content: '/assets/mstile-icon-558-270.png', name: 'msapplication-wide310x150logo' },
                { content: 'yes', name: 'apple-mobile-web-app-capable' },
            ],
            splashScreens,
        },
        null,
        4
    )}\n`
);
