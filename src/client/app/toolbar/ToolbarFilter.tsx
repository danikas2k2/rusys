import CancelIcon from '@assets/cancel.svg';

import React, { useCallback, type FormEvent } from 'react';

import { Button } from '@ui/Button';
import { Input } from '@ui/Input';

import { useQuickFilterContext } from '~/client/app/filters/QuickFilterContext';
import { useLabel } from '~/client/app/hooks/useLabel';

export function ToolbarFilter() {
    const placeholder = useLabel('type to filter');
    const [filter = '', setFilter] = useQuickFilterContext();
    const clearLabel = useLabel('Clear');
    const handleInput = useCallback((e: FormEvent<HTMLInputElement>) => setFilter(e.currentTarget.value), [setFilter]);
    const handleClear = useCallback(() => setFilter(''), [setFilter]);
    return (
        <Input
            mode="search"
            fullWidth
            placeholder={placeholder}
            onInput={handleInput}
            value={filter}
            endDecorator={
                filter ? (
                    <Button onClick={handleClear} spacing="small" variant="plain" color="blue">
                        <CancelIcon aria-label={clearLabel} />
                    </Button>
                ) : null
            }
        />
    );
}
