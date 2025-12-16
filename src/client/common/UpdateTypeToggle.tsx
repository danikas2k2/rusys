import { SegmentedControl, ThemeIcon, type MantineColor } from '@mantine/core';
import { IconEdit, IconToolsKitchen2, IconTrash } from '@tabler/icons-react';
import React, { useMemo } from 'react';

import { ChangeBadge } from '~/client/common/ChangeBadge';
import { useUpdateType, type UpdateTypes } from '~/client/common/UpdateTypeContext';
import { getChangedAmount } from '~/common/utils/amounts';
import type { VariantAmount } from '~/types/data';
import { useLabels } from '../hooks/useLabels';

import './UpdateTypeToggle.pcss';

interface UpdateTypeToggleProps {
    readonly changes?: Readonly<Partial<Record<UpdateTypes, readonly VariantAmount[]>>>;
    readonly updated?: boolean;
}

const UPDATE_TYPE_COLORS: Record<UpdateTypes, MantineColor> = {
    consumed: 'green',
    updated: 'blue',
    recycled: 'red',
};

export function UpdateTypeToggle(props: Readonly<UpdateTypeToggleProps>) {
    const { changes, updated = true } = props;
    const _ = useLabels();

    const [updateType, setUpdateType] = useUpdateType();

    const data = useMemo(() => {
        const consumedAmount = changes && getChangedAmount(changes.consumed);
        const updatedAmount = changes && getChangedAmount(changes.updated);
        const recycledAmount = changes && getChangedAmount(changes.recycled);

        return [
            {
                value: 'consumed',
                label: (
                    <>
                        <ThemeIcon color="text" variant={updateType === 'consumed' ? 'filled' : 'subtle'}>
                            <IconToolsKitchen2 aria-label={_('Consumed')} />
                        </ThemeIcon>
                        {consumedAmount && <ChangeBadge position="left" change={consumedAmount} />}
                    </>
                ),
            },
            ...(updated
                ? [
                      {
                          value: 'updated',
                          label: (
                              <>
                                  <ThemeIcon color="text" variant={updateType === 'updated' ? 'filled' : 'subtle'}>
                                      <IconEdit aria-label={_('Updated')} />
                                  </ThemeIcon>
                                  {updatedAmount && <ChangeBadge position="top" change={updatedAmount} />}
                              </>
                          ),
                      },
                  ]
                : []),
            {
                value: 'recycled',
                label: (
                    <>
                        <ThemeIcon color="text" variant={updateType === 'recycled' ? 'filled' : 'subtle'}>
                            <IconTrash aria-label={_('Recycled')} />
                        </ThemeIcon>
                        {recycledAmount && <ChangeBadge position="right" change={recycledAmount} />}
                    </>
                ),
            },
        ];
    }, [changes, _, updated, updateType]);

    const handleChange = (newValue: string) => {
        const newType = newValue as UpdateTypes;

        setUpdateType(newType);
    };

    return (
        <SegmentedControl
            data-toggle="update-type"
            color={UPDATE_TYPE_COLORS[updateType]}
            data={data}
            value={updateType}
            onChange={handleChange}
        />
    );
}
