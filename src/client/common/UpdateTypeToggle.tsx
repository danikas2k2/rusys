import React from 'react';
import DeleteIcon from '@assets/delete.svg';
import EditSquareIcon from '@assets/edit-square.svg';
import RestaurantIcon from '@assets/restaurant.svg';
import { Button } from '@ui/Button';
import { UpdateTypes, useUpdateType } from '~/client/common/UpdateTypeContext';
import { ValueChange } from '~/client/details/dialogs/ValueChange';
import { useLabel } from '~/client/hooks/useLabel';
import { ButtonToggle } from '~/client/ui/ButtonToggle';
import { getChangedAmount } from '~/common/utils/amounts';
import { type VariantAmount } from '~/types/data';

interface UpdateTypeToggleProps {
    changes?: Partial<Record<UpdateTypes, ReadonlyArray<VariantAmount>>>;
    updated?: boolean;
}

export function UpdateTypeToggle({ changes, updated = true }: UpdateTypeToggleProps) {
    const consumedLabel = useLabel('Consumed');
    const consumedAmount = changes && getChangedAmount(changes[UpdateTypes.Consumed]);

    const updatedLabel = useLabel('Updated');
    const updatedAmount = changes && getChangedAmount(changes[UpdateTypes.Updated]);

    const recycledLabel = useLabel('Recycled');
    const recycledAmount = changes && getChangedAmount(changes[UpdateTypes.Recycled]);

    const [value, setValue] = useUpdateType();
    return (
        <ButtonToggle {...{ value, setValue }}>
            <Button
                key={UpdateTypes.Consumed}
                value={UpdateTypes.Consumed}
                color="green"
                startDecorator={consumedAmount && <ValueChange position="left" change={consumedAmount} />}
                startDecoratorSpacing="none"
                aria-label={consumedLabel}
                aria-checked={UpdateTypes.Consumed === value}
            >
                <div>
                    <RestaurantIcon />
                </div>
            </Button>
            {updated ? (
                <Button
                    key={UpdateTypes.Updated}
                    value={UpdateTypes.Updated}
                    color="blue"
                    endDecorator={updatedAmount && <ValueChange position="top" change={updatedAmount} />}
                    endDecoratorSpacing="none"
                    aria-label={updatedLabel}
                    aria-checked={UpdateTypes.Updated === value}
                >
                    <div>
                        <EditSquareIcon />
                    </div>
                </Button>
            ) : null}
            <Button
                key={UpdateTypes.Recycled}
                value={UpdateTypes.Recycled}
                color="red"
                endDecorator={recycledAmount && <ValueChange position="right" change={recycledAmount} />}
                endDecoratorSpacing="none"
                aria-label={recycledLabel}
                aria-checked={UpdateTypes.Recycled === value}
            >
                <div>
                    <DeleteIcon />
                </div>
            </Button>
        </ButtonToggle>
    );
}
