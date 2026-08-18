import { Group } from '@mantine/core';
import React, { useCallback, useState } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { AmountTitle } from '~/client/common/AmountTitle';
import { ProductDialogIcon } from '~/client/common/ProductDialogIcon';
import { type SummaryHistoryData } from '~/client/pages/summary/SummaryCell';
import { SummaryHistoryBox } from '~/client/pages/summary/SummaryHistoryBox';

export function ActiveHistoryBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<SummaryHistoryData>();
    const [photoPreviewOpen, setPhotoPreviewOpen] = useState(false);

    const activeData = active?.data;

    const handleClose = useCallback(() => setActive({ data: activeData }), [activeData, setActive]);
    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const opened = active?.action === 'history' && !!activeData;

    return (
        <SummaryHistoryBox
            opened={opened}
            onClose={handleClose}
            onAfterClose={handleAfterClose}
            closeOnEscape={!photoPreviewOpen}
            title={
                <Group wrap="nowrap" gap="sm">
                    <ProductDialogIcon photo={activeData?.photo} onPhotoPreviewOpenChange={setPhotoPreviewOpen} />
                    <AmountTitle {...activeData} />
                </Group>
            }
        />
    );
}
