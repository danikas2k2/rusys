import AddIcon from '@icons/Add.svg';
import RemoveIcon from '@icons/Remove.svg';
import Button, { ButtonGroup } from '@ui/Button';
import { useFocusRef } from '@ui/hooks/useFocusRef';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import Input from '@ui/Input';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, {
    type ChangeEvent,
    type ForwardedRef,
    forwardRef,
    type KeyboardEvent,
    memo,
    useCallback,
    useEffect,
} from 'react';
import { useLabel } from '~/client/hooks/useLabel';
import ValueVariant from '~/client/ValueVariant';
import { type Variant } from '~/state/details/types';
import './ValueInput.less';

interface ValueInputProps {
    variant: Variant;
    prevValue?: number;
    value?: number;
    onClose?: () => void;
    onChange?: (value: number) => void;
    focus?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
}

export default memo(
    forwardRef(function ValueInput(
        { variant, prevValue = 0, value = 0, onClose, onChange, focus, onFocus, onBlur }: ValueInputProps,
        forwardedRef: ForwardedRef<HTMLInputElement>
    ) {
        const ref = useFocusRef(useForwardedRef(forwardedRef));
        useEffect(() => {
            if (focus) {
                ref?.focus();
            }
        }, [focus, ref]);

        const decrease = useCallback(() => onChange?.(value - 1), [onChange, value]);

        const increase = useCallback(() => onChange?.(value + 1), [onChange, value]);

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
                        onClose?.();
                        break;

                    case 'ArrowDown':
                        decrease();
                        break;

                    case 'ArrowUp':
                        increase();
                        break;
                }
            },
            [decrease, increase, onClose]
        );

        const onInputChange = useCallback(
            (e: ChangeEvent<HTMLInputElement>) => {
                const newValue = +e.currentTarget.value;
                if (!isNaN(newValue)) {
                    onChange?.(newValue);
                }
            },
            [onChange]
        );

        const diff = value - prevValue;

        return (
            <ButtonGroup className="ValueInput">
                <div className="label">
                    <ValueVariant variant={variant} format="long" />
                </div>
                <Input
                    ref={ref}
                    aria-label={variant}
                    aria-current={focus}
                    className="value"
                    color="primary"
                    size="large"
                    mode="numeric"
                    value={value}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    startDecorator={
                        <Button
                            role="spinbutton"
                            aria-label={useLabel('Decrease')}
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
                            aria-label={useLabel('Increase')}
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
                    <div role="status" className={classNames('diff', { positive: diff > 0 })}>
                        {Math.abs(diff)}
                    </div>
                )}
            </ButtonGroup>
        );
    }),
    isEqual
);
