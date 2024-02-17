import CancelIcon from '@icons/Cancel.svg';
import { Button } from '@ui/Button';
import { Input } from '@ui/Input';
import React, { type FormEvent, useCallback } from 'react';
import { useLabel } from '~/client/hooks/useLabel';
import { ToolbarMenu } from '~/client/toolbar/ToolbarMenu';
import { LogoutButton } from '~/client/user/LogoutButton';
import { useClearFilter } from '~/state/filter/useClearFilter';
import { useFilter } from '~/state/filter/useFilter';
import { useSetFilter } from '~/state/filter/useSetFilter';
import cx from './Toolbar.less';

export function Toolbar() {
    const placeholder = useLabel('type to filter');
    const filter = useFilter();
    const setFilter = useSetFilter();
    const clearLabel = useLabel('Clear');
    const clearFilter = useClearFilter();
    const handleInput = useCallback((e: FormEvent<HTMLInputElement>) => setFilter(e.currentTarget.value), [setFilter]);
    const handleClear = useCallback(() => clearFilter(), [clearFilter]);

    return (
        <div className={cx('Toolbar')}>
            <div>
                <ToolbarMenu />
            </div>
            <div className={cx('title')}>
                <Input
                    mode="search"
                    fullWidth
                    color="primary"
                    placeholder={placeholder}
                    onInput={handleInput}
                    value={filter}
                    endDecorator={
                        filter ? (
                            <Button onClick={handleClear} spacing="small" variant="plain" color="primary">
                                <CancelIcon aria-label={clearLabel} />
                            </Button>
                        ) : null
                    }
                />
            </div>
            <div className={cx('icon')}>
                <LogoutButton />
            </div>
        </div>
    );
}
