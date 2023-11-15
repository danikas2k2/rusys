import { isEqual } from 'lodash';
import React, { memo } from 'react';
import { useLabel } from '~/client/hooks/useLabel';

interface LabelProps {
    children: string;
    locale?: string;
}

export default memo(function Label({ children, locale }: LabelProps) {
    return <span>{useLabel(children, locale)}</span>;
}, isEqual);
