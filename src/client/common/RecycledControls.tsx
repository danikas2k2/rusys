import React from 'react';
import { Button, ButtonGroup } from '@ui/Button';
import { Label } from '~/client/common/Label';
import { useRecycled } from '~/client/common/RecycledContext';
import { ValueChange } from '~/client/details/dialogs/ValueChange';

interface RecycledControlsProps {
    consumedAmount?: number | boolean;
    recycledAmount?: number | boolean;
}

export function RecycledControls({ consumedAmount, recycledAmount }: RecycledControlsProps) {
    const [recycled, setRecycled] = useRecycled();
    return (
        <ButtonGroup>
            <Button
                role="radio"
                aria-checked={!recycled}
                color={recycled ? 'neutral' : 'positive'}
                variant={recycled ? 'outlined' : 'solid'}
                onClick={() => setRecycled(false)}
                startDecorator={consumedAmount && <ValueChange position="left" change={consumedAmount} />}
            >
                <Label>Consumed</Label>
            </Button>
            <Button
                role="radio"
                aria-checked={recycled}
                color={recycled ? 'negative' : 'neutral'}
                variant={recycled ? 'solid' : 'outlined'}
                onClick={() => setRecycled(true)}
                endDecorator={recycledAmount && <ValueChange position="right" change={recycledAmount} />}
            >
                <Label>Recycled</Label>
            </Button>
        </ButtonGroup>
    );
}
