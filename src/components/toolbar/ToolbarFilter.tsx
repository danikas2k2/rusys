import { TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import React, { useCallback, useEffect, useRef } from 'react';

import { ClearFilterIcon } from '~/components/toolbar/ClearFilterIcon';
import { useQuickFilter } from '~/features/filters/QuickFilterContext';
import { useLabel } from '~/lib/hooks/useLabel';
import { trackFaroEvent } from '~/lib/observability/faro';

export function ToolbarFilter() {
    const [filter, setFilter] = useQuickFilter();
    const inputRef = useRef<HTMLInputElement>(null);
    const reportSearch = useDebouncedCallback(() => trackFaroEvent('search_performed'), {
        delay: 1000,
        leading: false,
        flushOnUnmount: false,
    });
    useEffect(() => {
        if (filter.trim()) {
            reportSearch();
        } else {
            reportSearch.cancel();
        }
        return () => reportSearch.cancel();
    }, [filter, reportSearch]);
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
