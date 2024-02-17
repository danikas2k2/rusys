import AddIcon from '@icons/Add.svg';
import RemoveIcon from '@icons/Remove.svg';
import { Button, ButtonGroup } from '@ui/Button';
import { useFocusRef } from '@ui/hooks/useFocusRef';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { Input } from '@ui/Input';
import React, {
    type ChangeEvent,
    type ForwardedRef,
    forwardRef,
    type KeyboardEvent,
    useCallback,
    useEffect,
} from 'react';
import { useLabel } from '~/client/hooks/useLabel';
import { ValueVariant } from '~/client/ValueVariant';
import cx from './ValueInput.less';

interface ValueInputProps {
    variant: string;
    initialAmount?: number;
    amount?: number;
    onClose?: (variant: string) => void;
    onChange?: (variant: string, value: number) => void;
    focus?: boolean;
    onFocus?: (variant: string) => void;
    onBlur?: (variant: string) => void;
}

export const ValueInput = forwardRef(function ValueInput(
    { variant, initialAmount = 0, amount = 0, onClose, onChange, focus, onFocus, onBlur }: ValueInputProps,
    forwardedRef: ForwardedRef<HTMLInputElement>
) {
    const ref = useFocusRef(useForwardedRef(forwardedRef));
    useEffect(() => {
        if (focus) {
            ref?.focus();
        }
    }, [focus, ref]);

    const decrease = useCallback(() => onChange?.(variant, amount - 1), [onChange, variant, amount]);

    const increase = useCallback(() => onChange?.(variant, amount + 1), [onChange, variant, amount]);

    const onDecreaseClick = useCallback(() => {
        decrease();
        ref?.focus();
    }, [decrease, ref]);

    const onIncreaseClick = useCallback(() => {
        increase();
        ref?.focus();
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
                onChange?.(variant, newValue);
            }
        },
        [onChange, variant]
    );

    const onInputFocus = useCallback(() => onFocus?.(variant), [onFocus, variant]);
    const onInputBlur = useCallback(() => onBlur?.(variant), [onBlur, variant]);

    const diff = amount - initialAmount;
    const decreaseLabel = useLabel('Decrease');
    const increaseLabel = useLabel('Increase');
    return (
        <ButtonGroup className={cx('ValueInput')}>
            <div className={cx('label')}>
                <ValueVariant variant={variant} format="long" />
            </div>
            <Input
                ref={ref}
                aria-label={variant}
                aria-current={focus}
                className={cx('value')}
                color="primary"
                size="large"
                mode="numeric"
                value={amount}
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
                        color="primary"
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
                        color="primary"
                        spacing="half"
                    >
                        <AddIcon />
                    </Button>
                }
            />
            {!!diff && (
                <div role="status" className={cx('diff', { positive: diff > 0 })}>
                    {Math.abs(diff)}
                </div>
            )}
        </ButtonGroup>
    );
});
