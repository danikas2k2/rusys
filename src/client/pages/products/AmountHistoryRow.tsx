import { Group, Stack, Table, Text } from '@mantine/core';
import React from 'react';

import { AmountsCell } from '~/client/pages/products/AmountsCell';
import { EmailAvatar } from '~/client/pages/products/EmailAvatar';
import { FormatDate } from '~/client/pages/products/FormatDate';
import { getRoundedDate } from '~/client/utils/time';
import type { History } from '~/types/data';

export function AmountHistoryRow({ h, dimmed = false }: { h: History; dimmed?: boolean }) {
    return (
        <Table.Tr key={`${h.time}:${h.year}`} opacity={dimmed ? 0.4 : undefined}>
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
                <AmountsCell amounts={h.amounts ?? []} />
            </Table.Td>
        </Table.Tr>
    );
}
