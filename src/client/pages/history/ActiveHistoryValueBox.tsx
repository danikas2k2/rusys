import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { useHistoryUserProfiles } from '~/client/pages/history/hooks/useHistoryUserProfiles';
import { useMoveHistoryEntry } from '~/client/pages/history/hooks/useMoveHistoryEntry';
import { useUpdateHistoryEntry } from '~/client/pages/history/hooks/useUpdateHistoryEntry';
import type { ProductUpdateHistoryItem, VariantAmount } from '~/types/data';
import { HistoryBox } from './HistoryBox';

export function ActiveHistoryValueBox({ onUpdated }: { onUpdated: () => Promise<void> }): React.ReactElement {
    const [active, setActive] = useActiveContent<ProductUpdateHistoryItem>();
    const update = useUpdateHistoryEntry();
    const move = useMoveHistoryEntry();

    const email = active?.data?.user ?? '';
    const profilesByEmail = useHistoryUserProfiles(email ? [email] : []);
    const profile = email ? profilesByEmail[email.toLowerCase()] : undefined;

    const opened = active?.action === 'values' && !!active?.data;

    const handleClose = useCallback(
        async (next?: { group: string; name: string; year: number; amounts: readonly VariantAmount[] }): Promise<void> => {
            const data = active?.data;
            if (data && next) {
                const needsMove =
                    next.group !== data.group || next.name !== data.name || next.year !== data.year;

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
        [active?.data, move, onUpdated, setActive, update]
    );

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    return (
        <UpdateTypeWrapper>
            {active?.data ? (
                <HistoryBox
                    opened={opened}
                    item={active.data}
                    userProfile={profile}
                    onClose={handleClose}
                    onAfterClose={handleAfterClose}
                />
            ) : null}
        </UpdateTypeWrapper>
    );
}


