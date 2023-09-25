import AddIcon from '@icons/Add.svg';
import RemoveIcon from '@icons/Remove.svg';
import Button from '@ui/Button';
import ButtonGroup from '@ui/ButtonGroup';
import useFocusRef from '@ui/hooks/useFocusRef';
import useForwardedRef from '@ui/hooks/useForwardedRef';
import Input from '@ui/Input';
import classNames from 'classnames';
import React, { type ForwardedRef, forwardRef, type JSX, type KeyboardEvent, memo, useEffect } from 'react';
import ValueVariant from '~/client/ValueVariant';
import { type Variant } from '~/store/details/types';
import { stopPropagation } from '~/utils/events';
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
    ): JSX.Element {
        const ref = useFocusRef(useForwardedRef(forwardedRef));
        useEffect(() => {
            if (focus) {
                ref?.focus();
            }
        }, [focus, ref]);

        const decrease = (): void => onChange?.(value - 1);

        const increase = (): void => onChange?.(value + 1);

        const onKeyDown = stopPropagation((e: KeyboardEvent) => {
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
        });

        const onEnter = stopPropagation((e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                onClose?.();
            }
        });

        const diff = value - prevValue;

        return (
            <ButtonGroup className="ValueInput">
                <div className="label">
                    <ValueVariant variant={variant} format="long" />
                </div>
                <Input
                    ref={ref}
                    className="value"
                    color="primary"
                    size="large"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => {
                        const newValue = +e.currentTarget.value;
                        if (!isNaN(newValue)) {
                            onChange?.(newValue);
                        }
                    }}
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    startDecorator={
                        <Button
                            onClick={() => {
                                decrease();
                                ref?.focus();
                            }}
                            onKeyDown={onEnter}
                            variant="plain"
                            color="primary"
                            spacing="half"
                        >
                            <RemoveIcon />
                        </Button>
                    }
                    endDecorator={
                        <Button
                            onClick={() => {
                                increase();
                                ref?.focus();
                            }}
                            onKeyDown={onEnter}
                            variant="plain"
                            color="primary"
                            spacing="half"
                        >
                            <AddIcon />
                        </Button>
                    }
                />
                {!!diff && (
                    <div
                        className={classNames('diff', {
                            positive: diff > 0,
                        })}
                    >
                        {Math.abs(diff)}
                    </div>
                )}
            </ButtonGroup>
        );
    })
);
