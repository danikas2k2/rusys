import React from 'react';
import { render } from 'vitest-browser-react';

import type { InitialAppData } from '~/components/app/initialData';
import { NextApp } from '~/components/app/NextApp';
import type { Scenario } from '~/tests/fixtures/data';
import { getVisualAppData } from '~/tests/fixtures/visualData';

import '@fontsource-variable/noto-sans/wght.css';
import '@fontsource-variable/noto-sans-display/wght.css';
import '@fontsource-variable/noto-sans-mono/wght.css';
import '~/app/globals.css';
import './visual-fonts.css';

export async function renderFixtureApp(
    pathname: string,
    scenario: Scenario = 'basic',
    customize?: (data: InitialAppData) => InitialAppData
) {
    window.history.replaceState({}, '', pathname);
    document.documentElement.lang = 'lt';
    const { data, resource, initialGroup } = getVisualAppData(pathname, scenario);
    const initialData = customize?.(data) ?? data;
    await render(
        <NextApp initialData={initialData} initialResource={resource} initialGroup={initialGroup} locale="lt-LT" />
    );
    await document.fonts.ready;
}
