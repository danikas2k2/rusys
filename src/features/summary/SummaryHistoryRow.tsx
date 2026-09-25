import { Group, Stack, Table, Text } from '@mantine/core';
import type { History } from '@rusys/common/data';
import React from 'react';

import { AmountsCell } from '~/components/amounts/AmountsCell';
import { EmailAvatar } from '~/components/common/EmailAvatar';
import { FormatDate } from '~/components/common/FormatDate';
import { getRoundedDate } from '~/lib/utils/time';

export function SummaryHistoryRow({ h, dimmed = false }: { h: History; dimmed?: boolean }) {
    return (
        <Table.Tr opacity={dimmed ? 0.4 : undefined}>
            <Table.Td>
                <Stack gap={2}>
                    <Group wrap="nowrap" gap="xs">
                        <EmailAvatar email={h.user} />
                        <Text size="sm" c={dimmed ? 'dimmed' : undefined}>
                            <FormatDate date={getRoundedDate(h.time)} />
                        </Text>
                    </Group>
                    {h.comment && (
                        <Text size="xs" c="dimmed" style={{ whiteSpace: 'pre-wrap' }}>
                            {h.comment}
                        </Text>
                    )}
                </Stack>
            </Table.Td>
            <Table.Td>
                <AmountsCell group={h.group} amounts={h.amounts ?? []} />
            </Table.Td>
        </Table.Tr>
    );
}
