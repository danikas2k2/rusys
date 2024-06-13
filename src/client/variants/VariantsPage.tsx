import React from 'react';
import { VariantsTable } from '~/client/variants/VariantsTable';
import { Label } from '~/client/common/Label';
import { Toolbar } from '~/client/toolbar/Toolbar';
import cx from './VariantsPage.less';

export function VariantsPage() {
    return (
        <div className={cx('VariantsPage')}>
            <Toolbar />
            <h1>
                <Label>Variants</Label>
            </h1>
            <VariantsTable />
        </div>
    );
}
