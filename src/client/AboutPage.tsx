import React from 'react';
import { Label } from '~/client/common/Label';
import { Page } from '~/client/common/Page';
// @ts-expect-error import * from '/package.json';
import { version } from '/package.json';
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
                    <dd>{version}</dd>
                </dl>
            </article>
        </Page>
    );
}
