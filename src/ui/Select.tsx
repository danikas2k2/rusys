import ExpandDownIcon from '@icons/ExpandDown.svg';
import { Button } from '@ui/Button';
import { Dropdown, type DropdownRef } from '@ui/Dropdown';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { Input, type InputProps, type InputState, type InputVariant } from '@ui/Input';
import { Interactive } from '@ui/Interactive';
import classNames from 'classnames';
import React, {
    cloneElement,
    type FormEvent,
    type ForwardedRef,
    forwardRef,
    type MouseEvent,
    type PropsWithChildren,
    type ReactElement,
    type ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { matchParts } from '~/client/utils/matchParts';
import cx from './Select.less';

export type OptionProps<T = string | number> = PropsWithChildren<{
    value: T;
    label?: string;
    selected?: boolean;
    disabled?: boolean;
    className?: string;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}>;

export const Option = forwardRef(function Option(
    { value, label, selected, disabled, className, onClick, children }: OptionProps,
    forwardedRef: ForwardedRef<HTMLDivElement>
) {
    const ref = useForwardedRef(forwardedRef);
    return (
        <Interactive
            ref={ref}
            role="option"
            data-value={value}
            data-label={label}
            className={classNames(cx('Option', { selected, disabled }), className)}
            onClick={disabled ? undefined : onClick}
        >
            {children}
        </Interactive>
    );
});

export interface SelectProps<T = string> extends Omit<InputProps, 'mode' | 'value' | 'onChange'> {
    value?: T;
    content?: string;
    mode?: 'single' | 'multiple';
    children?: ReactElement<OptionProps<T>>[];
    onChange?: (value: T, text: string | undefined, i: number) => void;
}

export const Select = forwardRef(function Select<T = string>(
    {
        value: initialValue,
        content: initialLabel,
        mode = 'single',
        children: options,
        error,
        invalid = !!error,
        color = invalid ? 'negative' : 'neutral',
        onChange,
        readOnly,
        className,
        endDecorator,
        ...props
    }: SelectProps<T>,
    forwardedRef: ForwardedRef<HTMLInputElement>
) {
    const inputRef = useForwardedRef(forwardedRef);

    const [currentValue, setCurrentValue] = useState<T | undefined>(initialValue);
    useEffect(() => {
        setCurrentValue((value: T | undefined) => (initialValue !== value ? initialValue : value));
    }, [initialValue]);

    const getInitialLabel = useCallback(
        () =>
            initialLabel ??
            (options?.find((option) => option.props.value === initialValue)?.props.children as string | undefined),
        [initialLabel, initialValue, options]
    );

    const [currentLabel, setCurrentLabel] = useState(getInitialLabel());
    useEffect(() => {
        const newLabel = getInitialLabel();
        setCurrentLabel((label: string | undefined) => (newLabel !== label ? newLabel : label));
    }, [getInitialLabel]);

    const [filter, setFilter] = useState<string>();

    const handleInput = useCallback(
        (e: FormEvent<HTMLInputElement>) => {
            if (filter !== e.currentTarget.value) {
                setFilter(e.currentTarget.value);
            }
        },
        [filter]
    );

    const handleClear = useCallback(() => {
        if (filter) {
            setFilter(undefined);
        }
    }, [filter]);

    const dropdownRef = useRef<DropdownRef>(null);

    const handleOption = useCallback(
        (value: T, label: string | undefined, children: ReactNode, i: number) => {
            if (currentValue !== value) {
                setCurrentValue(value);
            }
            const content = label ?? children?.toString() ?? undefined;
            if (currentLabel !== content) {
                setCurrentLabel(content);
            }
            if (filter) {
                setFilter(undefined);
            }
            if (mode === 'single') {
                dropdownRef.current?.close();
            }
            onChange?.(value, content, i);
        },
        [currentLabel, currentValue, filter, mode, onChange]
    );

    const filteredOptions = options
        ?.filter((option) => !filter || matchParts(option.props.label ?? option.props.children?.toString(), filter))
        .map((option, key) => {
            const { value, label, children, disabled } = option.props;
            return cloneElement(option, {
                ...option.props,
                key,
                selected: currentValue === value,
                onClick: disabled ? undefined : () => handleOption(value, label, children, key),
            });
        });

    useEffect(() => {
        if (filter && filteredOptions?.length) {
            dropdownRef.current?.open();
        } else {
            dropdownRef.current?.close();
        }
    }, [filter, filteredOptions?.length]);

    const handleFocus = useCallback(() => {
        if (filteredOptions?.length) {
            dropdownRef.current?.open();
        }
    }, [filteredOptions?.length]);

    const handleBlur = useCallback(() => {
        if (filter) {
            setFilter(undefined);
        }
    }, [filter]);

    const anchorRef = useRef<HTMLDivElement | null>(null);

    useOutsideClick(anchorRef, (e) => {
        const relatedTarget = e.target as Node;
        if (
            !anchorRef.current?.contains(relatedTarget) &&
            !dropdownRef.current?.getDialogElement()?.contains(relatedTarget)
        ) {
            dropdownRef.current?.close();
        }
    });

    const [expanded, setExpanded] = useState(false);
    const [state, setState] = useState<InputState>('default');

    useEffect(() => {
        if (expanded) {
            setState('active');
        } else {
            setState('default');
        }
    }, [expanded]);

    const handlePointerEnter = useCallback(() => {
        const newState = expanded ? 'active' : 'hover';
        if (state !== newState) {
            setState(newState);
        }
    }, [expanded, state]);

    const handlePointerLeave = useCallback(() => {
        const newState = expanded ? 'active' : 'default';
        if (state !== newState) {
            setState(newState);
        }
    }, [expanded, state]);

    const inputValue = filter ?? currentLabel?.toString();

    return (
        <div
            ref={anchorRef}
            role="listbox"
            className={classNames(
                cx('Select', {
                    'full-width': props.fullWidth,
                }),
                className
            )}
        >
            <Input
                ref={inputRef}
                mode="text"
                value={inputValue}
                error={error}
                invalid={invalid}
                color={color}
                readOnly={readOnly}
                clearable={!readOnly && !!inputValue && state === 'active'}
                onClear={handleClear}
                onInput={handleInput}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...props}
                endDecorator={
                    <>
                        <Dropdown
                            ref={dropdownRef}
                            anchor={[anchorRef, inputRef]}
                            autoWidth={false}
                            className={cx('dropdown')}
                            trigger={
                                <Button
                                    className={cx('expand', { expanded })}
                                    // variant={getButtonVariant(props.variant)}
                                    variant="plain"
                                    color={color}
                                    spacing="half"
                                    state={state}
                                    size="medium"
                                    align="end"
                                    fullHeight
                                >
                                    <ExpandDownIcon />
                                </Button>
                            }
                            onOpen={() => setExpanded(true)}
                            onClose={() => setExpanded(false)}
                        >
                            {filteredOptions}
                        </Dropdown>
                        {endDecorator}
                    </>
                }
            />
        </div>
    );
}) as <T = string>(props: SelectProps<T> & { ref?: ForwardedRef<HTMLInputElement> }) => ReactElement;

function getButtonVariant(variant?: InputVariant): typeof variant {
    return !variant || variant === 'outlined' ? 'plain' : variant;
}
