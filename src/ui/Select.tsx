import React, {
    cloneElement,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FocusEvent,
    type FormEvent,
    type JSX,
    type MouseEvent,
    type PropsWithChildren,
    type ReactElement,
    type ReactNode,
    type RefAttributes,
} from 'react';
import ExpandDownIcon from '@assets/expand-down.svg';
import { Button } from '@ui/Button';
import { Dropdown, type DropdownRef } from '@ui/Dropdown';
import { type ElementState } from '@ui/Element';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { useOutsideClick } from '@ui/hooks/useOutsideClick';
import { Input, type InputProps } from '@ui/Input';
import { Interactive } from '@ui/Interactive';
import { uniqueId } from '@ui/utils/uniqueId';
import { matchParts } from '~/client/utils/matchParts';
import cs from 'classnames';
import cx from './Select.pcss';

export interface SelectProps<T = string | number, E extends HTMLElement = HTMLElement>
    extends Omit<InputProps, 'mode' | 'value' | 'onChange'> {
    value?: T;
    content?: string;
    multiple?: boolean;
    expanded?: boolean;
    // TODO think about using anything for children, not only array of options
    children?: ReactElement<OptionProps<T, E>>[];
    onChange?: (e: ChangeEvent<E>, value: T, text: string | undefined, i: number) => void;
}

// TODO add translation context and translate toggle button label
export function Select<T = string, E extends HTMLElement = HTMLElement>({
    ref: forwardedRef,
    id = uniqueId('select'),
    value: initialValue,
    content: initialLabel,
    multiple = false,
    expanded: initialExpanded = false,
    children: options,
    error,
    invalid = !!error,
    color = invalid ? 'red' : 'gray',
    variant = 'outlined',
    onClick,
    onChange,
    disabled,
    readOnly,
    fullWidth,
    className,
    endDecorator,
    ...props
}: SelectProps<T, E>): JSX.Element {
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

    const handleChange = useCallback(
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
        (e: ChangeEvent<E>, value: T, label: string | undefined, children: ReactNode, i: number) => {
            const changed = currentValue !== value;
            if (changed) {
                setCurrentValue(value);
            }
            const content = label ?? children?.toString() ?? undefined;
            if (currentLabel !== content) {
                setCurrentLabel(content);
            }
            if (filter) {
                setFilter(undefined);
            }
            if (!multiple) {
                dropdownRef.current?.close();
            }
            if (changed) {
                onChange?.(e, value, content, i);
            }
        },
        [currentLabel, currentValue, filter, multiple, onChange]
    );

    const filteredOptions = options
        ?.filter((option) => !filter || matchParts(option.props.label ?? option.props.children?.toString(), filter))
        .map((option, key) => {
            const { value, label, children, disabled } = option.props;
            const selected = currentValue === value;
            return cloneElement(option, {
                ...option.props,
                key,
                selected,
                onClick: disabled
                    ? undefined
                    : (e: MouseEvent<HTMLElement>) => {
                          onClick?.(e as MouseEvent<HTMLInputElement>);
                          handleOption(e as unknown as ChangeEvent<E>, value, label, children, key);
                      },
            });
        });
    const filteredOut = !filteredOptions?.length;

    useEffect(() => {
        if (filter && !filteredOut) {
            dropdownRef.current?.open();
        } else {
            dropdownRef.current?.close();
        }
    }, [filter, filteredOut]);

    const [hasFocus, setHasFocus] = useState(false);

    const handleFocus = useCallback(() => {
        setHasFocus(true);
        if (!filteredOut) {
            dropdownRef.current?.open();
        }
    }, [filteredOut]);

    const handleBlur = useCallback(
        (e: FocusEvent<HTMLInputElement>) => {
            setHasFocus(false);
            if (
                filter &&
                !anchorRef.current?.contains(e.relatedTarget) &&
                !dropdownRef.current?.getDialogElement()?.contains(e.relatedTarget)
            ) {
                setFilter(undefined);
            }
        },
        [filter]
    );

    const anchorRef = useRef<HTMLDivElement | null>(null);

    useOutsideClick(anchorRef, (e) => {
        const relatedTarget = e.target as Node;
        if (
            !anchorRef.current?.contains(relatedTarget) &&
            !dropdownRef.current?.getDialogElement()?.contains(relatedTarget) &&
            dropdownRef.current?.isOpen
        ) {
            dropdownRef.current?.close();
        }
    });

    const [expanded, setExpanded] = useState(initialExpanded);
    useEffect(() => {
        if (initialExpanded) {
            dropdownRef.current?.open();
        }
    }, [initialExpanded]);

    const [state, setState] = useState<ElementState>('default');
    const active = expanded || hasFocus;

    useEffect(() => {
        if (active) {
            setState('active');
        } else {
            setState('default');
        }
    }, [active]);

    const handlePointerEnter = useCallback(() => {
        const newState = active ? 'active' : 'hover';
        if (state !== newState) {
            setState(newState);
        }
    }, [active, state]);

    const handlePointerLeave = useCallback(() => {
        const newState = active ? 'active' : 'default';
        if (state !== newState) {
            setState(newState);
        }
    }, [active, state]);

    const inputId = `${id}-input`;
    const inputValue = filter ?? (hasFocus ? undefined : currentLabel?.toString());

    return (
        <div
            id={id}
            ref={anchorRef}
            role="listbox"
            className={cs(
                cx('Select', {
                    'full-width': fullWidth,
                }),
                className
            )}
            aria-expanded={expanded}
            aria-labelledby={inputId}
        >
            <Input
                ref={inputRef}
                id={inputId}
                mode="text"
                value={inputValue ?? ''}
                placeholder={currentLabel?.toString()}
                placeholderColor={currentLabel ? color : undefined}
                error={error}
                invalid={invalid}
                aria-invalid={invalid}
                color={color}
                variant={variant}
                disabled={disabled}
                fullWidth={fullWidth}
                readOnly={readOnly}
                aria-readonly={readOnly}
                clearable={!readOnly && !!inputValue && state === 'active'}
                aria-controls={id}
                onClear={handleClear}
                onChange={handleChange}
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
                            className={cs(cx('dropdown'), {
                                [`ui-color-${color}`]: color,
                                [`ui-variant-${variant}`]: variant,
                            })}
                            trigger={
                                <Button
                                    className={cx('expand', { expanded })}
                                    variant="plain"
                                    color={color}
                                    spacing="half"
                                    state={state}
                                    size="medium"
                                    align="end"
                                    fullHeight
                                    disabled={disabled || filteredOut}
                                    aria-controls={id}
                                    aria-label="toggle"
                                >
                                    <ExpandDownIcon />
                                </Button>
                            }
                            onOpen={() => setExpanded(true)}
                            onClose={() => setExpanded(false)}
                            // open={expanded} // TODO use `open` instead of imperative open/close commands
                        >
                            {filteredOptions}
                        </Dropdown>
                        {endDecorator}
                    </>
                }
            />
        </div>
    );
}

export type OptionProps<T = string | number, E extends HTMLElement = HTMLElement> = PropsWithChildren<
    {
        value: T;
        label?: string;
        selected?: boolean;
        disabled?: boolean;
        className?: string;
        onClick?: (e: MouseEvent<E>) => void;
    } & RefAttributes<E>
>;

export function Option<T = string | number, E extends HTMLElement = HTMLElement>({
    ref,
    label,
    selected,
    disabled,
    className,
    onClick,
    children,
}: OptionProps<T, E>): JSX.Element {
    return (
        <Interactive
            ref={useForwardedRef(ref)}
            role="option"
            className={cs(cx('Option', { selected, disabled }), className)}
            aria-selected={selected} // TODO use aria-checked for multiple select
            aria-disabled={disabled}
            aria-label={label}
            onClick={disabled ? undefined : onClick}
        >
            {children}
        </Interactive>
    );
}
