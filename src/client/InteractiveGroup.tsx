import { useLongPress } from '@ui/hooks/useLongPress';
import { Interactive } from '@ui/Interactive';
import React, { useCallback } from 'react';
import { GroupBox } from '~/client/groups/dialogs/GroupBox';
import { useToggle } from '~/client/hooks/useToggle';

interface InteractiveGroupProps {
    group: string;
    onClick?: () => void;
}

export function InteractiveGroup({ group, onClick }: InteractiveGroupProps) {
    const [opened, , open, close] = useToggle(false);
    const handleClose = useCallback((): void => close(), [close]);
    const handleLongPress = useCallback(() => {
        open();
        navigator?.vibrate?.(200);
    }, [open]);
    const longPress = useLongPress<HTMLDivElement>(handleLongPress, onClick);
    return (
        <>
            <Interactive {...longPress}>{group}</Interactive>
            {opened && <GroupBox onClose={handleClose} group={group} />}
        </>
    );
}
