import CancelIcon from '@icons/Cancel.svg';
import Button from '@ui/Button';
import Input from '@ui/Input';
import { isEqual } from 'lodash';
import React, { type FormEvent, memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useLabel from '~/client/hooks/useLabel';
import ToolbarMenu from '~/client/toolbar/ToolbarMenu';
import LogoutButton from '~/client/user/LogoutButton';
import { type BaseState } from '~/store/base/types';
import { setFilterAction } from '~/store/filter/actions';
import cx from './Toolbar.less';

export default memo(function Toolbar() {
    const placeholder = useLabel('type to filter');

    const filter = useSelector((state: BaseState) => state.filter);

    const dispatch = useDispatch();
    const handleInput = useCallback(
        (e: FormEvent<HTMLInputElement>) => {
            dispatch(setFilterAction(e.currentTarget.value));
        },
        [dispatch]
    );

    const handleClear = useCallback(() => {
        dispatch(setFilterAction(''));
    }, [dispatch]);

    return (
        <div className={cx('Toolbar')}>
            <div>
                <ToolbarMenu />
            </div>
            <div className={cx('title')}>
                <Input
                    inputMode="search"
                    fullWidth
                    color="primary"
                    placeholder={placeholder}
                    onInput={handleInput}
                    value={filter}
                    endDecorator={
                        filter ? (
                            <Button onClick={handleClear} spacing="small" variant="plain" color="primary">
                                <CancelIcon />
                            </Button>
                        ) : undefined
                    }
                />
            </div>
            <div className={cx('icon')}>
                <LogoutButton />
            </div>
        </div>
    );
}, isEqual);
