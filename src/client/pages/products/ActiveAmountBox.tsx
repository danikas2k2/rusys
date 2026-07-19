import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { AmountTitle } from '~/client/common/AmountTitle';
import { AmountBox } from '~/client/pages/products/AmountBox';
import type { ProductAmounts } from '~/types/data';

export function ActiveAmountBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<ProductAmounts>();

    const activeData = active?.data;

    const handleClose = useCallback(() => setActive({ data: activeData }), [activeData, setActive]);
    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const opened = active?.action === 'values' && !!activeData;

    return (
        <AmountBox
            opened={opened}
            onClose={handleClose}
            onAfterClose={handleAfterClose}
            title={<AmountTitle {...activeData} />}
        />
    );
}
