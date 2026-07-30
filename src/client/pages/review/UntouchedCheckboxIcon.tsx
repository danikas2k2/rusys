import React from 'react';

import { UntouchedCheckIcon } from '@icons';

export interface UntouchedCheckboxIconProps {
    className?: string;
}

// Mantine's Checkbox passes `indeterminate` straight through to the `icon` component - tabler
// icons forward unknown props onto the underlying <svg>, which React then warns about as an
// invalid attribute. This wrapper stops it there instead of forwarding it.
export function UntouchedCheckboxIcon({ className }: UntouchedCheckboxIconProps): React.ReactElement {
    return <UntouchedCheckIcon className={className} />;
}
