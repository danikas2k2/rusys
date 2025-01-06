import { type ButtonProps } from '@ui/Button';
import Dropdown, { type DropdownProps } from '@ui/Dropdown';
import Interactive from '@ui/Interactive';
import { isEqual } from 'lodash';
import React, { type ForwardedRef, forwardRef, HTMLAttributes, memo } from 'react';
import useForwardedRef from '~/ui/hooks/useForwardedRef';
import cx from './Menu.less';

export default memo(function Menu({ className, ...props }: DropdownProps) {
    return <Dropdown className={cx('Menu', className)} {...props} />;
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
            <Interactive ref={useForwardedRef(forwardedRef)} className={cx('MenuItem', className)} {...props}>
                {startDecorator && <div className={cx('start-decorator')}>{startDecorator}</div>}
                <div className={cx('content')}>{children}</div>
                {endDecorator && <div className={cx('end-decorator')}>{endDecorator}</div>}
            </Interactive>
        );
    }),
    isEqual
);

export const MenuDivider = memo(function MenuDivider({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return <div className={cx('MenuDivider', className)} {...props} />;
}, isEqual);
