import React from 'react';

import pkg from 'package.json';

import { Label } from '~/client/common/Label';
import { Page } from '~/client/common/Page';
import cx from './AboutPage.pcss';

export function AboutPage() {
    return (
        <Page className={cx('AboutPage')}>
            <article>
                <h1>
                    <Label>About</Label>
                </h1>
                <dl>
                    <dt>
                        <Label>Version</Label>
                    </dt>
                    <dd>{pkg.version}</dd>
                </dl>
            </article>
        </Page>
    );
}
