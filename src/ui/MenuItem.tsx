import { type ButtonProps } from '@ui/Button';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { Interactive } from '@ui/Interactive';
import React, { type ForwardedRef, forwardRef } from 'react';
import cx from './MenuItem.less';

interface MenuItemProps extends ButtonProps {
    startDecorator?: React.ReactNode;
    endDecorator?: React.ReactNode;
}

export const MenuItem = forwardRef(function MenuItem(
    { className, children, startDecorator, endDecorator, ...props }: MenuItemProps,
    forwardedRef: ForwardedRef<HTMLDivElement>
) {
    return (
        <Interactive
            ref={useForwardedRef(forwardedRef)}
            role="menuitem"
            className={cx('MenuItem', className)}
            {...props}
        >
            {startDecorator && <div className={cx('start-decorator')}>{startDecorator}</div>}
            <div className={cx('content')}>{children}</div>
            {endDecorator && <div className={cx('end-decorator')}>{endDecorator}</div>}
        </Interactive>
    );
});
