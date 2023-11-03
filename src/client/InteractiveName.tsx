import useLongPress from '@ui/hooks/useLongPress';
import Interactive from '@ui/Interactive';
import { isEqual } from 'lodash';
import React, { memo, useCallback, useState } from 'react';
import EditBox from '~/client/details/dialogs/EditBox';
import { type Name } from '~/store/types';

interface InteractiveNameProps {
    name: Name;
    onClick?: () => void;
}

export default memo(function InteractiveName({ name, onClick }: InteractiveNameProps) {
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
            {opened && <EditBox onClose={handleClose} name={name} />}
        </>
    );
}, isEqual);
