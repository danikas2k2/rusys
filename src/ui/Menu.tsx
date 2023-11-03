import type { ButtonProps } from '@ui/Button';
import Button from '@ui/Button';
import { type CommonInputProps } from '@ui/Input';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { type ForwardedRef, forwardRef, memo } from 'react';
import useForwardedRef from '~/ui/hooks/useForwardedRef';
import './Menu.less';

export default memo(
    forwardRef(function Menu(
        { className, ...props }: CommonInputProps<HTMLDivElement>,
        forwardedRef: ForwardedRef<HTMLDivElement>
    ) {
        const ref = useForwardedRef(forwardedRef);
        return <div ref={ref} className={classNames('Menu', className)} {...props} />;
    }),
    isEqual
);

export const MenuButton = memo(
    forwardRef(function MenuButton(
        { className, ...props }: ButtonProps,
        forwardedRef: ForwardedRef<HTMLButtonElement>
    ) {
        const ref = useForwardedRef(forwardedRef);
        return <Button ref={ref} className={classNames('MenuButton', className)} {...props} />;
    }),
    isEqual
);
