import { NumberInput, Select, Stack } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { AmountBox } from '~/client/pages/common/AmountBox';
import { AmountTitle } from '~/client/pages/history/AmountTitle';
import { useUpdatingHistory } from '~/client/pages/history/UpdatingHistoryContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { useMoveHistory } from '~/client/state/history/useMoveHistory';
import { useUpdateHistory } from '~/client/state/history/useUpdateHistory';
import { useProducts } from '~/client/state/products/useProducts';
import type { History, VariantAmount } from '~/types/data';

export function ActiveValueBox(): React.ReactElement | null {
    const [active, setActive] = useActiveContent<History>();
    const [, setUpdating] = useUpdatingHistory();
    const data = active?.data;
    const time = data?.time ?? 0;
    const user = data?.user;

    const initialGroup = data?.group ?? '';
    const [group, setGroup] = useState(initialGroup);

    const initialName = data?.name ?? '';
    const [name, setName] = useState(initialName);

    const initialYear = data?.year ?? new Date().getFullYear();
    const [year, setYear] = useState<number>(initialYear);

    const groups = useGroups();
    const groupOptions = useMemo(() => groups.map((g) => g.group), [groups]);

    const products = useProducts();
    const nameOptions = useMemo(() => {
        const list = products.filter((p) => p.group === group).map((p) => p.name);
        return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
    }, [group, products]);

    const handleUpdate = useUpdateHistory();
    const handleMove = useMoveHistory();
    const handleClose = useCallback(
        async (changed?: readonly VariantAmount[]): Promise<void> => {
            console.info(`[DEV]`, { group, name, year, changed });

            if (!data) {
                return;
            }

            const historyKey = { time, group: initialGroup, name: initialName, year: initialYear, user };
            setUpdating(historyKey, true);

            try {
                if (initialGroup !== group || initialName !== name || initialYear !== year) {
                    await handleMove(time, initialGroup, initialName, initialYear, group, name, year);
                }

                await handleUpdate(time, group, name, year, changed, user);
            } finally {
                setUpdating(historyKey, false);
            }
        },
        [
            data,
            group,
            handleMove,
            handleUpdate,
            initialGroup,
            initialName,
            initialYear,
            name,
            setUpdating,
            time,
            user,
            year,
        ]
    );

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const opened = active?.action === 'values' && !!data;

    return data ? (
        <UpdateTypeWrapper>
            <AmountBox
                {...data}
                // userProfile={profile}
                opened={opened}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
                title={<AmountTitle email={data?.user} time={data?.time} />}
            >
                <Stack mt="md" mb="lg">
                    <Select
                        label={<Label>Group</Label>}
                        data={groupOptions}
                        value={group}
                        onChange={(v) => setGroup(v ?? '')}
                        withAsterisk
                        searchable
                    />
                    <Select
                        label={<Label>Name</Label>}
                        data={nameOptions}
                        value={name}
                        onChange={(v) => setName(v ?? '')}
                        withAsterisk
                        searchable
                    />
                    <NumberInput
                        label={<Label>Year</Label>}
                        value={year}
                        onChange={(v) => setYear(typeof v === 'number' ? v : 0)}
                        withAsterisk
                        allowDecimal={false}
                        allowNegative={false}
                        min={1}
                    />
                </Stack>
            </AmountBox>
        </UpdateTypeWrapper>
    ) : null;
}
