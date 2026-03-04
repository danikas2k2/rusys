import { NumberInput, Select, Stack } from '@mantine/core';
import React, { useCallback, useMemo, useState } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { Label } from '~/client/common/Label';
import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { AmountBox } from '~/client/pages/common/AmountBox';
import { AmountTitle } from '~/client/pages/history/AmountTitle';
// import { useHistoryUserProfiles } from '~/client/pages/history/hooks/useHistoryUserProfiles';
// import { useMoveHistoryEntry } from '~/client/pages/history/hooks/useMoveHistoryEntry';
// import { useUpdateHistoryEntry } from '~/client/pages/history/hooks/useUpdateHistoryEntry';
// import { useUpdatingHistory } from '~/client/pages/history/UpdatingHistoryContext';
// import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import { useGroups } from '~/client/state/groups/useGroups';
import { useProducts } from '~/client/state/products/useProducts';
import type { History, VariantAmount } from '~/types/data';

export function ActiveValueBox(): React.ReactElement | null {
    const [active, setActive] = useActiveContent<History>();

    // const [, setUpdating] = useUpdatingHistory();
    // const update = useUpdateHistoryEntry();
    // const move = useMoveHistoryEntry();

    // const email = active?.data?.user ?? '';
    // const profilesByEmail = useHistoryUserProfiles(email ? [email] : []);
    // const profile = email ? profilesByEmail[email.toLowerCase()] : undefined;

    const [group, setGroup] = useState(active?.data?.group);
    const [name, setName] = useState(active?.data?.name);
    const [year, setYear] = useState<number>(active?.data?.year ?? new Date().getFullYear());

    const groups = useGroups();
    const groupOptions = useMemo(() => groups.map((g) => g.group), [groups]);

    const products = useProducts();
    const nameOptions = useMemo(() => {
        const list = products.filter((p) => p.group === group).map((p) => p.name);
        return Array.from(new Set(list)).sort((a, b) => a.localeCompare(b));
    }, [group, products]);

    const handleClose = useCallback(
        async (changed?: readonly VariantAmount[]): Promise<void> => {
            console.info(`[DEV]`, { group, name, year, changed });

            // const data = active?.data;
            // if (data && next) {
            //     const needsMove = next.group !== data.group || next.name !== data.name || next.year !== data.year;
            //
            //     if (needsMove) {
            //         await move({
            //             group: data.group,
            //             name: data.name,
            //             time: data.time,
            //             year: data.year,
            //             newGroup: next.group,
            //             newName: next.name,
            //             newYear: next.year,
            //         });
            //     }
            //
            //     await update({
            //         group: next.group,
            //         name: next.name,
            //         time: data.time,
            //         year: next.year,
            //         amounts: next.amounts,
            //     });
            //     await onUpdated();
            // }
            //
            // // Close the box (keep data, clear action)
            // if (data) {
            //     setActive({ data });
            // } else {
            //     setActive();
            // }
        },
        [
            group,
            name,
            year,
            // move,
            // setActive,
            // update
        ]
    );

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const opened = active?.action === 'values' && !!active?.data;

    return active?.data ? (
        <UpdateTypeWrapper>
            <AmountBox
                opened={opened}
                {...active.data}
                // userProfile={profile}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
                title={<AmountTitle email={active.data?.user} time={active.data?.time} />}
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
