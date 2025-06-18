import React from 'react';
import { type ButtonProps } from '@ui/Button';
import { useForwardedRef } from '@ui/hooks/useForwardedRef';
import { Interactive } from '@ui/Interactive';
import cx from './MenuItem.pcss';

interface MenuItemProps extends ButtonProps {
    startDecorator?: React.ReactNode;
    endDecorator?: React.ReactNode;
}

export function MenuItem({ ref, className, children, startDecorator, endDecorator, ...props }: MenuItemProps) {
    return (
        <Interactive ref={useForwardedRef(ref)} role="menuitem" className={cx('MenuItem', className)} {...props}>
            {startDecorator && <div className={cx('start-decorator')}>{startDecorator}</div>}
            <div className={cx('content')}>{children}</div>
            {endDecorator && <div className={cx('end-decorator')}>{endDecorator}</div>}
        </Interactive>
    );
}
