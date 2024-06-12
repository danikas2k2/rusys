import DeleteIcon from '@icons/Delete.svg';
import EditIcon from '@icons/Edit.svg';
import { Button, ButtonGroup } from '@ui/Button';
import React, { forwardRef, type Ref } from 'react';
import { Label } from '~/client/Label';
import cx from './GroupControls.less';

export const GroupControls = forwardRef(function GroupControls({}, ref: Ref<HTMLDivElement>) {
    return (
        <div ref={ref} className={cx('GroupControls')}>
            <ButtonGroup align="right">
                <Button color="primary" startDecorator={<EditIcon />}>
                    <Label>Edit</Label>
                </Button>
                <Button color="negative" startDecorator={<DeleteIcon />}>
                    <Label>Remove</Label>
                </Button>
            </ButtonGroup>
        </div>
    );
});
