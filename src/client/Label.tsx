import React, { memo } from 'react';
import useLabel from '~/client/hooks/useLabel';

interface LabelProps {
    children: string;
    locale?: string;
}

export default memo(function Label({ children, locale }: LabelProps): JSX.Element {
    return <span>{useLabel(children, locale)}</span>;
});
