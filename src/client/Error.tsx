import DangerousIcon from '@icons/Dangerous.svg';
import React, { type PropsWithChildren } from 'react';

export function Error({ children }: PropsWithChildren): JSX.Element {
    return (
        <div role="alert" className="Error">
            <DangerousIcon />
            {children}
        </div>
    );
}
