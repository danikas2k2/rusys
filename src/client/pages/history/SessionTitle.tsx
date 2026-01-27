import { Group } from '@mantine/core';
import React from 'react';

import { Label } from '~/client/common/Label';
import { EmailAvatar } from '~/client/pages/history/components/EmailAvatar';
import { GroupTitle } from '~/client/table/GroupTitle';
import { formatDate, formatTime, getRoundedDate } from '~/client/utils/time';

interface SessionTitleProps {
    session: string;
}

export function SessionTitle({ session }: SessionTitleProps) {
    const [email, ts] = session.split(':', 2);
    const round = getRoundedDate(ts);
    const time = formatTime(round);
    const date = formatDate(round);
    const [str, day] = date.split(' ', 2);

    return (
        <GroupTitle colSpan={4}>
            <Group justify="space-between">
                <Group wrap="nowrap" gap="xs">
                    <EmailAvatar email={email} />
                    {str && (
                        <time data-date>
                            <Label>{str}</Label> {day}
                        </time>
                    )}
                    <time data-time>{time}</time>
                </Group>
            </Group>
        </GroupTitle>
    );
}
