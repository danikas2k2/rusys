import { Group, Text } from '@mantine/core';
import React from 'react';

import { EmailAvatar } from '~/client/pages/history/EmailAvatar';
import { FormatDate } from '~/client/pages/history/FormatDate';

interface AmountTitleProps {
    time: number;
    email?: string;
}

export function AmountTitle({ time, email }: AmountTitleProps) {
    return (
        <Group>
            <EmailAvatar email={email} /*profile={userProfile}*/ />
            <Text size="xl" fw={600}>
                <FormatDate date={new Date(time)} />
            </Text>
        </Group>
    );
}
