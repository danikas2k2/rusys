import { ActionIcon, Flex, Group, NumberInput, Title } from '@mantine/core';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import React, { useCallback } from 'react';

import { AmountVariant } from '~/client/common/AmountVariant';
import { ChangeBadge } from '~/client/common/ChangeBadge';
import { useForwardedRef } from '~/client/hooks/useForwardedRef';
import { useLabels } from '~/client/hooks/useLabels';

import './AmountInput.pcss';

interface AmountInputProps extends React.RefAttributes<HTMLInputElement> {
    variant: string;
    amount?: number;
    change?: number;
    onClose?: (variant: string) => void;
    onChange?: (variant: string, value: number) => void;
    focused?: boolean;
    onFocus?: (variant: string) => void;
    onBlur?: (variant: string) => void;
}

// TODO select input value on first focus
export function AmountInput({
    ref: forwardedRef,
    variant,
    amount = 0,
    change = 0,
    onClose,
    onChange,
    focused,
    onFocus,
    onBlur,
}: AmountInputProps) {
    const ref = useForwardedRef(forwardedRef);

    const decrease = useCallback(() => onChange?.(variant, change - 1), [onChange, variant, change]);

    const increase = useCallback(() => onChange?.(variant, change + 1), [onChange, variant, change]);

    const onDecreaseClick = useCallback(() => {
        decrease();
        ref.current?.focus();
    }, [decrease, ref]);

    const onIncreaseClick = useCallback(() => {
        increase();
        ref.current?.focus();
    }, [increase, ref]);

    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            e.stopPropagation();
            switch (e.key) {
                case 'Enter':
                    onClose?.(variant);
                    break;

                case 'ArrowDown':
                    decrease();
                    break;

                case 'ArrowUp':
                    increase();
                    break;
            }
        },
        [decrease, increase, onClose, variant]
    );

    const handleChange = useCallback(
        (value: string | number) => {
            const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
            if (!isNaN(numValue)) {
                onChange?.(variant, numValue - amount);
            }
        },
        [amount, onChange, variant]
    );

    const onInputFocus = useCallback(() => onFocus?.(variant), [onFocus, variant]);
    const onInputBlur = useCallback(() => onBlur?.(variant), [onBlur, variant]);

    const current = amount + change;

    const _ = useLabels();

    return (
        <Flex className="value-input" align="center" justify="space-between" gap="md">
            <Title order={3} fz="xl">
                <AmountVariant variant={variant} />
            </Title>
            <Group gap="xs" align="center">
                <NumberInput
                    ref={ref}
                    value={current}
                    onChange={handleChange}
                    onKeyDown={onKeyDown}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    aria-label={variant}
                    aria-current={focused}
                    allowNegative={false}
                    allowDecimal={false}
                    size="lg"
                    hideControls
                    leftSection={
                        <ActionIcon
                            size="input-md"
                            color="text"
                            variant="subtle"
                            onClick={onDecreaseClick}
                            onKeyDown={onKeyDown}
                            aria-label={_('Decrease')}
                            aria-controls={variant}
                        >
                            <IconMinus size={18} />
                        </ActionIcon>
                    }
                    rightSection={
                        <ActionIcon
                            size="input-md"
                            color="text"
                            variant="subtle"
                            onClick={onIncreaseClick}
                            onKeyDown={onKeyDown}
                            aria-label={_('Increase')}
                            aria-controls={variant}
                        >
                            <IconPlus size={18} />
                        </ActionIcon>
                    }
                />
                <ChangeBadge change={change} />
            </Group>
        </Flex>
    );
}
