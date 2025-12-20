import { Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { SwipePanel } from '~/client/common/SwipePanel';
import type { ProductUpdateHistoryItem } from '~/types/data';

export function HistorySwipeControls(): React.ReactElement {
    const [active, setActive] = useActiveContent<ProductUpdateHistoryItem>();

    const handleDelete = useCallback(() => {
        if (!active?.data) {
            return;
        }
        setActive({ ...active, action: 'remove' });
    }, [active, setActive]);

    return (
        <SwipePanel>
            <Button variant="filled" color="red" size="sm" leftSection={<IconTrash size={18} />} onClick={handleDelete}>
                <Label>Remove</Label>
            </Button>
        </SwipePanel>
    );
}


