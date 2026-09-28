import { TextInput } from '@mantine/core';
import React, { useCallback, useRef } from 'react';

import { ClearFilterIcon } from '~/components/toolbar/ClearFilterIcon';
import { useQuickFilter } from '~/features/filters/QuickFilterContext';
import { useLabel } from '~/lib/hooks/useLabel';

export function ToolbarFilter() {
    const [filter, setFilter] = useQuickFilter();
    const inputRef = useRef<HTMLInputElement>(null);
    const handleInput = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        (e) => setFilter(e.currentTarget.value),
        [setFilter]
    );
    const handleClear = useCallback(() => {
        setFilter('');
        inputRef.current?.focus();
    }, [setFilter]);

    return (
        <TextInput
            ref={inputRef}
            type="search"
            placeholder={useLabel('type to filter')}
            value={filter}
            onChange={handleInput}
            rightSection={filter ? <ClearFilterIcon onClick={handleClear} /> : null}
            style={{ width: '100%' }}
        />
    );
}
