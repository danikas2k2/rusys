import React, { Children, cloneElement, type JSX, type ReactElement } from 'react';
import { ButtonGroup, type Button, type ButtonProps } from '@ui/Button';

type ButtonElement = ReactElement<ButtonProps, typeof Button>;

export interface ButtonToggleProps<V = string | number> {
    value: V;
    setValue: (value: V) => void;
    children: (ButtonElement | null)[] | ButtonElement | null;
}

export function ButtonToggle<V = string | number>({ value, setValue, children }: ButtonToggleProps<V>): JSX.Element {
    const buttons = Children.toArray(children).filter(Boolean) as ButtonElement[];
    return (
        <ButtonGroup>
            {buttons.map((button: ButtonElement) => {
                const { value: option, color, onClick: optionClick, ...props } = button.props as ButtonProps;
                const checked = value === option;
                return cloneElement(button, {
                    role: 'radio',
                    'aria-checked': checked,
                    color: checked ? color : 'gray',
                    variant: checked ? 'solid' : 'outlined',
                    onClick: (e) => {
                        setValue(option as V);
                        optionClick?.(e);
                    },
                    ...props,
                } satisfies Partial<ButtonProps>);
            })}
        </ButtonGroup>
    );
}
