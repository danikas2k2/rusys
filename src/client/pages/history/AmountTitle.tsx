import { Group, Text } from '@mantine/core';
import React, { useMemo } from 'react';

import { EmailAvatar } from '~/client/pages/history/EmailAvatar';
import { formatDate, formatTime } from '~/client/utils/time';

interface AmountTitleProps {
    time: number;
    email?: string;
}

export function AmountTitle({ time, email }: AmountTitleProps) {
    const datetime = useMemo(() => {
        const date = new Date(time);
        const ds = formatDate(date);
        const ts = formatTime(date);
        return ds ? `${ds} ${ts}` : ts;
    }, [time]);

    return (
        <Group>
            <EmailAvatar email={email} /*profile={userProfile}*/ />
            <Text size="xl" fw={600}>
                {datetime}
            </Text>
        </Group>
    );
}
