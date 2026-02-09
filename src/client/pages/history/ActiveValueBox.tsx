import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { useHistoryUserProfiles } from '~/client/pages/history/hooks/useHistoryUserProfiles';
import { useMoveHistoryEntry } from '~/client/pages/history/hooks/useMoveHistoryEntry';
import { useUpdateHistoryEntry } from '~/client/pages/history/hooks/useUpdateHistoryEntry';
import { useUpdatingHistory } from '~/client/pages/history/UpdatingHistoryContext';
import { useUpdatingProducts } from '~/client/pages/products/UpdatingProductsContext';
import type { History, VariantAmount } from '~/types/data';
import { HistoryBox } from './HistoryBox';

export function ActiveValueBox(): React.ReactElement | null {
    const [active, setActive] = useActiveContent<History>();
    const [, setUpdating] = useUpdatingHistory();

    const update = useUpdateHistoryEntry();
    const move = useMoveHistoryEntry();

    const email = active?.data?.user ?? '';
    const profilesByEmail = useHistoryUserProfiles(email ? [email] : []);
    const profile = email ? profilesByEmail[email.toLowerCase()] : undefined;

    const handleClose = useCallback(
        async (changed?: Readonly<Update>): Promise<void> => {
            const data = active?.data;
            if (data && next) {
                const needsMove = next.group !== data.group || next.name !== data.name || next.year !== data.year;

                if (needsMove) {
                    await move({
                        group: data.group,
                        name: data.name,
                        time: data.time,
                        year: data.year,
                        newGroup: next.group,
                        newName: next.name,
                        newYear: next.year,
                    });
                }

                await update({
                    group: next.group,
                    name: next.name,
                    time: data.time,
                    year: next.year,
                    amounts: next.amounts,
                });
                await onUpdated();
            }

            // Close the box (keep data, clear action)
            if (data) {
                setActive({ data });
            } else {
                setActive();
            }
        },
        [active?.data, move, setActive, update]
    );

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const opened = active?.action === 'values' && !!active?.data;

    return active?.data ? (
        <UpdateTypeWrapper>
            <HistoryBox
                opened={opened}
                {...active.data}
                userProfile={profile}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
            />
        </UpdateTypeWrapper>
    ) : null;
}
