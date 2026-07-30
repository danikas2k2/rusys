import React from 'react';

import './DialogIcon.pcss';

export interface DialogIconProps extends React.PropsWithChildren {
    /** When set, this becomes the dialog's accessible name (via the header's aria-labelledby) */
    'aria-label'?: string;
}

export function DialogIcon({ children, 'aria-label': ariaLabel }: DialogIconProps): React.ReactElement {
    return (
        <div
            className="dialog-icon"
            role={ariaLabel ? 'img' : undefined}
            aria-label={ariaLabel}
            aria-hidden={ariaLabel ? undefined : true}
        >
            {children}
        </div>
    );
}
