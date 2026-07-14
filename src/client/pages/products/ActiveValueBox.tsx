import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { AmountTitle } from '~/client/pages/products/AmountTitle';
import { ValueListBox } from '~/client/pages/products/ValueListBox';
import type { ProductAmounts } from '~/types/data';

export function ActiveValueBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<ProductAmounts>();

    const activeData = active?.data;

    const handleClose = useCallback(() => setActive({ data: activeData }), [activeData, setActive]);
    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const opened = active?.action === 'values' && !!activeData;

    return (
        <ValueListBox
            opened={opened}
            onClose={handleClose}
            onAfterClose={handleAfterClose}
            title={<AmountTitle {...activeData} />}
        />
    );
}
