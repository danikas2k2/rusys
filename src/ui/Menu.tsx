import { type ButtonProps } from '@ui/Button';
import Dropdown, { type DropdownProps } from '@ui/Dropdown';
import Interactive from '@ui/Interactive';
import classNames from 'classnames';
import { isEqual } from 'lodash';
import React, { type ForwardedRef, forwardRef, HTMLAttributes, memo } from 'react';
import useForwardedRef from '~/ui/hooks/useForwardedRef';
import './Menu.less';

export default memo(function Menu({ className, ...props }: DropdownProps) {
    return <Dropdown className={classNames('Menu', className)} {...props} />;
}, isEqual);

interface MenuItemProps extends ButtonProps {
    startDecorator?: React.ReactNode;
    endDecorator?: React.ReactNode;
}

export const MenuItem = memo(
    forwardRef(function MenuItem(
        { className, children, startDecorator, endDecorator, ...props }: MenuItemProps,
        forwardedRef: ForwardedRef<HTMLDivElement>
    ) {
        return (
            <Interactive ref={useForwardedRef(forwardedRef)} className={classNames('MenuItem', className)} {...props}>
                {startDecorator && <div className="start-decorator">{startDecorator}</div>}
                <div className="content">{children}</div>
                {endDecorator && <div className="end-decorator">{endDecorator}</div>}
            </Interactive>
        );
    }),
    isEqual
);

export const MenuDivider = memo(function MenuDivider({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={classNames('MenuDivider', className)} {...props} />;
}, isEqual);
