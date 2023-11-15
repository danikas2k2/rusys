import CancelIcon from '@icons/Cancel.svg';
import Button from '@ui/Button';
import Input from '@ui/Input';
import { isEqual } from 'lodash';
import React, { type FormEvent, memo, useCallback } from 'react';
import { useLabel } from '~/client/hooks/useLabel';
import ToolbarMenu from '~/client/toolbar/ToolbarMenu';
import LogoutButton from '~/client/user/LogoutButton';
import { useClearFilter } from '~/state/filter/useClearFilter';
import { useFilter } from '~/state/filter/useFilter';
import { useSetFilter } from '~/state/filter/useSetFilter';
import './Toolbar.less';

export default memo(function Toolbar() {
    const placeholder = useLabel('type to filter');
    const filter = useFilter();
    const setFilter = useSetFilter();
    const clearFilter = useClearFilter();
    const handleInput = useCallback((e: FormEvent<HTMLInputElement>) => setFilter(e.currentTarget.value), [setFilter]);
    const handleClear = useCallback(() => clearFilter(), [clearFilter]);

    return (
        <div className="Toolbar">
            <div>
                <ToolbarMenu />
            </div>
            <div className="title">
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
                                <CancelIcon aria-label={useLabel('Clear')} />
                            </Button>
                        ) : null
                    }
                />
            </div>
            <div className="icon">
                <LogoutButton />
            </div>
        </div>
    );
}, isEqual);
