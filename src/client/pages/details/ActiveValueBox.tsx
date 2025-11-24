import React, { useCallback } from 'react';

import { useActiveContent } from '~/client/common/ActiveContentContext';
import { UpdateTypeWrapper } from '~/client/common/UpdateTypeContext';
import { useUpdatingDetails } from '~/client/pages/details/UpdatingDetailsContext';
import { ValueBox } from '~/client/pages/details/ValueBox';
import { useUpdateDetails } from '~/client/state/details/useUpdateDetails';
import { useProfile } from '~/client/state/profile/useProfile';
import type { DetailsAmounts, VariantAmount } from '~/types/data';

export function ActiveValueBox(): React.ReactElement {
    const [active, setActive] = useActiveContent<DetailsAmounts>();
    const [, setUpdating] = useUpdatingDetails();

    const profile = useProfile();
    const updateDetails = useUpdateDetails();

    const handleClose = useCallback(
        async (changed?: readonly VariantAmount[]): Promise<void> => {
            const data = active?.data;
            const clean = changed?.filter(({ amount }) => !!amount) ?? [];
            if (data && clean.length) {
                setUpdating(data, true);
                void updateDetails(data.group, data.name, data.year, clean, profile.email).finally(() =>
                    setUpdating(data, false)
                );
            }
            setActive({ data });
        },
        [active?.data, setActive, setUpdating, updateDetails, profile.email]
    );

    const handleAfterClose = useCallback(() => setActive(), [setActive]);

    const opened = active?.action === 'values' && !!active?.data;

    return (
        <UpdateTypeWrapper>
            <ValueBox
                opened={opened}
                {...(active?.data ?? { group: '', name: '', year: 0 })}
                onClose={handleClose}
                onAfterClose={handleAfterClose}
            />
        </UpdateTypeWrapper>
    );
}
