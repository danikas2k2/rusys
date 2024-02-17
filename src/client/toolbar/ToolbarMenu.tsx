import { type DropdownRef } from '@ui/Dropdown';
import { MenuDivider } from '@ui/MenuDivider';
import React, { type FC, useCallback, useRef } from 'react';
import { useLocation } from 'react-router';
import { DetailsBox } from '~/client/details/dialogs/DetailsBox';
import { GroupBox } from '~/client/groups/GroupBox';
import { useToggle } from '~/client/hooks/useToggle';
import { Links } from '~/client/Links';
import { AddMenuItem } from '~/client/toolbar/items/AddMenuItem';
import { DetailsItem } from '~/client/toolbar/items/DetailsItem';
import { GroupsItem } from '~/client/toolbar/items/GroupsItem';
import { SummaryItem } from '~/client/toolbar/items/SummaryItem';
import { VariantsItem } from '~/client/toolbar/items/VariantsItem';
import { ToolbarMenuWrapper } from '~/client/toolbar/ToolbarMenuWrapper';
import { VariantBox } from '~/client/variants/VariantBox';

const AddBoxMap: Partial<Record<Links, FC<{ onClose: () => void }>>> = {
    [Links.DETAILS]: DetailsBox,
    [Links.GROUPS]: GroupBox,
    [Links.VARIANTS]: VariantBox,
};

export function ToolbarMenu() {
    const ref = useRef<DropdownRef>(null);

    const [opened, , open, close] = useToggle();
    const location = useLocation();
    const link = location.pathname as Links;
    const AddBox = AddBoxMap[link];

    const onAddClick = useCallback(() => {
        ref.current?.close();
        open();
    }, [open]);

    return (
        <>
            <ToolbarMenuWrapper ref={ref}>
                {AddBox && <AddMenuItem onClick={onAddClick} />}
                <MenuDivider />
                <DetailsItem current={link === Links.DETAILS} />
                <SummaryItem current={link === Links.SUMMARY} />
                <MenuDivider />
                <GroupsItem current={link === Links.GROUPS} />
                <VariantsItem current={link === Links.VARIANTS} />
            </ToolbarMenuWrapper>
            {AddBox && opened && <AddBox onClose={close} />}
        </>
    );
}
