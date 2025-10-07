import React from 'react';

import { useLabel } from '~/client/app/hooks/useLabel';

interface LabelProps {
    children: string;
    locale?: string;
}

export function Label({ children, locale }: LabelProps) {
    return <>{useLabel(children, locale)}</>;
}
