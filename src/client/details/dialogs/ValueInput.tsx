import AddIcon from '@assets/add.svg';
import RemoveIcon from '@assets/remove.svg';

import React, { useCallback, useEffect, useRef, type ChangeEvent, type KeyboardEvent, type RefAttributes } from 'react';

import { Button, ButtonGroup } from '@ui/Button';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { Input } from '@ui/Input';

import { ValueVariant } from '~/client/common/ValueVariant';
import { ValueChange } from '~/client/details/dialogs/ValueChange';
import { useLabel } from '~/client/hooks/useLabel';
import cx from './ValueInput.pcss';

interface ValueInputProps extends RefAttributes<HTMLInputElement> {
    variant: string;
    amount?: number;
    change?: number;
    onClose?: (variant: string) => void;
    onChange?: (variant: string, value: number) => void;
    focus?: boolean;
    onFocus?: (variant: string) => void;
    onBlur?: (variant: string) => void;
}

// TODO select input value on first focus
export function ValueInput({
    ref: forwardedRef,
    variant,
    amount = 0,
    change = 0,
    onClose,
    onChange,
    focus,
    onFocus,
    onBlur,
}: ValueInputProps) {
    const [ref, setRef] = useForwardedRef(forwardedRef);

    useEffect(() => {
        if (focus) {
            ref.current?.focus();
        }
    }, [focus, ref]);

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
        (e: KeyboardEvent) => {
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

    const onInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const newValue = +e.currentTarget.value;
            if (!isNaN(newValue)) {
                onChange?.(variant, newValue - amount);
            }
        },
        [amount, onChange, variant]
    );

    const onInputFocus = useCallback(() => onFocus?.(variant), [onFocus, variant]);
    const onInputBlur = useCallback(() => onBlur?.(variant), [onBlur, variant]);

    const current = amount + change;
    const decreaseLabel = useLabel('Decrease');
    const increaseLabel = useLabel('Increase');
    return (
        <ButtonGroup className={cx('ValueInput')}>
            <div className={cx('label')}>
                <ValueVariant variant={variant} />
            </div>
            <div className={cx('input')}>
                <Input
                    ref={setRef}
                    aria-label={variant}
                    aria-current={focus}
                    className={cx('value')}
                    color="blue"
                    size="large"
                    mode="numeric"
                    value={current}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    onFocus={onInputFocus}
                    onBlur={onInputBlur}
                    startDecorator={
                        <Button
                            role="spinbutton"
                            aria-label={decreaseLabel}
                            aria-controls={variant}
                            aria-current={focus}
                            onClick={onDecreaseClick}
                            onKeyDown={onKeyDown}
                            variant="plain"
                            color="blue"
                            spacing="half"
                        >
                            <RemoveIcon />
                        </Button>
                    }
                    endDecorator={
                        <Button
                            role="spinbutton"
                            aria-label={increaseLabel}
                            aria-controls={variant}
                            aria-current={focus}
                            onClick={onIncreaseClick}
                            onKeyDown={onKeyDown}
                            variant="plain"
                            color="blue"
                            spacing="half"
                        >
                            <AddIcon />
                        </Button>
                    }
                />
                <ValueChange change={change} />
            </div>
        </ButtonGroup>
    );
}
