import { TextInput } from '@mantine/core';
import React, { useCallback } from 'react';

import { ClearFilterIcon } from '~/components/toolbar/ClearFilterIcon';
import { useQuickFilter } from '~/features/filters/QuickFilterContext';
import { useLabel } from '~/lib/hooks/useLabel';

export function ToolbarFilter() {
    const [filter, setFilter] = useQuickFilter();
    const handleInput = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        (e) => setFilter(e.currentTarget.value),
        [setFilter]
    );
    const handleClear = useCallback(() => setFilter(''), [setFilter]);

    return (
        <TextInput
            type="search"
            placeholder={useLabel('type to filter')}
            value={filter}
            onChange={handleInput}
            rightSection={filter ? <ClearFilterIcon onClick={handleClear} /> : null}
            style={{ width: '100%' }}
        />
    );
}
