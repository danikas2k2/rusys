import { useLongPress } from '@ui/hooks/useLongPress';
import { Interactive } from '@ui/Interactive';
import React, { useCallback, useState } from 'react';
import { DetailsBox } from '~/client/details/dialogs/DetailsBox';

interface InteractiveNameProps {
    name: string;
    onClick?: () => void;
}

export function InteractiveName({ name, onClick }: InteractiveNameProps) {
    const [opened, setOpened] = useState(false);
    const handleClose = useCallback((): void => setOpened(false), []);
    const handleLongPress = useCallback(() => {
        setOpened(true);
        navigator?.vibrate?.(200);
    }, []);
    const longPress = useLongPress<HTMLDivElement>(handleLongPress, onClick);
    return (
        <>
            <Interactive {...longPress}>{name}</Interactive>
            {opened && <DetailsBox onClose={handleClose} name={name} />}
        </>
    );
}
