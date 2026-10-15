import React from 'react';

export default function Link({ prefetch: _prefetch, ...props }: React.ComponentProps<'a'> & { prefetch?: boolean }) {
    return <a aria-label={props['aria-label'] ?? props.href ?? 'Link'} {...props} />;
}
