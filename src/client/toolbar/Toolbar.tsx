import Input from '@ui/Input';
import React, { type FormEvent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import useLabel from '~/client/hooks/useLabel';
import AddButton from '~/client/toolbar/AddButton';
import LogoutButton from '~/client/user/LogoutButton';
import { setFilterAction } from '~/store/filter/actions';
import './Toolbar.less';

export default function Toolbar() {
    const dispatch = useDispatch();
    const placeholder = useLabel('type to filter');
    const handleInput = useCallback(
        (e: FormEvent<HTMLInputElement>) => {
            dispatch(setFilterAction(e.currentTarget.value));
        },
        [dispatch]
    );
    return (
        <div className="Toolbar">
            <div>
                <AddButton />
            </div>
            <div className="title">
                <Input inputMode="search" fullWidth color="primary" placeholder={placeholder} onInput={handleInput} />
            </div>
            <div className="icon">
                <LogoutButton />
            </div>
        </div>
    );
}
