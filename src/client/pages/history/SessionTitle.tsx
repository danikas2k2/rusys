import { Group } from '@mantine/core';
import React from 'react';

import { EmailAvatar } from '~/client/pages/history/EmailAvatar';
import { FormatDate } from '~/client/pages/history/FormatDate';
import { GroupTitle } from '~/client/table/GroupTitle';
import { getRoundedDate } from '~/client/utils/time';

interface SessionTitleProps {
    session: string;
}

export function SessionTitle({ session }: SessionTitleProps) {
    // type ProfilesByEmail = Record<string, UserProfile>;
    // const me = useProfile();
    //
    // const historyEmails = useMemo(() => history.map((h) => h.user ?? '').filter(Boolean), [history]);
    // const profilesByEmail = useHistoryUserProfiles(historyEmails);
    //

    const [email, ts] = session.split(':', 2);
    const round = getRoundedDate(ts);

    return (
        <GroupTitle colSpan={4}>
            <Group justify="space-between">
                <Group wrap="nowrap" gap="xs">
                    <EmailAvatar email={email} />
                    <FormatDate date={round} />
                </Group>
            </Group>
        </GroupTitle>
    );
}
